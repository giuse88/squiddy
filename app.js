var express   = require('express');
var http      = require('http');
var path      = require('path');
_         = require('underscore');
var log4js    = require('log4js');

var LOGGER = log4js.getLogger('app.js');
SIZE_ID = 20;



var app = express();

// settings 
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());
app.use(app.router);



// Create the HTTP server
var server = http.createServer(app);
// create the socket io
var io = require('socket.io').listen(server, {log: false});
// create the room service
var roomService = require('./lib/ChatRoomService').getRoomService(LOGGER);

/*var roomId = roomService.createNewRoom();
console.log(roomId);
console.log(roomService.doesRoomExist(roomId));
console.log(roomService.doesRoomExist("Test"));
console.log(roomService.isRoomEmpty(roomId));
console.log("Add new peer to Room " + roomService.addPeerToRoom(roomId, "a"));
console.log(roomService.isRoomEmpty(roomId));
console.log(roomService.removePeerFromRoom(roomId, "a"));
console.log(roomService.isRoomEmpty(roomId));
*/


// routes
app.get('/',function(req, res) {
    res.redirect('/' + roomService.createNewRoom());
});

app.get('/:roomIdentifier', function( req, res) {
    var roomId = req.path.replace('/','');
    console.log(roomId);
    if (roomService.doesRoomExist(roomId))
        res.render("chatRoomView", { "roomId" : roomId} );
    else
        res.render("chatRoomErrorView", { "roomId" : roomId});
});
//

// kick off the signaling service
//var singalingService = require('./socket/SignalingProtocol').start(io, roomService, LOGGER);

server.listen(app.get('port'), function(){ 
  LOGGER.trace('Express server listening on port ' + app.get('port')); 
});




