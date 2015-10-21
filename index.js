'use strict';

var rethink = require('rethinkdb');
var rethinkdbInit = require('rethinkdb-init');


exports.register = function (plugin, opts, next) {
  opts = opts || {};
  if (!opts.url) {
    opts.port = opts.port || 28015;
    opts.host = opts.host || 'localhost';
    opts.db = opts.db || 'test';
  } else {
    var url = require('url').parse(opts.url);
    opts.port = parseInt(url.port) || 28015;
    opts.host = url.hostname || 'localhost';
    opts.db = url.pathname ? url.pathname.replace(/^\//, '') : 'test';

    if (url.auth)
      opts.authKey = url.auth.split(':')[1];
  }

  rethinkdbInit(rethink);

  var tables = (opts.table ? [opts.table] : opts.tables) || [];
  rethink.init(opts, tables)
    .then(function (conn) {

      plugin.expose('connection', conn);
      plugin.expose('library', rethink);
      plugin.bind({
        rethinkdbConn: conn,
        rethinkdb: rethink
      });

      plugin.log(['hapi-rethinkdb', 'info'], 'RethinkDB connection established');
      return next();
    }).catch(function (err) {

      plugin.log(['hapi-rethinkdb', 'error'], err.message);
      console.error(err);
      return next(err);
    });
};

exports.register.attributes = {
  pkg: require('./package.json')
};
