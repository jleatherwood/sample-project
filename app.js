'use strict';
const express = require('express');
const assert = require('assert');
const debug = require('debug')('sample-project');
const mongoHelper = require('./mongo-helper.js');
const bodyParser = require('body-parser');
const routes = require('./routes');

const MONGO_URI = 'mongodb://localhost:27017/sample-project'
const NODE_PORT = 3000;

/* Use a shared MongoDB connection for all requests */
mongoHelper.connect(MONGO_URI, function(err) {

  /* Configure ExpressJS routes */
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
  });

  app.set('view engine', 'pug');

  app.get('/', routes.index);
  app.get('/names', routes.listNamesForm);
  app.get('/names/:id', routes.editNameForm);
  app.post('/names', routes.addEditNameHandler);

  /* Init ExpressJS */
  app.listen(NODE_PORT, function() {
    debug('listening on http://localhost:%d', NODE_PORT);
  });

});
