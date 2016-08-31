/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 10/24/14.
 */

var pg = require('pg');
var settings  = require('./settings.js');

// PostGIS Connection String
var conString = "postgres://" +
    settings.postgres.user + ":" +
    settings.postgres.password + "@" +
    settings.postgres.server + ":" +
    settings.postgres.port + "/" +
    settings.postgres.database;

module.exports = function(queryStr, cb) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      console.error('error fetching client from pool', err);
    }
    client.query(queryStr, function(queryerr, result) {
      //call `done()` to release the client back to the pool

      done();

      if(queryerr) {
        console.error('ERROR RUNNING QUERY:', queryStr, queryerr);
      }

      cb((err || queryerr), (result && result.rows ? result.rows : result));
    });
  });
};
