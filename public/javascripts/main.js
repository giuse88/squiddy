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
var isStarted   = false; 

var room = ''; 
var peer = ''; 
var socket = null; 

var offerConstraints = {"optional": [], "mandatory": {}};
var mediaConstraints = { /*"audio": true ,*/ "video": true};
var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
// Types of gathered ICE Candidates.
var gatheredIceCandidateTypes = { Local: {}, Remote: {} };
var pcConstraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
var constraints = { mandatory : { OfferToReceiveAudio : true, 
                                       OfferToReceiveVideo : true }}; 
var msgQueue = []; 

// Dom objects
var localVideo    = undefined; 
var localStream   = undefined; 

// stream objects
var remoteVideo   = undefined; 
var remoteStream  = undefined;

// What if there a mulitple peer? this should a list :D 
var pc = null;  // peer Connection 

var session =null;

function initialization() {


 session = new app.PeerSession(); 
 
 console.log("Peer id " + session.getPeerId());  
 console.log("Room id " + session.getRoomId());  

  // install signaling channel 
  openChannel();
  // install local media
//  doGetUserMedia();T
 
  setInterval(function() { console.log("Is session ready : " + session.isSessionReady())}, 1000); 
  // set local vido object 
//  localVideo = $('#localVideo')[0]; //dom  
//  remoteVideo = $('#remoteVideo')[0]; //dom 
}

function openChannel() {

  var roomRequest = {
                  peerId : session.getPeerId(), 
                  roomId : session.getRoomId()
                }; 

  //connect to the remote server throug a web socket
  session.setSocket(io.connect());

  var socket = session.getSocket(); 

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

  // Peer disconnection 
  socket.on(BYE, onBye); 
}

function onBye(data) {
  console.log("Peer " + data.peerId + " has been disconnected ( ROOM : " + data.roomId + " ) " );  
}


function onJoined(data) {
//  setStatus("Connected");
  room = data.roomId; 
//  isInitiator=false; 
//  isConnected=true; 
  console.log("Joined room " + room); 
  session.setConnected();
 // start();
 // I should create a model
}

function onCreated(data) {
  session.setRoomId(data.roomId); 
  session.setAsInitiator(); 
  session.setConnected(); 
 // isConnected=false; 
  console.log("Created room " + session.getRoomId()); 
}

function onJoin(data) {
  //setStatus("Connected"); 
  console.log("Peer " + data.peerId + " joined room " + data.roomId); 
  session.add(new app.PeerConnection(data.peerId)); 
 // isConnected = true; 
 // start();
 // I should create a model
}

function onMessage(data) {

  console.log("Peer " + data.peerId + " : " + data.roomId + " " + data.msg);
  var message = data.msg; 

  if (isStarted)  
    processMessage(message);
  else 
    msgQueue.push(message); 

}

function processMessage(message) { 
  if (message.type === 'candidate') {
    var candidate = new RTCIceCandidate({sdpMLineIndex: message.label,
                                         candidate: message.candidate});
    noteIceCandidate("Remote", iceCandidateType(message.candidate));
    pc.addIceCandidate(candidate);
  }
  else if ( message.type === 'offer') { 
    pc.setRemoteDescription( new RTCSessionDescription(message));
    doAnswer();
  } else if ( message.type === 'answer') {
    pc.setRemoteDescription( new RTCSessionDescription(message));
  } else {
    console.log("Unknow message");
  }

}

/* the function start is the most important function. 
 * This function starts the coommunication with the other peer only if the following 
 * conditions are satisfied 
 *
 * - localStream != null, we have got the local media resource
 * - isStarted we are not connected to any peer yet through the webRTC 
 * - isConnected,  we are connected to the other peer via the signaling protocol  
 *
 */

function start() {

  if (!isStarted && typeof localStream != 'undefined' && isConnected) {
    
    // Create peer connection  
    createPeerConnection();
    pc.addStream(localStream);
    
    // there may some messages in the queue 
    processQueue();
    isStarted = true;

    if (isInitiator) 
      doOffer();
  }
   else 
     console.log("Error during start function"); 

}

function processQueue() {
  while(msgQueue.length > 0)
    processMessage(msgQueue.shift());     
}

function onUserMediaError(error) {
  console.log('Failed to get access to local media. Error code was ' + error.code);
  alert('Failed to get access to local media. Error code was ' + error.code + '.');
}

function createPeerConnection() {
  
  try{ 
  pc = new RTCPeerConnection(pcConfig, pcConstraints);
  pc.onicecandidate = onIceCandidate;
  console.log('Created RTCPeerConnnection with:\n' +
              'config: \'' + JSON.stringify(pcConfig) + '\';\n' +
              'constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object; \n WebRTC is not supported by this browser.');
    return;
  }
  pc.onaddstream = onRemoteStreamAdded;
  pc.onremovestream = onRemoteStreamRemoved;
 // pc.onsignalingstatechange = onSignalingStateChanged;
  pc.oniceconnectionstatechange = onIceConnectionStateChanged;
  
}


function onRemoteStreamRemoved() {
}

function onRemoteStreamAdded(event) {
  remoteStream=event.stream;
  attachMediaStream(remoteVideo, remoteStream);
}

function iceCandidateType(candidateSDP) {
  if (candidateSDP.indexOf("typ relay ") >= 0)
    return "TURN";
  if (candidateSDP.indexOf("typ srflx ") >= 0)
    return "STUN";
  if (candidateSDP.indexOf("typ host ") >= 0)
    return "HOST";
  return "UNKNOWN";
}

function onIceCandidate(event) {
  if (event.candidate) {
    sendMessage({type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate});
    noteIceCandidate("Local", iceCandidateType(event.candidate.candidate));
  } else {
    console.log('End of candidates.');
  }
}


function noteIceCandidate(location, type) {
  if (gatheredIceCandidateTypes[location][type])
    return;
  gatheredIceCandidateTypes[location][type] = 1;
  updateInfoDiv();
}

function getInfoDiv() {
  return document.getElementById("info");
}

function updateInfoDiv() {
  var contents = "<pre>Gathered ICE Candidates\n";
  for (var endpoint in gatheredIceCandidateTypes) {
    contents += endpoint + ":\n";
    for (var type in gatheredIceCandidateTypes[endpoint])
      contents += "  " + type + "\n";
  }
  if (pc != null) {
    contents += "Gathering: " + pc.iceGatheringState + "\n";
    contents += "</pre>\n";
    contents += "<pre>PC State:\n";
    contents += "Signaling: " + pc.signalingState + "\n";
    contents += "ICE: " + pc.iceConnectionState + "\n";
  }
  var div = getInfoDiv();
  div.innerHTML = contents + "</pre>";
}


function onIceConnectionStateChanged(event) {
  updateInfoDiv();
}

function sendMessage(data) {
  var message = { 
    peerId : peer, 
    roomId : room, 
    msg :  data 
  };
  socket.emit(MESSAGE, message); 
}

function doOffer() {
  pc.createOffer(gotDescriptor, function() {}, constraints);  
}

function doAnswer() {
  pc.createAnswer(gotDescriptor, function() {}, constraints);   
}

function gotDescriptor(localDescriptor) {
  pc.setLocalDescription(localDescriptor); 
  sendMessage(localDescriptor); 
  console.log("I have got : " + localDescriptor);
}
