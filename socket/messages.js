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

    define("CONNECTION_REQUEST", "request");
    define("JOINED",  "joined");
    define("MESSAGE", "message");
    define("CREATED", "created");
    define("CONNECTED", "connected");
    define("JOIN",    "join");
    define("BYE",     "bye");

})(typeof exports === 'undefined'? this['events']={}: exports);

