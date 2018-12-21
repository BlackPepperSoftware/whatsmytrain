const fs = require("fs");
const parser = require("xml2json");
const rp = require('request-promise');
const stationJson = require('../../stations.json');

var stationList = JSON.parse(stationJson);
var points = buildTree(stationList.StationList.Station);

//let xmlData = fs.readFileSync("./stations.xml");
//var stationList = parser.toJson(xmlData, {object: true});
//var points = buildTree(stationList.StationList.Station);

exports.lookup_stations = function(req, res) {
  var lon = req.body.lon;
  var lat = req.body.lat;
  points = findDistance(points, { lat: lat, lon: lon });
  res.json(points.sort(compareDistance).slice(0, 3));
};

exports.lookup_trains = function lookup_trains(req, res) {
  var lon = req.body.lon;
  var lat = req.body.lat;
  points = findDistance(points, { lat: lat, lon: lon });
  var stations = points.sort(compareDistance).slice(0, 3)
  
  Promise.all([
    showDepartureBoard(stations[0].station.crs, stations[1].station.crs).catch(err => console.log(err)),
    showDepartureBoard(stations[0].station.crs, stations[2].station.crs).catch(err => console.log(err)),
    showDepartureBoard(stations[1].station.crs, stations[0].station.crs).catch(err => console.log(err)),
    showDepartureBoard(stations[1].station.crs, stations[2].station.crs).catch(err => console.log(err)),
    showDepartureBoard(stations[2].station.crs, stations[0].station.crs).catch(err => console.log(err)),
    showDepartureBoard(stations[2].station.crs, stations[1].station.crs).catch(err => console.log(err))
  ])
  .then(function(responces) {
    res.json(processDepartureBoards(responces, stations));
  })
  .catch(function(err) {
    console.log('error: ' + err);
  });

};

function processDepartureBoards(responces, stations) {
  answer = {'stations' : stations};
  var trains = [];
  for(let responce of responces) {
    let services = parser.toJson(responce, {object:true});
    let trainList = showTrains(services);
    trains = trains.concat(trainList);
  }
  answer.trains = trains;
  return answer;
}

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

function buildPayload(src, dest) {
  payload =
    '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" \
    xmlns:ns1="http://thalesgroup.com/RTTI/2016-02-16/ldb/" \
    xmlns:ns2="http://thalesgroup.com/RTTI/2013-11-28/Token/types">\
    <SOAP-ENV:Header>\
      <ns2:AccessToken>\
        <ns2:TokenValue>85bde6f3-e920-46be-961c-3d32a6128f84</ns2:TokenValue>\
      </ns2:AccessToken>\
    </SOAP-ENV:Header>\
    <SOAP-ENV:Body>\
      <ns1:GetDepartureBoardRequest>\
        <ns1:numRows>4</ns1:numRows>\
        <ns1:crs>'
        + src +
        '</ns1:crs>\
        <ns1:filterCrs>'
        + dest +
        '</ns1:filterCrs>\
        <ns1:filterType>to</ns1:filterType>\
        <ns1:timeOffset>-30</ns1:timeOffset>\
        <ns1:timeWindow>29</ns1:timeWindow>\
      </ns1:GetDepartureBoardRequest>\
    </SOAP-ENV:Body>\
  </SOAP-ENV:Envelope>';

  return payload;
}

async function showDepartureBoard(src, dest) {
  // Configure the request
  var payload = buildPayload(src, dest);
  var options = {
    url: 'http://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb9.asmx',
    SOAPAction: 'http://thalesgroup.com/RTTI/2012-01-13/ldb/GetDepartureBoard',
      method: 'POST',
      headers: {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'text/xml'},
      body: payload
  }

  try {
    return await rp(options);
  } catch(err) {
    console.log("SOAP Error " +err);
  }

}

function showTrains(result) {
  var answer = [];
  var departureBoardResponse = result['soap:Envelope']['soap:Body']['GetDepartureBoardResponse'];
  var stationBoard = departureBoardResponse['GetStationBoardResult'];
  var services = stationBoard['lt5:trainServices'];

  if (services) {
    if (services['lt5:service'].map) {
      services['lt5:service'].map(function (service) {
        answer.push(showTrainTimes(service, stationBoard));
      });
    } else {
      var service = services['lt5:service'];
      answer.push(showTrainTimes(service, stationBoard));
    }
  }
  return answer;
}

function showTrainTimes(service, stationBoard) {
  return {
    'from':stationBoard['lt4:locationName'],
    'to':stationBoard['lt4:filterLocationName'],
    'scheduledDep': service['lt4:std'],
    'actualDep' : service['lt4:etd']
  };
}
