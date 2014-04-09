(function(exports) {

    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgres://giuseppe@localhost/jelly_db'
    var client = new pg.Client(connectionString);
    var connected = false;

    var initialize = function(callBack, errorCallBack, query) {
        client.connect(function(err) {
            if(err) {
                connected = false;
                errorCallBack(err);
            }else {
                connected = true;
                callBack();
            }
        });
    };

    var insert = function (queryObj, callback, errorCallback) {
       // this may generate an infinite loop
       if(!connected)
           initialize(insert, errorCallback, queryObj);
        else
          client.query()
    }

})(exports);