'use strict';
const assert = require('assert');
const debug = require('debug')('sample-project:routes');
const mongoHelper = require('./mongo-helper');
const ObjectID = require('mongodb').ObjectID

/* Redirect to names list */
exports.index = function(req, res) {
  res.redirect(301, '/names');
};

/* Populates a list of names with an "add name" form. */
exports.listNamesForm = function(req, res) {
  const collection = mongoHelper.getCollection();

  collection.find({}).toArray( function(err, documents) {
    if (err == null) {

      debug('list: %O', documents);

      res.render(
        'list',
        {
            title: 'Names List',
            names: documents
        }
      );

    } else {
      res.status(500).end();
    }
  });
};

/* Populates an "edit name" form. */
exports.editNameForm = function(req, res) {
  if ( req.params.id == null ) {
    res.status(400).end();
  }

  var docIdToEdit = req.params.id; 
  debug('document id to edit: %s', docIdToEdit);

  const collection = mongoHelper.getCollection();

  collection.findOne({ _id: ObjectID(docIdToEdit) }, function(err, result) {
    if (err == null) {
      var origFname = result['fname'];
      var origLname = result['lname'];

      res.render(
        'edit-name',
        {
            title: 'Edit Name: ' + origFname + ' ' + origLname,
            id: docIdToEdit,
            fname: origFname,
            lname: origLname
        });
    } else {
        res.status(404).end();
    }
  });
};


/* Handles name add/edit requests, then goes back to names list. */
exports.addEditNameHandler = function(req, res) {
    if ( req.body['fname'] == null
         || req.body['lname'] == null ) {
  
        res.status(400).end();
  
    }

    var fname = req.body['fname'];
    var lname = req.body['lname'];
    debug('name to insert/update: %s %s', fname, lname);

    const collection = mongoHelper.getCollection();

    if ( req.body['id'] == null ) {
      /* Adding a new name */
        collection.insertOne(
          {
              fname: fname,
              lname: lname
          },
      
          function(err, result) {
            if (err == null && result.insertedCount == 1) {
              var insertedDocument = result.ops[0];
              debug('inserted new document\n%O', insertedDocument);
      
              res.status(201);
            } else {
              res.status(500).end();
            }
          }
        );
    } else {
        /* Updating an existing name */
        var docIdToUpdate = req.body['id'];

        if (docIdToUpdate == null)
        {
            res.status(400).end();
        }
        debug('document id to update: %s', docIdToUpdate);

        /* 
         * Future: Should consider atomicity and
         * concurrency requirements.
         */
        collection.updateOne(
                { _id: ObjectID(docIdToUpdate) },
      
                { $set:
                   {
                     fname: fname,
                     lname: lname
                   }
                },
      
                function(err, result) {
                  if (result.result.ok == 1) {
                    debug('count of documents matched/modified: %d / %d',
                      result.matchedCount,
                      result.result.nModified);        
            } else {
              res.status(500).end();
            }
          }
        );
    }

    /* After inserting/updating, return to the names list */
    exports.listNamesForm(req, res);
};