/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

    //nodemon gta-server.js -> aktualisiert ständig. :)

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */
app.use(express.static('./public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTag(latitude, longitude, label, hashtag){
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = label;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
const ModuleGT = (function(){
    let geoArray = [];
    let calculateRadius = function (lat, lat2, lon, lon2){
        return Math.sqrt(Math.pow(lat - lat2, 2) + Math.pow(lon - lon2, 2));
    }

    return {

        searchRadius: function(latitude, longitude, radius){
            let rad = [];
            for(let i = 0; i < geoArray.length; i++){
                let actualTag = geoArray[i];
                if(calculateRadius(latitude, geoArray[i].latitude, longitude, geoArray[i].longitude) <= radius){
                    rad.push(actualTag);
                }
            }
            return rad;
        },

        searchLabel: function(label){
            let tagLabel = [];
            for(let i = 0; i < geoArray.length; i++){
                if(geoArray[i].name === label){
                    tagLabel.push(geoArray[i]);
                }
            }
            return tagLabel;

        },

        addGeoTag: function(latitude, longitude, label, hashtag){
            geoArray.push(new GeoTag(latitude, longitude, label, hashtag));
        },

        deleteGeoTag: function(name){
            for(let i = 0; i < geoArray.length; i++){
                if(geoArray[i].name === name){
                    geoArray.splice(i,1);
                    i--
                }
            }
        },
    }
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

app.post('/tagging', function(req,res){
    ModuleGT.addGeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag)
    res.render('gta', {
        taglist: ModuleGT.searchRadius(req.body.latitude, req.body.longitude, 1),
        latitude: req.body.latitude,
        longitude: req.body.longitude
    });
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.post('/discovery', function(req,res){

    res.render('gta', {
        taglist: ModuleGT.searchLabel(req.body.search),
    });
});


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);