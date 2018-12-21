'use strict';

module.exports = function(app) {
  var myTrainList = require('../controllers/myTrainListController');

  app.route('/stations')
    .post(myTrainList.lookup_stations);
    
  app.route('/trains')
    .post(myTrainList.lookup_trains);

};