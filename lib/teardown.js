/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');

/**
 *  ╔╦╗╔═╗╔═╗╦═╗╔╦╗╔═╗╦ ╦╔╗╔
 *   ║ ║╣ ╠═╣╠╦╝ ║║║ ║║║║║║║
 *   ╩ ╚═╝╩ ╩╩╚══╩╝╚═╝╚╩╝╝╚╝
 * Tear down (un-register) a datastore.
 *
 * Fired when a datastore is unregistered.  Typically called once for
 * each relevant datastore when the server is killed, or when Waterline
 * is shut down after a series of tests.  Useful for destroying the manager
 * (i.e. terminating any remaining open connections, etc.).
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Dictionary} registeredDatastores  Used to track of all the datastores that use this adapter
 * @param  {String}     datastoreName         The unique name (identity) of the datastore to un-register.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param  {Function} done          Callback
 *               @param {Error?}
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
module.exports = function teardown(registeredDatastores, datastoreName, done) {
  // Look up the datastore entry (pool/driver/config).
  var dsEntry = registeredDatastores[datastoreName];

  // Sanity check:
  if (_.isUndefined(dsEntry)) {
    return done(new Error('Consistency violation: Attempting to tear down a datastore (`'+datastoreName+'`) which is not currently registered with this adapter.'));
  }

  // Destroy the connection pool.
  dsEntry.pool.close(function closedPool(err) {
    if(err) {
      return done(new Error('Close pool error for datastore `' + datastoreName + '`: ' + err.message));
    }
    // Now, un-register the datastore.
    delete registeredDatastores[datastoreName];

    // Inform Waterline that we're done, and that everything went as expected.
    return done();
  });
};
