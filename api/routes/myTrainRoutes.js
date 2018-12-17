'use strict';
module.exports = function(app) {
  var myTrainList = require('../controllers/myTrainListController');

  // myTrain 
  app.route('/stations')
    .post(myTrainList.lookup_stations);
    
  app.route('/trains')
    .post(myTrainList.lookup_trains);

    //  app.route('/trains/:trainId')
//    .get(myTrainList.read_a_task)
//    .put(myTrainList.update_a_task)
//    .delete(myTrainList.delete_a_task);

};