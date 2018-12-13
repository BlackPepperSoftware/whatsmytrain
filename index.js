const fs = require('fs');
const parser = require('xml2json');
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

var points = buildTree(stationList.StationList.Station);

points = findDistance(points, {lat:52.284, lon:-1.559});

var answer = points.sort(compareDistance);
console.log(JSON.stringify(answer));

console.log(JSON.stringify(answer.slice(0,3)));

function distance(a, b){
    return Math.pow(a.lat - b.lat, 2) +  Math.pow(a.lon - b.lon, 2);
}

function findDistance(points, target) {
    points.forEach(function(station){
        station.distance = distance(station, target);
        //console.log(station.station.name + " " + station.distance);
    });
    return points;
}

function buildTree(stationArray) {
    points = [];
    stationArray.forEach(function(station){
        points.push({
            lat: parseFloat(station.Latitude),
            lon: parseFloat(station.Longitude),
            station: {name: station.Name, crs: station.CrsCode}
          });
    });
    return points;
}

function compareDistance(a, b) {
  if (a.distance < b.distance)
    return -1;
  if (a.distance > b.distance)
    return 1;
  return 0;

}

//stationList.StationList.Station.forEach(function(station){
//    console.log(station.Name);
//  });

//let data = JSON.stringify(jsonObj);

//fs.writeFileSync('stations.json', data); points