'use strict';
const assert = require('assert').strict;
const debug = require('debug')('sample-project:mongo-helper');
const MongoClient = require('mongodb').MongoClient;

const NAMES_COLLECTION = 'names'

var _client;
var _db;
var _collection;

/* Create a shared connection */
exports.connect = function(uri, callback) {

  MongoClient.connect(
    uri,

    {
      /* Needed to avoid a deprecation warning at runtime. */
      useNewUrlParser: true,

      /*
       * An attempt at solving a read-after-write consistency issue
       * where name inserts/updates may not be reflected in the next
       * load of the names list.
       *
       * These options did not solve the issue, but appear to have no
       * ill effects. Could investigate using a named session, or
       * accept eventual consistency if requirements allow.
       */
      w: 1,
      j: 1,
      readPreference: "ReadPreference.PRIMARY",
      readConcern: { level: 'available' }
    },

    function(err, client) {
      assert.ifError(err);
      debug('connected to %s', uri);
  
      _client = client;
      assert.notStrictEqual(_client, null);
      
      _db = client.db();
      assert.notStrictEqual(_db, null);
  
      _collection = _db.collection(NAMES_COLLECTION);
      assert.notStrictEqual(_collection, null);
  
      _collection.countDocuments( function(err, count) {
        assert.ifError(err);
        debug('collection \'%s\' contains %d documents', NAMES_COLLECTION, count);
      });
  
      return callback(err);
    });

},

/* Return the MongoClient instance */
exports.getClient = function() {
  return _client;
}

/* Return the shared Db instance */
exports.getDb = function() {
  return _db;
}

/* Return the Collection instance */
exports.getCollection = function() {
  return _collection;
}