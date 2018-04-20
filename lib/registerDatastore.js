/**
 * Module dependencies
 */

var urlParse = require('url-parse');
var oracledb = require('oracledb');

/**
 *  ╦═╗╔═╗╔═╗╦╔═╗╔╦╗╔═╗╦═╗  ┌┬┐┌─┐┌┬┐┌─┐┌─┐┌┬┐┌─┐┬─┐┌─┐
 *  ╠╦╝║╣ ║ ╦║╚═╗ ║ ║╣ ╠╦╝   ││├─┤ │ ├─┤└─┐ │ │ │├┬┘├┤
 *  ╩╚═╚═╝╚═╝╩╚═╝ ╩ ╚═╝╩╚═  ─┴┘┴ ┴ ┴ ┴ ┴└─┘ ┴ └─┘┴└─└─┘
 * Register a new datastore with this adapter.  This usually involves creating a new
 * connection manager (e.g. MySQL pool or MongoDB client) for the underlying database layer.
 *
 * > Waterline calls this method once for every datastore that is configured to use this adapter.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Dictionary}   registeredDatastores       Used to track of all the datastores that use this adapter
 * @param  {Dictionary}   datastoreConfig            Dictionary (plain JavaScript object) of configuration options for this datastore (e.g. host, port, etc.)
 * @param  {Dictionary}   physicalModelsReport       Experimental: The physical models using this datastore (keyed by "tableName"-- NOT by `identity`!).  This may change in a future release of the adapter spec.
 *         @property {Dictionary} *  [Info about a physical model using this datastore.  WARNING: This is in a bit of an unusual format.]
 *                   @property {String} primaryKey        [the name of the primary key attribute (NOT the column name-- the attribute name!)]
 *                   @property {Dictionary} definition    [the physical-layer report from waterline-schema.  NOTE THAT THIS IS NOT A NORMAL MODEL DEF!]
 *                   @property {String} tableName         [the model's `tableName` (same as the key this is under, just here for convenience)]
 *                   @property {String} identity          [the model's `identity`]
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Function}     done                       A callback to trigger after successfully registering this datastore, or if an error is encountered.
 *               @param {Error?}
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
module.exports = function registerDatastore(registeredDatastores, datastoreConfig, physicalModelsReport, done) {

  // Grab the unique name for this datastore for easy access below.
  var datastoreName = datastoreConfig.identity;

  // Some sanity checks:
  if (!datastoreName) {
    return done(new Error('Consistency violation: A datastore should contain an "identity" property: a special identifier that uniquely identifies it across this app.  This should have been provided by Waterline core!  If you are seeing this message, there could be a bug in Waterline, or the datastore could have become corrupted by userland code, or other code in this adapter.  If you determine that this is a Waterline bug, please report this at https://sailsjs.com/bugs.'));
  }
  if (registeredDatastores[datastoreName]) {
    return done(new Error('Consistency violation: Cannot register datastore: `' + datastoreName + '`, because it is already registered with this adapter!  This could be due to an unexpected race condition in userland code (e.g. attempting to initialize Waterline more than once), or it could be due to a bug in this adapter.  (If you get stumped, reach out at https://sailsjs.com/support.)'));
  }


  // Ensure a `url` was configured.
  // > To help standardize configuration for end users, adapter authors
  // > are encouraged to support the `url` setting, if conceivable.
  // >
  // > Read more here:
  // > https://sailsjs.com/config/datastores#?the-connection-url
  // Example url sails-oracledb-sp://user:password@host:port/sid/package/cursorName
  if (!datastoreConfig.url) {
    // Every config item has a default except for user and password. Build a url
    if(!datastoreConfig.user) {
      return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `user`'));
    }
    if(!datastoreConfig.password) {
      return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `password`'));
    }
    datastoreConfig.url = 'sails-oracledb-sp://';
    datastoreConfig.url += datastoreConfig.user + ':';
    datastoreConfig.url += datastoreConfig.password + '@';
    datastoreConfig.url += datastoreConfig.host + ':';
    datastoreConfig.url += datastoreConfig.port + '/';
    datastoreConfig.url += datastoreConfig.sid + '/';
    datastoreConfig.url += datastoreConfig.package + '/';
    datastoreConfig.url += datastoreConfig.cursorName;
    if(datastoreConfig.findCustomExceptions) {
      datastoreConfig.url += '/' + datastoreConfig.findCustomExceptions;
    }
  }

  var urlParts = urlParse(datastoreConfig.url);
  if(urlParts.username) {
    datastoreConfig.user = urlParts.username;
  } else {
    return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `username`'));
  }
  if(urlParts.password) {
    datastoreConfig.password = urlParts.password;
  } else {
    return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `password`'));
  }
  if(urlParts.hostname) {
    datastoreConfig.host = urlParts.hostname;
  } else {
    return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `hostname`'));
  }
  if(urlParts.port) {
    datastoreConfig.port = urlParts.port;
  } else {
    datastoreConfig.port = 1521;
  }
  if(urlParts.pathname) {
    var pathParts = urlParts.pathname.split('/');
    // [0] = ''
    // [1] = sid
    // [2] = package
    // [3] = cursorName
    // [4] = findCustomExceptions
    if(pathParts.length >= 2) {
      datastoreConfig.sid = pathParts[1];
    }
    if(pathParts.length >= 3) {
      datastoreConfig.package = pathParts[2];
    }
    if(pathParts.length >= 4) {
      datastoreConfig.cursorName = pathParts[3];
    }
    if(pathParts.length >= 5) {
      datastoreConfig.findCustomExceptions = pathParts[4];
    }
  } else {
    return done(new Error('Invalid configuration for datastore `' + datastoreName + '`:  Missing `path`'));
  }

  // Build a "connection manager" -- an object that contains all of the state for this datastore.
  // This might be a MySQL connection pool, a Mongo client instance (`db`), or something even simpler.
  // For example, in sails-postgresql, `manager` encapsulates a connection pool that the stateless
  // `machinepack-postgresql` driver uses to communicate with the database.  The actual form of the
  // manager is completely dependent on this adapter.  In other words, it is custom and database-specific.
  // This is where you should store any custom metadata specific to this datastore.
  //
  // > TODO: Replace this setTimeout with real logic that creates the manager.
  setTimeout(function(){
    var poolAlias = 'sails-' + datastoreName;
    oracledb.createPool({
      poolAlias: poolAlias,
      user: datastoreConfig.user,
      password: datastoreConfig.password,
      connectString: datastoreConfig.host + ':' + datastoreConfig.port + '/' + datastoreConfig.sid
    }, function gotPool(err, pool) {
      if(err) {
        return done(new Error('Create pool error for datastore `' + datastoreName + '`: ' + err.message));
      }
      // Test connection
      oracledb.getConnection(poolAlias, function(err, connection) {
        if (err) {
          return done(new Error('getConnection error for datastore `' + datastoreName + '`: ' + err.message));
        }

        // Save information about the datastore to the `datastores` dictionary, keyed under
        // the datastore's unique name.  The information should itself be in the form of a
        // dictionary (plain JavaScript object), and have three keys:
        //
        // `pool`:    The database-specific "connection pool" that we just built above.
        //
        // `config  : Configuration options for the datastore.  Should be passed straight through
        //            from what was provided as the `datastoreConfig` argument to this method.
        //
        // `driver` : Instance of the driver
        //
        registeredDatastores[datastoreName] = {
          config: datastoreConfig,
          pool: pool,
          poolAlias: poolAlias,
          driver: oracledb
        };

        connection.close();

        // Inform Waterline that the datastore was registered successfully.
        return done();
      });
    });
  }, 16);

};
