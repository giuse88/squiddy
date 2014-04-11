(function(exports,LOG) {

    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgres://giuseppe@localhost/jelly_db'

    var insert = function (queryStr, callback, errorCallback) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                LOG && LOG.error('error fetching client from pool', err);
            }
            client.query(queryStr, '', function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                //
                if(err)
                    errorCallback && errorCallback(err);
                else
                   callback && callback(result);
            });
        });
    }
    exports.insert = insert;

})(exports,LOGGER);