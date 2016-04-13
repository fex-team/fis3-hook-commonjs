var jstransform = require('jstransform');
var createAmdVisitors = require('./lib/visitors/amd');
var visitors = createAmdVisitors();

module.exports = function(content) {
  return jstransform.transform(visitors, content).code;
}
