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
                result.tv.channel = result.tv.channel.filter(function(value) { return channels.indexOf(value.$.id) > 0; });
                result.tv.programme = result.tv.programme.filter(function(value) {
                    return channels.indexOf(value.$.channel) > 0 &&
                        (
                            moment(value.$.start, dateFormat) >= moment().subtract(12, 'hours') &&
                            moment(value.$.start, dateFormat) <= moment().add(4, 'hours')
                        );
                });
                result.tv.channel = result.tv.channel.map(function(channel) {
                    mapping.forEach(function(e) {
                        if (channel.$.id == e.search) {
                            channel.$.id = e.replace;
                            channel["display-name"][0]._ = e.replace;
                        }
                    });
                    return channel;
                });
                result.tv.programme = result.tv.programme.map(function(program) {
                    mapping.forEach(function(e) {
                        if (program.$.channel == e.search) program.$.channel = e.replace;
                    });
                    return program;
                });

                var filepath = path.normalize(path.join(__dirname, output));
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(result);
                fs.writeFile(filepath, xml, function() {
                    console.log(path.join(__dirname, output) + " written");
                });
            });
        });
    });
})
