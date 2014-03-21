LOG = (function(console) {
    "use strict";

    var LOG =   " INF ";
    var TRACE = "TRACE"
    var ERROR = "ERROR"

    function _log(type, msg, values, logFunction) {
        if (values)
            logFunction.call(console, "[" + type + "] " +  msg + " Values : " + JSON.stringify(values));
        else
            logFunction.call(console, "[" + type + "] " +  msg );
    }

    function info (msg, values) {
        _log(LOG, msg, values, console.log);
    }

    function error (msg, values) {
        _log(ERROR, msg, values, console.error);
    }

    function trace (msg, values) {
        _log(TRACE, msg, values, console.trace);
    }

    function peerInfo (peerId, msg, object) {
        info( "<" + peerId  + "> " + msg, object);
    }

    function peerError(peerId, msg, object) {
        error( "<" + peerId + "> " + msg, object);
    }

    function peerTrace(peerId, msg, object){
        trace( "<" +  peerId + "> " + msg, object);
    }

    // ===========================
    //      PUBLIC INTERFACE
    //============================

    return  {
        info      : info,
        error     : error,
        trace     : trace,
        peerInfo  : peerInfo,
        peerError : peerError,
        peerTrace : peerTrace
    };

})(console);