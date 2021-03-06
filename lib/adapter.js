/**
 * Module Dependencies
 */

var util = require('util');
var path = require('path');
var WLError = require(path.join(path.dirname(require.resolve('waterline')), 'waterline/error/WLError.js'));
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;

/**
 * oracle-sp
 *
 */
module.exports = (function () {


  var connections = {};

  var adapter = {

    syncable: false,

    // Default configuration for connections
    defaults: {
    },

    /**
     *
     * This method runs when a model is initially registered
     * at server-start-time.  This is the only required method.
     *
     * @param  {[type]}   connection [description]
     * @param  {[type]}   collection [description]
     * @param  {Function} cb         [description]
     * @return {[type]}              [description]
     */
    registerConnection: function(connection, collections, cb) {

      if(!connection.identity) return cb(new Error('Connection is missing an identity.'));
      if(!connection.cursorName) return cb(new Error('Connection is missing cursorName'));
      if(connections[connection.identity]) return cb(new Error('Connection is already registered.'));

      oracledb.getConnection({
        user: connection.user,
        password: connection.password,
        connectString: connection.connectString
      },
        function(error, newConnection){
          if(error) {
            sails.log.error('oracle-sp: Could not connect to database');
            return cb('oracle-sp: Could not connect to database');
          }
          connections[connection.identity] = {};
          connections[connection.identity].package = connection.package;
          connections[connection.identity].cursorName = connection.cursorName;
          connections[connection.identity].customExceptions = [];
          connections[connection.identity].oracledb = newConnection;
          sails.log.silly('oracle-sp: Connected');
          if(connection.findCustomExceptions) {
            adapter.findCustomExceptions(connection.identity, connection.findCustomExceptions, cb);
          } else {
            cb();
          }
      });
    },

    /**
     * Fired when a model is unregistered, typically when the server
     * is killed. Useful for tearing-down remaining open connections,
     * etc.
     *
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
    // Teardown a Connection
    teardown: function (conn, cb) {

      // TODO: disconnect here
      if (typeof conn == 'function') {
        cb = conn;
        conn = null;
      }
      if (!conn) {
        connections = {};
        return cb();
      }
      if(!connections[conn]) return cb();
      delete connections[conn];
      cb();
    },


    // Return attributes
    describe: function (connection, collection, cb) {
      return cb();
    },

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    define: function (connection, collection, definition, cb) {
      return cb();
    },

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    drop: function (connection, collection, relations, cb) {
      return cb();
    },

    /**
     *
     * REQUIRED method if users expect to call Model.find(), Model.findOne(),
     * or related.
     *
     * You should implement this method to respond with an array of instances.
     * Waterline core will take care of supporting all the other different
     * find methods/usages.
     *
     */
    find: function (connection, collection, options, cb) {
      var queryString = '';
      var results = [];
      var bindVars = {};

      sails.log.silly('oracle-sp: find');

      queryString += 'BEGIN ';
      queryString += connections[connection].package + '.';
      queryString += collection + '_R(';
      queryString += adapter._processOptions(options, bindVars);
      queryString += adapter._processCursor(connections[connection].cursorName, bindVars);
      queryString += '); END;';

      sails.log.silly(queryString);
      sails.log.silly(bindVars);

      connections[connection].oracledb.execute(queryString, bindVars, function(err, resultSet) {
        if(err) {
          return cb(adapter.processOracleError(err, connection));
        }
        adapter._fetchRowsFromRS(resultSet, cb);
      });
    },

    create: function (connection, collection, values, cb) {
      var queryString = '';
      var results = [];
      var bindVars = {};

      sails.log.silly('oracle-sp: create');

      queryString += 'BEGIN ';
      queryString += connections[connection].package + '.';
      queryString += collection + '_C(';
      queryString += adapter._processValues(values, bindVars);
      queryString += adapter._processCursor(connections[connection].cursorName, bindVars);
      queryString += '); END;';

      sails.log.silly(queryString);
      sails.log.silly(bindVars);

      connections[connection].oracledb.execute(queryString, bindVars, function(err, resultSet) {
        if(err) {
          return cb(adapter.processOracleError(err, connection));
        }
        adapter._fetchRowsFromRS(resultSet, function(err, results) {
          if(err) {
            return cb(err);
          }
          cb(null, results[0]);
        });
      });
    },

    update: function (connection, collection, options, values, cb) {
      var queryString = '';
      var bindVars = {};

      sails.log.silly('oracle-sp: update');

      queryString += 'BEGIN ';
      queryString += connections[connection].package + '.';
      queryString += collection + '_U(';
      queryString += adapter._processOptions(options, bindVars);
      queryString += adapter._processValues(values, bindVars);
      queryString += '); END;';

      sails.log.silly(queryString);
      sails.log.silly(bindVars);

      connections[connection].oracledb.execute(queryString, bindVars, function(err, result) {
        if(err) {
          return cb(adapter.processOracleError(err, connection));
        } else {
          return cb(null, options.where);
        }
      });
    },

    destroy: function (connection, collection, options, cb) {
      var queryString = '';
      var bindVars = {};

      sails.log.silly('oracle-sp: destroy');

      queryString += 'BEGIN ';
      queryString += connections[connection].package + '.';
      queryString += collection + '_D(';
      queryString += adapter._processOptions(options, bindVars);
      queryString += '); END;';

      sails.log.silly(queryString);
      sails.log.silly(bindVars);

      connections[connection].oracledb.execute(queryString, bindVars, function(err, result) {
        if(err) {
          return cb(adapter.processOracleError(err, connection));
        } else {
          return cb(null, options.where);
        }
      });
    },

    findCustomExceptions: function(identity, procedure, cb) {
      setTimeout(function () {
        var queryString = '';
        var bindVars = {};

        sails.log.silly('oracle-sp: findCustomExceptions');

        queryString += 'BEGIN ';
        queryString += connections[identity].package + '.';
        queryString += procedure + '(';
        queryString += adapter._processCursor(connections[identity].cursorName, bindVars);
        queryString += '); END;';

        sails.log.silly(queryString);
        sails.log.silly(bindVars);

        connections[identity].oracledb.execute(queryString, bindVars, function(err, resultSet) {
          if(err) {
            return cb(err);
          }
          adapter._fetchRowsFromRS(resultSet, function(err, results) {
            if(err) return cb(err);
            connections[identity].customExceptions = results.slice();
            cb();
          });
        });
      }, 1);
    },

    processOracleError: function(error, identity) {
      var localError;

      var errorArray = error.toString().split(':');
      if(errorArray.length >= 2 && errorArray[0] === 'Error') {
        localError = new WLError();
        var errorValue = errorArray[1].trim();
        localError.code = 'E_ORACLE_' + errorValue;
        if(errorValue.substring(0,4) == 'ORA-') {
          var customId = parseInt(errorValue.substring(4), 10);
          var customMessage = _.result(_.findWhere(connections[identity].customExceptions, { ID: customId }), 'MESSAGE');
          if(customMessage) {
            localError.status = 400;
            localError.reason = customMessage;
          } else {
            localError.reason = error;
          }
        } else {
          localError.reason = error;
        }
        sails.log.silly(localError);
      } else {
        sails.log.warn(error);
      }
      return localError || error;
    },

    _processOptions: function(options, bindVars) {
      var queryString = '';
      _.forOwn(options, function(optionValue, optionKey) {
        if(optionValue !== null) {
          if(optionKey == 'where') {
            var where = optionValue;
            if(where.hasOwnProperty('or') && _.isArray(where.or)) {
              var whereArray = where.or;
              whereArray.forEach(function(whereItem) {
                _.forOwn(whereItem, function(whereValue, whereKey) {
                  if(util.isArray(whereValue)) {
                    whereValue = whereValue[0];
                  }
                  if(Object.keys(bindVars).length > 0) {
                    queryString += ', ';
                  }
                  queryString += 'P_' + whereKey + ' => :' + whereKey;
                  bindVars[whereKey] = whereValue;
                });
              });
            } else {
              // Single where value
              _.forOwn(where, function(whereValue, whereKey) {
                if(util.isArray(whereValue)) {
                  whereValue = whereValue[0];
                }
                if(Object.keys(bindVars).length > 0) {
                  queryString += ', ';
                }
                queryString += 'P_' + whereKey + ' => :' + whereKey;
                bindVars[whereKey] = whereValue;
              });
            }
          } else {
            // TODO: handle other options like limit and skip here
          }
        } else {
          // optionValue is null, do nothing
        }
      });
      return queryString;
    },

    _processValues: function(values, bindVars) {
      var queryString = '';
      _.forOwn(values, function(value, key) {
        if(Object.keys(bindVars).length > 0) {
          queryString += ', ';
        }
        queryString += 'P_' + key + ' => :' + key;
        bindVars[key] = value;
      });
      return queryString;
    },

    _processCursor: function(cursorName, bindVars) {
      var queryString = '';
      if(Object.keys(bindVars).length > 0) {
        queryString += ', ';
      }
      queryString += 'P_' + cursorName + ' => :cursor';
      bindVars.cursor = { type: oracledb.CURSOR, dir: oracledb.BIND_OUT };
      return queryString;
    },

    _fetchRowsFromRS: function(resultSet, cb) {
      var maxRows = 50;
      var allRows = [];
      adapter.__accumulateRowsFromRS(resultSet, allRows, maxRows, cb);
    },

    __accumulateRowsFromRS: function(resultSet, allRows, numRows, cb) {
      resultSet.outBinds.cursor.getRows(numRows, function (err, rows) {
        if (err) {
          return cb(err);
          } else {
            // if no rows, or no more rows
            if (rows.length === 0) {
              resultSet.outBinds.cursor.close(function(err) {return;});
              cb(null, allRows);
            } else {
              allRows = allRows.concat(rows);
              // fetch the next set of rows
              adapter.__accumulateRowsFromRS(resultSet, allRows, numRows, cb);
            }
          }
      });
    }
  };

  // Expose adapter definition
  return adapter;

})();
