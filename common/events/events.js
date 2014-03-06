// =========================
//    CONSTANT EVENTS
// =========================

(function(exports){

    function define(name, value) {
        Object.defineProperty(exports, name, {
            value:      value,
            enumerable: true
        });
    }

    define("REQUEST",       "request");
    define("MESSAGE",       "message");
    define("CONNECTION", "connection");
    define("CONNECTED" ,  "connected");
    define("DISCONNECT", "disconnect");
    define("JOIN",             "join");
    define("JOINED",         "joined");
    define("BYE",               "bye");

})(typeof exports === 'undefined'? this['events']={}: exports);

