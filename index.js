/*
*
*  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
*  Bangalore, India. All Rights Reserved.
*
*/

// require('nashorn-polyfill');
// require('core-js/modules/es6.object.assign');

const decisionTable = require('./utils/helper/decision-table-xml.js');
const dateTime = require('./utils/built-in-functions/date-time-functions');

const dmnEvalJs = {
  decisionTable,
  dateTime,
};

dmnEvalJs.use = function (plugin) {
  plugin.call(this);
};

module.exports = dmnEvalJs;
