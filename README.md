EPG download & transform
======================

Scarica l'xml della guida tv, lo scompatta, filtra e rinomina i canali e salva il nuovo xml.

#Utilizzo

Eseguire:

```
$ npm start

> epg@1.0.0 start /Users/andrea/dev/node/epg-download-and-transform
> node index.js

/Users/andrea/dev/node/epg-download-and-transform/epg.xml written
```

Infine pubblicare il file epg.xml

#Configurazioni
Per aggiungere nuovi canali oppure per rinominarli, aprire il file mapping.json e apportare le modifiche.
NB In caso si vogliano aggiungere nuovi canali, verificare il nome corretto presente nel file xml sorgente.