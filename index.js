var http = require('http')
    , fs = require('fs')
    , path = require('path')
    , zlib = require('zlib')
    , xml2js = require('xml2js')
    , moment = require('moment');

var url = 'http://www.vuplus-community.net/rytec/rytecxmltvItaly.gz'
    , filename = 'source_epg.xml'
    , output = 'epg.xml'
    , mapping = JSON.parse(fs.readFileSync(__dirname + '/mapping.json', 'utf8'))
    , dateFormat = 'YYYYMMDDHHmmss Z';

var channels = mapping.map(function(e) { return e.search });

http.get(url, function(response) {
    var gunzip = zlib.createGunzip();
    var stream = response.pipe(gunzip).pipe(fs.createWriteStream(path.join(__dirname, filename)));
    stream.on('finish', function () {
        var parser = new xml2js.Parser();
        fs.readFile(filename, 'utf8', function(err, data) {
            parser.parseString(data, function (err, result) {
                function filterChannels(value) { return channels.indexOf(value.$.id) > 0; };
                function filterPrograms(value) { return channels.indexOf(value.$.channel) > 0 && moment(value.$.start, dateFormat) >= moment().subtract(12, 'hours') && moment(value.$.start, dateFormat) <= moment().add(4, 'hours') ; };
                function renameChannels(channel) {
                    mapping.forEach(function(e) {
                        if (channel.$.id == e.search) {
                            channel.$.id = e.replace;
                            channel["display-name"][0]._ = e.replace;
                        }
                    });
                    return channel;
                }
                function renamePrograms(program) {
                    mapping.forEach(function(e) {
                        if (program.$.channel == e.search) program.$.channel = e.replace;
                    });
                    return program;
                };
                result.tv.channel = result.tv.channel.filter(filterChannels);
                result.tv.channel = result.tv.channel.map(renameChannels);

                result.tv.programme = result.tv.programme.filter(filterPrograms);
                result.tv.programme = result.tv.programme.map(renamePrograms);

                writeXml(output, result, writeCallback);
            });
        });
    });
})

function writeXml(file, doc, callback) {
    var filepath = path.normalize(path.join(__dirname, file));
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(doc);
    fs.writeFile(filepath, xml, callback);
}

function writeCallback() { console.log(path.join(__dirname, output) + " written"); }