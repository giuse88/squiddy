var SIZE_PEER_ID = 10;
var REQUEST = "request"; 
var JOINED  = "joined"; 
var UPDATE  = "update"; 
var INTERVAL = 10000;







function initialization() {

  var peer = make_peer_id(SIZE_PEER_ID); 
  var room = get_room_id_from_url() || ''; 
  var isInitiator=undefined;
  var msg  = "Hello I am " + peer  + " and it is " + get_time(); 

  var roomRequest = {
                  peerId : peer, 
                  roomId : room
                }; 

  //connect to the remote server throug a web socket
  var socket = io.connect();

  //request for joining a room  
  socket.emit(REQUEST, roomRequest);  
 
  // callback when a room this peer joins a room 
  socket.on(JOINED, function (data) {
   
   console.log("Joined room : " + data.roomId);    
   console.log("isInitiator : " + data.isInitiator);
  
   // save these values; 
   room = data.roomId;
   isInitiator = data.isInitiator;

   // socket emit ( this event is brocasted to all the peers in the room )  
   setInterval(function () {
                            socket.emit(UPDATE, 
                          {   
                            roomId  : room, 
                            peerId  : peer,  
                            msg : msg
                          })
                          },INTERVAL);
  }); 
  
  // log  
  socket.on(UPDATE, function(data){
      console.log("Peer " + peer + " : " + data.roomId + " " + data.msg);
  });

}

function get_room_id_from_url() {
  return get_url_values()["roomid"]; 
}

function get_url_values(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?')
                   + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function make_peer_id(length){
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   return text;
}

function get_time() {
    var d = new Date();
    return d.getTime();
}
