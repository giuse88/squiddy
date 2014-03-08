(function() {
    "use strict";

    var LOG =   "INFO ";
    var TRACE = "TRACE"
    var ERROR = "ERROR"

    function _log(type, msg, values) {
        if (!values)
            console.log("[" + type + "] " +  msg + " Values : " + values);
        else
            console.log("[" + type + "] " +  msg );
    }

    function info (msg) {
        _log(LOG, msg );
    }

    function error (msg, values) {
        _log(ERROR, msg, values);
    }

    function trace (msg) {
        _log(TRACE, msg);
    }

    // ===========================
    //      PUBLIC INTERFACE
    //============================

    return {
        info  : info,
        error : error,
        trace : trace
    };

})()