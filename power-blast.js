/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 10/24/14.
 */

var fs = require('fs');
var settings = require('./settings.js');
var Query = require('./query.js');

var sqlFiles = {};
var queryQueue = [];
var counter = 0; // used for the temporary tables in pop_in_buffer.sql


function main() {
  if (!fs.existsSync('./output/')) {
    fs.mkdirSync('./output/');
  }
  for (var j = 0; j < settings.bufferSizes.length; j++) {
    var bufSize = settings.bufferSizes[j];
    if (!fs.existsSync('./output/km' + bufSize)) {
      fs.mkdirSync('./output/km' + bufSize);
    }
  }
  var pointTables = settings.pointTables;
  for (var table in pointTables) {

    for (place in settings.projections) {
      if (table.indexOf(place) > -1) {
        var projection = settings.projections[place];
        var country = country;
      }
    }

    for (var k = 0; k < settings.bufferSizes.length; k++) {
      var bufSize = settings.bufferSizes[k];
      var tableDir = './output/km' + bufSize + '/' + table;
      if (!fs.existsSync(tableDir)) {
        fs.mkdirSync(tableDir);
      }
      // get the power set of the array (but first sort the array alphabetically)
      var typePowerSet = powerSet( pointTables[table].sort() );
      console.log('Enqueuing ' + bufSize + ' km power set of queries for ' + table + ' types with a size of ' + typePowerSet.length);
      for (var i = 0, len = typePowerSet.length; i < len; i++) {
        var types = typePowerSet[i];
        if (types.length === 0) {
          continue;
        }
        var filePath = tableDir + '/' + createFileName(types, pointTables[table]) + '.json';
        if ( fs.existsSync( filePath )) {
          continue;
        }
        var typeOrStr = typesSeparatedByOrStr(types);

        // parameters we are passing to the sql script
        var sql = sqlTemplate('pop_in_buffer.sql', {
          counter: ++counter,
          types: typeOrStr,
          table: table,
          bufferSize: bufSize,
          projection: projection,
          country: country
        });

        // queryQueue is an array of objects - one object for each power set
        queryQueue.push({
          types: types,
          sql: sql,
          table: table,
          bufferSize: bufSize
        });
      }
    }
  }

  // We want to do as many queries in parallel as the amount of cores we have in the database.
  dequeueAndQuery1();
  dequeueAndQuery2();
  //dequeueAndQuery3();
  //dequeueAndQuery4();
}


/**
 * Takes an array and returns the power set of that array.
 *
 * This provides the ability to have all combinations of things in a set.
 *
 * http://rosettacode.org/wiki/Power_set#JavaScript
 *
 * @param ary
 * @returns {*[]}
 */
// calculates power set for a given set
function powerSet(ary) {
  var ps = [[]];
  for (var i=0; i < ary.length; i++) {
    for (var j = 0, len = ps.length; j < len; j++) {
      ps.push(ps[j].concat(ary[i]));
    }
  }
  return ps;
}


function typesSeparatedByOrStr(typeArr) {
  var str = "type = '";
  str = str + typeArr.join("' OR type = '") + "'";
  return str;
}

// adding parameters to sql file (for example, km distance, table, etc.)
function sqlTemplate(sqlFile, tplHash) {
  var sql = sqlFiles[sqlFile];
  if (!sql) {
    sqlFiles[sqlFile] = sql = fs.readFileSync('./sql/' + sqlFile, 'utf8');
  }
  if (tplHash) {
    for (var key in tplHash) {
      var exp = '{{' + key + '}}';
      var regex = new RegExp(exp, 'g');
      var val = tplHash[key];
      sql = sql.replace(regex, val);
    }
  }
  return sql;
}

// writing resulting data to json file
function write(bufferSize, dir, fileName, data) {
  var json = JSON.stringify(data);
  fs.writeFile('./output/km' + bufferSize + '/' + dir + '/' + fileName + '.json', json);
  var jsonPretty = JSON.stringify(data, null, 2);
  fs.writeFile('./output/km' + bufferSize + '/' + dir + '/' + fileName + 'pretty.json', jsonPretty);
}


function createFileName(types, allTypes) {
  allTypes = allTypes.sort();
  var indices = [];
  for (var k = 0, len = types.length; k < len; ++k) {
    var type = types[k];
    var idx = allTypes.indexOf(type);
    indices.push(idx);
  }
  fileName = indices.join('-');

  return fileName;
}

/**
 * We have 4 functions that do the same thing. This is so that
 * we maintain the correct file name in the closure with the queries.
 *
 * This should be refactored, but it basically works fine to have
 * 4 queries dequeuing in parallel.
 *
 * A single query only uses one CPU core, so we need a few going
 * at once to make proper use of a multi-core system.
 */


function dequeueAndQuery1() {
  var queryObj = queryQueue.shift(); // remove the first object in the queryQueue list
  if (!queryObj) return;

  var fileName = createFileName(queryObj.types, settings.pointTables[queryObj.table]);
  var query = queryObj.sql;

  console.log('Submitting Query 1: ' + fileName + ' ' + queryObj.types.join(', ') );

  // run sql query in database and parse results
  Query(query, function(err, res) {
    if (res && res.length > 0) {
      var hash = {};
      for (var j = 0, len = res.length; j < len; j++) {
        var row = res[j];
        var hashId = hash[row.id];
        if (!hashId) {
          hashId = hash[row.id] = {};
        }
        hash[row.id] = row;
        delete row.id;
      }
      write(queryObj.bufferSize, queryObj.table, fileName, hash);
      console.log('Writing Query 1: ' + fileName + ' ' + queryObj.types.join(', '));
      dequeueAndQuery1();
    } else if (err) {
      console.error('query failed: ' + err);
      process.abort();
    }
  });
}

function dequeueAndQuery2() {
  var queryObj = queryQueue.shift(); // remove the first object in the queryQueue list
  if (!queryObj) return;

  var fileName = createFileName(queryObj.types, settings.pointTables[queryObj.table]);
  var query = queryObj.sql;

  console.log('Submitting Query 1: ' + fileName + ' ' + queryObj.types.join(', ') );

  // run sql query in database and parse results
  Query(query, function(err, res) {
    if (res && res.length > 0) {
      var hash = {};
      for (var j = 0, len = res.length; j < len; j++) {
        var row = res[j];
        var hashId = hash[row.id];
        if (!hashId) {
          hashId = hash[row.id] = {};
        }
        hash[row.id] = row;
        delete row.id;
      }
      write(queryObj.bufferSize, queryObj.table, fileName, hash);
      console.log('Writing Query 1: ' + fileName + ' ' + queryObj.types.join(', '));
      dequeueAndQuery2();
    } else if (err) {
      console.error('query failed: ' + err);
      process.abort();
    }
  });
}

//function dequeueAndQuery3() {
//  var queryObj = queryQueue.shift();
//  if (!queryObj) return;
//
//  var fileName = createFileName(queryObj.types, settings.pointTables[queryObj.table]);
//  var query = queryObj.sql;
//
//  console.log('Submitting Query 3: ' + fileName + ' ' + queryObj.types.join(', '));
//  Query(query, function(err, res) {
//    if (res && res.length > 0) {
//      var hash = {};
//      for (var j = 0, len = res.length; j < len; j++) {
//        var row = res[j];
//        var hashId = hash[row.id];
//        if (!hashId) {
//          hashId = hash[row.id] = {};
//        }
//        hashId[row.landuse] = row;
//        delete row.id;
//        delete row.landuse;
//      }
//      write(queryObj.bufferSize, queryObj.table, fileName, hash);
//      console.log('Writing Query 3: ' + fileName + ' ' + queryObj.types.join(', '));
//      dequeueAndQuery3();
//    } else if (err) {
//      console.error('query failed: ' + err);
//      process.abort();
//    }
//  });
//}

//function dequeueAndQuery4() {
//  var queryObj = queryQueue.shift();
//  if (!queryObj) return;
//
//  var fileName = createFileName(queryObj.types, settings.pointTables[queryObj.table]);
//  var query = queryObj.sql;
//
//  console.log('Submitting Query 4: ' + fileName + ' ' + queryObj.types.join(', '));
//  Query(query, function(err, res) {
//    if (res && res.length > 0) {
//      var hash = {};
//      for (var j = 0, len = res.length; j < len; j++) {
//        var row = res[j];
//        var hashId = hash[row.id];
//        if (!hashId) {
//          hashId = hash[row.id] = {};
//        }
//        hashId[row.landuse] = row;
//        delete row.id;
//        delete row.landuse;
//      }
//      write(queryObj.bufferSize, queryObj.table, fileName, hash);
//      console.log('Writing Query 4: ' + fileName + ' ' + queryObj.types.join(', '));
//      dequeueAndQuery4();
//    } else if (err) {
//      console.error('query failed: ' + err);
//      process.abort();
//    }
//  });
//}

main();
