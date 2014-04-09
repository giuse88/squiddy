(function(exports) {

    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgres://giuseppe@localhost/jelly_db'
    var client = new pg.Client(connectionString);
    var connected = false;

    var initialize = function(callBack, errorCallBack) {
        client.connect(function(err) {
            if(err) {
                connected = false;
                errorCallBack && errorCallBack(err);
            }else {
                connected = true;
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
            console.log("Error initialization", err);
           });
       }
        else
          client.query(queryStr, callback, errorCallback);
    }

    var release = function() {};

    exports.release = release;
    exports.insert = insert;

})(exports);