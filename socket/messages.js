
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("REQUEST", "request");
define("JOINED",  "joined");
define("MESSAGE", "message");
define("CREATED", "created");
define("CONNECTED", "created");
define("JOIN",    "join");
define("BYE",     "bye");