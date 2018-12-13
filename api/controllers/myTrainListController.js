const fs = require("fs");
const parser = require("xml2json");

let xmlData = fs.readFileSync("./stations.xml");
var stationList = parser.toJson(xmlData, {object: true});
var points = buildTree(stationList.StationList.Station);

exports.lookup_stations = function(req, res) {
  var lon = req.body.lon;
  var lat = req.body.lat;
  points = findDistance(points, { lat: lat, lon: lon });
  res.json(points.sort(compareDistance).slice(0, 3));
};

function findDistance(points, target) {
  points.forEach(function(station) {
    station.distance = distance(station, target);
  });
  return points;
}

function distance(a, b) {
  return Math.pow(a.lat - b.lat, 2) + Math.pow(a.lon - b.lon, 2);
}

function compareDistance(a, b) {
  if (a.distance < b.distance) return -1;
  if (a.distance > b.distance) return 1;
  return 0;
}

function buildTree(stationArray) {
  points = [];
  stationArray.forEach(function(station) {
    points.push({
      lat: parseFloat(station.Latitude),
      lon: parseFloat(station.Longitude),
      station: { name: station.Name, crs: station.CrsCode }
    });
  });
  return points;
}
