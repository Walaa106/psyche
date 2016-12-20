/**
 * Main application routes
 */

'use strict';

module.exports = function(app) {
  app.use('/api/properties', require('./api/property'));
};