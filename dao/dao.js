(function(exports,LOG) {

    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgres://giuseppe@localhost/jelly_db'
    var client = new pg.Client(connectionString);
    var connected = false;

    var initialize = function(callBack, errorCallBack) {
        client.connect(function(err) {
            if(err) {
                connected = false;
                LOG.error("Dao initialization failed.", err);
                errorCallBack && errorCallBack(err);
            }else {
                connected = true;
                LOG.trace("Dao initialized.");
                callBack && callBack();
            }
        });
    };


    var makeQuery = function(queryStr, callback, errorCallback) {
        var query = client.query(queryStr);
        query.on('err', errorCallback);
        query.on('end', callback);
    }

    var insert = function (queryStr, callback, errorCallback) {
       if(!connected) {
           initialize( function() {
              makeQuery(queryStr, callback, errorCallback);
           }, function(err) {
            LOG.error("Error connection initialization.", err);
           });
       }
        else
          client.query(queryStr, callback, errorCallback);
    }

    var release = function() {
        client.end();
        LOG.trace("Client released.");
    };

    exports.release = release;
    exports.insert = insert;

})(exports,LOGGER);