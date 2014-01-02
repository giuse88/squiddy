var express = require('express');
var http = require('http');
var path = require('path');
var _=require('underscore');
var log4js = require('log4js');

var LOGGER = log4js.getLogger('app.js');
var SIZE_ID = 20; 
var REQUEST = "request"; 
var JOINED  = "joined"; 
var MESSAGE = "message"; 
var CREATED = "created"; 
var JOIN    = "join"; 
var BYE     = "bye";

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);  
var io = require('socket.io').listen(server, {log: false}); 
server.listen(app.get('port'), function(){ 
  LOGGER.trace('Express server listening on port ' + app.get('port')); 
}); 

io.sockets.on('connection', function (socket) {
    
   socket.on(REQUEST, function (data) {
     var peer = data.peerId;
     var room = data.roomId; 
     var isInitiator = !doesRoomExist(room);  
      
     if (isInitiator) 
        createNewRoom(socket, peer);     
     else 
        joinRoom(socket, peer, room); 
   });

   socket.on(MESSAGE, function (data) {onMessage(socket, data)});
   socket.on(BYE, function(data){onBye(socket, data)});
});


function joinRoom(socket, peer, room) {
  socket.join(room);
  socket.emit(JOINED, {roomId : room});
  socket.broadcast.to(room).emit(JOIN, {roomId : room, peerId : peer}); 
  LOGGER.trace("Peer %s has joined room %s", peer, room); 
}

function createNewRoom(socket, peer){
  var newRoomId = createNewRoomID(); 
  socket.join(newRoomId);
  socket.emit(CREATED, {roomId : newRoomId});
  LOGGER.trace("Peer %s has created room %s", peer, newRoomId); 
}

function onMessage(socket, data) {
  socket.broadcast.to(data.roomId).emit(MESSAGE, data);
  LOGGER.trace("Received message from %s. Brodcasted to the room %s", data.peerId, data.roomId); 
}

function onBye(socket, data) {
  socket.broadcast.to(data.roomId).emit(MESSAGE, data);
  LOGGER.trace("Received BYE message from %s. Brodcasted to the room %s", data.peerId, data.roomId); 
}

//Verify if a room already exists
function doesRoomExist(roomId) {
  if(!roomId)
    return false;  
  var rooms = _.keys(io.sockets.manager.rooms);
  roomId = "/" + roomId; // Socket.io saves the room name with the backslash as first character
  return  (rooms.indexOf(roomId) > -1); 
}

function createNewRoomID() {
  var roomId = make_id(SIZE_ID);
  var rooms = _.keys(io.sockets.manager.rooms);
  // In case of collisions
  while(rooms.indexOf(roomId) > -1)
    roomId = make_id(SIZE_ID);
  return roomId; 
}

function make_id(length){
 var text = "";
 var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
 return text;
}

