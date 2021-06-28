/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

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

app.use(bodyParser.json());

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN

function GeoTag(latitude, longitude, name, hashtag, id){

    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
    this.id = id;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN

const ModuleGT = (function(){

    let geoArray = [];

    let calculateRadius = function(lat, lat2, lon, lon2){
        return Math.sqrt(Math.pow(lat - lat2, 2) + Math.pow(lon - lon2,2))
    }

    return {

        searchRadius: function (latitude, longitude, radius) {
            let rad = [];
            for (let i = 0; i < geoArray.length; i++) {
                if (calculateRadius(latitude, geoArray[i].latitude, longitude, geoArray[i].longitude) <= radius) {
                    rad.push(geoArray[i]);
                }
            }
            return rad;

        },

        searchLabel: function (label) {
            let tagLabel = [];
            for (let i = 0; i < geoArray.length; i++) {
                if (geoArray[i].name === label || geoArray[i].hashtag === label) {
                    tagLabel.push(geoArray[i]);
                }
            }
            return tagLabel;

        },

        addGeoTag: function (latitude, longitude, name, hashtag) {
            const geoTagId = geoArray.length;
            geoArray.push(new GeoTag(latitude, longitude, name, hashtag, geoTagId));
            return geoTagId;
        },

        deleteGeoTag: function(name){
            for(let i = 0; i < geoArray.length; i++){
                if(geoArray[i].name === name){
                    geoArray.splice(i, 1);
                    i--;
                }
            }
        },

        getGeoTagById: function(id){
            let identification = null;
            if(id >= 0){
                for(let i = 0; i < geoArray.length; i++){
                    if(geoArray[i].id === id){
                        identification = new GeoTag(geoArray[i].latitude, geoArray[i].longitude, geoArray[i].name, geoArray[i].hashtag, geoArray[i].id);
                    }
                }
            }
            return identification;
        },
    };
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
        taglist: [],
        latitude: "",
        longitude: ""
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
        latitude: req.body.latitude,
        longitude: req.body.longitude
    });
});


/*
*   REST API
*/

// POST Rest-API creates a new GeoTag
app.post('/geotags', function(req, res){
        const geoTagId = ModuleGT.addGeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag)
        res.setHeader("Content-type", "application/json")
        res.location('/geotags/' + geoTagId)
        console.log("Location: /geotags/" + geoTagId)
        res.statusCode = 201;
        res.send(ModuleGT.searchRadius(req.body.latitude, req.body.longitude, 1))
});

// GET Rest-API reads the id of the GeoTag
app.get('/geotags/:id', function(req, res){
    const geoTag = ModuleGT.getGeoTagById(req.params.id)
    res.send((geoTag === null)? "[]" : geoTag)

});

// GET Rest-API that searches the "database" for similar results
app.get('/geotags', function (req,res){
    const search = req.query.search

    res.send(ModuleGT.searchLabel(search))

});

// PUT Rest-API that updates existing GeoTags
app.put('/geotags', function(req, res){
    const nameCheck = ModuleGT.searchLabel(req.body.name)

    if (nameCheck[0] !== undefined){
        ModuleGT.deleteGeoTag(req.body.name)
        ModuleGT.addGeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag)
        res.send(ModuleGT.searchRadius(req.body.latitude, req.body.longitude, 1))
    }else{
        console.error("No GeoTag to Update!")
    }

});

// DELETE REST-API that deletes GeoTags
app.delete('/geotags',function(req, res){
    const remove = req.query.remove;
    const search = ModuleGT.searchLabel(remove)

    if(search[0] !== undefined){
        ModuleGT.deleteGeoTag(remove);
        res.send(ModuleGT.searchLabel(remove));

    }else{
        console.error("Nothing to delete.")
    }
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