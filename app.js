var REQUEST = "request"; 
var JOINED  = "joined"; 
var UPDATE  = "update"; 
var SIZE_ID = 20; 

var express = require('express');
var http = require('http');
var path = require('path');
var _=require('underscore');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('hello world');
});

var server = http.createServer(app);  
var io = require('socket.io').listen(server); 
server.listen(app.get('port'), function(){ 
  console.log('Express server listening on port ' + app.get('port')); 
}); 

io.sockets.on('connection', function (socket) {
    
   socket.on(REQUEST, function (data) {
    
     var peer = data.peerId;
     var room = data.roomId; 
     // Shorted !room
     var isInitiator = room ? false : true;  
     var logMessage = "Received request for " + ( isInitiator ?  "creating a room" 
                                              : ( "joining room " + room));
     console.log(logMessage);
      
     if (isInitiator) {
        room = createNewRoom();     
        console.log("Room " + room + " created"); 
     }

     socket.join(room);
     emit_joined_room(socket, room, isInitiator );
     console.log("Peer " + peer + " has joined room " + room );
   });

   socket.on(UPDATE, function(data) {
        console.log('update');
        socket.broadcast.to(data.roomId).emit(UPDATE, data);
   });

});

function createNewRoom() {
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

function emit_joined_room(socket, room, isInitiator) {
  socket.emit(JOINED, {roomId : room, isInitiator : isInitiator});
}
