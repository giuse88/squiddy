var SIZE_PEER_ID = 10;
var REQUEST = "request"; 
var JOINED  = "joined"; 
var MESSAGE = "message"; 
var CREATED = "created"; 
var JOIN    = "join"; 
var BYE     = "bye";
var INTERVAL = 10000;


var isInitiator = false; 
var isConnected = false; 
var room = ''; 
var peer = ''; 
var socket = null; 

function initialization() {
  setStatus("Initialization...");
  openChannel();
}

function openChannel() {

  peer = make_peer_id(SIZE_PEER_ID); 
  var room = get_room_id_from_url() || ''; 

  var roomRequest = {
                  peerId : peer, 
                  roomId : room
                }; 

  //connect to the remote server throug a web socket
  socket = io.connect();
 
  //request for joining a room  
  socket.emit(REQUEST, roomRequest);  
 
  // callback when this peer joins a room 
  socket.on(JOINED, onJoined); 

  // calback for when a room is created 
  socket.on(CREATED, onCreated); 

  // a peer has joined the room  
  socket.on(JOIN, onJoin); 

  // log  
  socket.on(MESSAGE,onMessage); 
}

function onJoined(data) {
  setStatus("Connected");
  room = data.roomId; 
  isInitiator=false; 
  isConnected=true; 
  console.log("Joined room " + room); 
  start();
}

function onCreated(data) {
  //set status waiting  
  setStatus("Waiting");
  room = data.roomId; 
  isInitiator=true; 
  isConnected=false; 
  console.log("Created room " + room); 
}

function onJoin(data) {
  setStatus("Connected"); 
  console.log("Peer " + data.peerId + " joined room " + data.roomId); 
  isConnected = true; 
  start();
}

function onMessage(data) {
  console.log("Peer " + data.peerId + " : " + data.roomId + " " + data.msg);
}

function start() {
  var msg  = "The current time is :  " + get_time(); 
  // socket emit ( this event is brocasted to all the peers in the room )  
 
  if (isConnected)  
  setInterval(function () {
                            socket.emit(MESSAGE, 
                          {   
                            roomId  : room, 
                            peerId  : peer,  
                            msg : msg
                          })
                          },INTERVAL);
}


function maybeRequestTurn() {

  // Skipping TURN Http request for Firefox version <=22.
  // Firefox does not support TURN for version <=22.
  if (webrtcDetectedBrowser === 'firefox' && webrtcDetectedVersion <=22) {
    turnDone = true;
    return;
  }

  for (var i = 0, len = pcConfig.iceServers.length; i < len; i++) {
    if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnDone = true;
      return;
    }
  }

  var currentDomain = document.domain;
  if (currentDomain.search('localhost') === -1 &&
      currentDomain.search('apprtc') === -1) {
    // Not authorized domain. Try with default STUN instead.
    turnDone = true;
    return;
  }

  // No TURN server. Get one from computeengineondemand.appspot.com.
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = onTurnResult;
  xmlhttp.open('GET', turnUrl, true);
  xmlhttp.send();
}

function onTurnResult() {
  if (xmlhttp.readyState !== 4)
    return;

  if (xmlhttp.status === 200) {
    var turnServer = JSON.parse(xmlhttp.responseText);
    for (i = 0; i < turnServer.uris.length; i++) {
      // Create a turnUri using the polyfill (adapter.js).
      var iceServer = createIceServer(turnServer.uris[i],
                                      turnServer.username,
                                      turnServer.password);
      if (iceServer !== null) {
        pcConfig.iceServers.push(iceServer);
      }
    }
  } else {
    console.log('Request for TURN server failed.');
  }
  // If TURN request failed, continue the call with default STUN.
  turnDone = true;
  //maybeRequest(); TODO 
}


function doGetUserMedia() {
  // Call into getUserMedia via the polyfill (adapter.js).
  try {
    getUserMedia(mediaConstraints, onUserMediaSuccess,
                 onUserMediaError);
    console.log('Requested access to local media with mediaConstraints:\n' +
                '  \'' + JSON.stringify(mediaConstraints) + '\'');
  } catch (e) {
    alert('getUserMedia() failed. Is this a WebRTC capable browser?');
    console.log('getUserMedia failed with exception: ' + e.message);
  }
}


function onUserMediaSuccess(stream) {
  console.log('User has granted access to local media.');
  // Call the polyfill wrapper to attach the media stream to this element.
  attachMediaStream(localVideo, stream);
  localVideo.style.opacity = 1;
  localStream = stream;
  // Caller creates PeerConnection.
  //maybeStart();
}

function onUserMediaError(error) {
  console.log('Failed to get access to local media. Error code was ' +
              error.code);
  alert('Failed to get access to local media. Error code was ' +
        error.code + '.');
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


function maybeStart() {
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

function createPeerConnection() {
  try {
    pc = new webkitRTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

