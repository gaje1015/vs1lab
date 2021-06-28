/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

var ajax = new XMLHttpRequest();
// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier API Key eintragen
    var apiKey = "vloXuLH4uSQdQu9x3aSK1mxJ8DUqsemf";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function() {

            tryLocate(function(geoLocationApi){

                if(document.getElementById("latitude").value !== "" && document.getElementById("longitude").value !== ""){
                    console.log("no API needed")
                    var latitude = document.getElementById("latitude").value;
                    var longitude = document.getElementById("longitude").value;

                }else{
                    var latitude = getLatitude(geoLocationApi);
                    var longitude = getLongitude(geoLocationApi);
                    document.getElementById("latitude").value= latitude;
                    document.getElementById("longitude").value= longitude;
                    document.getElementById("filter-latitude").value= latitude;
                    document.getElementById("filter-longitude").value= longitude;
                    console.log("API needed")
                }
                console.log("Successfully found position.")
                console.log(document.getElementById('latitude').value)
                console.log(document.getElementById('longitude').value)

                let taglist_json = document.getElementById("result-img").getAttribute("data-tags")
                document.getElementById("result-img").src = getLocationMapSrc(latitude, longitude, JSON.parse(taglist_json), 14);

            }, function(){
                alert("Error: Coordinates are invalid.")
            });

        }

    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    // alert("Please change the script 'geotagging.js'");
    //gtaLocator.updateLocation();

    ajax.onreadystatechange = function() {

        if (ajax.readyState === 4){
            const jsonResponse = JSON.parse(ajax.responseText)
            document.getElementById("results").innerHTML =""
            for(let i=0; i< jsonResponse.length; i++){
                document.getElementById("results").innerHTML += "<li>" + jsonResponse[i].name
                    +" (" + jsonResponse[i].latitude + ", "
                    + jsonResponse[i].longitude +" ) "
                    + jsonResponse[i].hashtag + "</li>"
            }
            gtaLocator.updateLocation()
        }
    }

    // Submit Button Event Listener
    document.getElementById("submitGT").addEventListener("click", function(event){

            ajax.open('POST', '/geotags', true)
            ajax.setRequestHeader("Content-type", "application/json")

        const json = {
            "latitude": document.getElementById("latitude").value,
            "longitude": document.getElementById("longitude").value,
            "name": document.getElementById("name").value,
            "hashtag": document.getElementById("hashtag").value,
        };

        ajax.send(JSON.stringify(json))
    });

    // Update Button Event Listener
    document.getElementById("update").addEventListener("click", function(event){

        ajax.open('PUT', '/geotags', true)
        ajax.setRequestHeader("Content-type", "application/json")

        const json = {
            "latitude": document.getElementById("latitude").value,
            "longitude": document.getElementById("longitude").value,
            "name": document.getElementById("name").value,
            "hashtag": document.getElementById("hashtag").value,
        };

        ajax.send(JSON.stringify(json));
    });


    // Search Button Event listener
    document.getElementById("submitD").addEventListener("click", function(event){

        ajax.open('GET', '/geotags?search=' + document.getElementById("search").value, true)
        ajax.setRequestHeader("Content-type", "application/json")

       ajax.send(null)

    });

    // Delete Button Event Listener
    document.getElementById("delete").addEventListener("click", function(event){

        ajax.open('DELETE', '/geotags?remove=' + document.getElementById("search").value, true)
        ajax.setRequestHeader("Content-type", "application/json")

        ajax.send(null);

    });
});