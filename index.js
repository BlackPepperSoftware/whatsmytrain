const fs = require('fs');
const parser = require('xml2json');
var kd = require('kdtree');
let xmlData = fs.readFileSync('./stations.xml'); 

var options = {
    object: true,
    reversible: false,
    coerce: false,
    sanitize: true,
    trim: true,
    arrayNotation: false,
    alternateTextNode: false
};

var stationList = parser.toJson( xmlData, options );

var tree = new kd.KDTree(2);
buildTree(stationList.StationList.Station, tree);
var answer = tree.nearestRange(52.284, -1.559, 0.1);
console.log(JSON.stringify(answer));

function buildTree(stationArray, tree) {
    stationArray.forEach(function(station){
        tree.insert(station.Latitude, station.Longitude, {name: station.Name, crs: station.CrsCode});
    });
}

//stationList.StationList.Station.forEach(function(station){
//    console.log(station.Name);
//  });

//let data = JSON.stringify(jsonObj);

//fs.writeFileSync('stations.json', data); 