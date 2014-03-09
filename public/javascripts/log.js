LOG = (function(console) {
    "use strict";

    var LOG =   " INF ";
    var TRACE = "TRACE"
    var ERROR = "ERROR"

    function _log(type, msg, values) {
        if (values)
            console.log("[" + type + "] " +  msg + " Values : " + JSON.stringify(values));
        else
            console.log("[" + type + "] " +  msg );
    }

    function info (msg, values) {
        _log(LOG, msg, values);
    }

    function error (msg, values) {
        _log(ERROR, msg, values);
    }

    function trace (msg, values) {
        _log(TRACE, msg, values);
    }

    // ===========================
    //      PUBLIC INTERFACE
    //============================

    return  {
        info  : info,
        error : error,
        trace : trace
    };

})(console);