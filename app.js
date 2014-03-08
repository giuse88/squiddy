var express   = require('express');
var http      = require('http');
var path      = require('path');
var log4js    = require('log4js');

var LOGGER = log4js.getLogger('app.js');

// create express app
var app = express();

// settings 
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'common')));
//
app.use(express.urlencoded());
app.use(app.router);

// Create the HTTP server
var server = http.createServer(app);

// create the socket io
var io = require('socket.io').listen(server, {log: false});

// create the room service
var roomService = require('./services/ChatRoomService').getRoomService(LOGGER);

// kick off the signaling service
    require('./services/SignalingService').initialize(io, roomService, LOGGER);


//=================================
//          INDEX PAGE
//=================================

var indexRoute = require("./routes/index");

app.get('/', function(req, res) {
    indexRoute.index(req, res, roomService);
});

//=================================
//          CHAT ROOM PAGE
//=================================

var chatRoomRoute = require("./routes/chatRoom");

app.get('/:roomIdentifier', function( req, res) {
    chatRoomRoute.chatRoom(req, res, roomService);
});

// listening for incoming request
server.listen(app.get('port'), function(){ 
  LOGGER.trace('Express server listening on port ' + app.get('port')); 
});

