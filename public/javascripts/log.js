(function() {
    "use strict";

    var LOG =   "INFO ";
    var TRACE = "TRACE"
    var ERROR = "ERROR"

    function _log(type, msg ) {
        console.log("[" + type + "] " +  msg);
    }

    function info (msg) {
        _log(LOG, msg );
    }

    function error (msg) {
        _log(ERROR, msg);
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