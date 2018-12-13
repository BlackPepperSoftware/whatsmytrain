var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/myTrainRoutes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('Find stations RESTful API server started on: ' + port);