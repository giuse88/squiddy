/* PeerConnection.js */

var app = app || {};

(function() {

    app.PeerConnection = Backbone.Model.extend({
  
  /* costants */
  WAITING:0, 
  CONNECTING:1,
  CONNECTED:2, 
  UNKNOWN:3, 

  defaults: {
    status : this.UNKNOWN, 
    isStarted   : false,  
    msgQueue : null,  
    session : null,
    peerId : '',
    remoteStream  : null, 
    isInitiator : false, 
    isStarted : false, 
    remoteConnection : null
  }, 

  initialize: function(id, session, isInitiator) {
    var self=this; 
    
    this.attributes.msgQueue = new Array(); 
    this.attributes.peerId = id;
    this.attributes.session = session; 
    
    if(isInitiator) 
      this.set('isInitiator', true);  

    if (session.isSessionReady())
      this._start(); 
    else 
      session.on('ready', function() { console.log("Session ready" + self.getPeerId()); self._start()}); 

    console.log("Creating Peer Connection");  
  },

  getPeerId: function () {
    return this.attributes.peerId; 
  }, 

  isInitiator : function() {
    return this.get('isInitiator'); 
  }, 

  _start: function() {
    LOG.info("START");
    console.log("Messages pending in the queue : " + this.attributes.msgQueue.length); 
   this._createPeerConnection();
   //this._addLocalStream();
   this.set('isStarted', true); 
   console.log("Is initiator : " + this.isInitiator()); 

   this.processQueue();
   
   if (this.isInitiator())
     this.doOffer();
   
  }, 
  
  _addLocalStream: function() {
   this.attributes.remoteConnection.addStream(this.attributes.session.getLocalStream()); 
  },  

  isStarted: function() {
   return this.get('isStarted'); 
  }, 

  processQueue: function () {
  while(this.attributes.msgQueue.length > 0)
    this.processMessage(this.attributes.msgQueue.shift());
  }, 

  onUserMediaError: function (error) {
  console.log('Failed to get access to local media. Error code was ' + error.code);
  alert('Failed to get access to local media. Error code was ' + error.code + '.');
  }, 

  processMessage: function (message) {
  //
  var pc = this.get('remoteConnection');
  //
  if (message.type === 'ICE_CANDIDATE'){
     this.addRemoteIceCandidate(message.msg);
  } else if ( message.type === 'OFFER') {
    pc.setRemoteDescription( new RTCSessionDescription(message.msg));
    this.doAnswer();
  } else if ( message.type === 'ANSWER') {
    pc.setRemoteDescription( new RTCSessionDescription(message.msg));
  } else {
    console.log("Unknow message");
  }
  },

  onRemoteStreamRemoved: function () {
    console.log("Stream Removed"); 
  }, 

  onRemoteStreamAdded : function (event) {
  this.set('remoteStream', event.stream);
  this.get('session').trigger('peer:ready', this);
  //attachMediaStream(remoteVideo, remoteStream);
  },

  addRemoteIceCandidate : function (message) {
        var candidate = new RTCIceCandidate(message);
        this.get('remoteConnection').addIceCandidate(candidate);
        LOG.info("Added Remote ICE candidate", candidate);
    },

  _iceCandidateType: function(candidateSDP) {
  if (candidateSDP.indexOf("typ relay ") >= 0)
    return "TURN";
  if (candidateSDP.indexOf("typ srflx ") >= 0)
    return "STUN";
  if (candidateSDP.indexOf("typ host ") >= 0)
    return "HOST";
  return "UNKNOWN";
  }, 

  _sendIceCandidate : function( candidate ) {
      this.attributes.session.send(this.attributes.peerId, candidate,  "ICE_CANDIDATE");
  },
  _setRemoteDescriptor : function (remoteSDP) {
      "use strict";
  },

  _setLocalDescriptor : function (localSDP) {
      this.get('remoteConnection').setLocalDescription(localSDP);
  },

  _sendAnswer    : function( answer ) {
      this.attributes.session.send(this.attributes.peerId, answer , "ANSWER");
  },
  _sendOffer     : function( offer  ) {
      this.attributes.session.send(this.attributes.peerId, offer, "OFFER");
  },

  onIceCandidate: function(event, status) {
    if (event.candidate) {
        //
        LOG.info("Gathered LOCAL " + this._iceCandidateType(event.candidate.candidate)
                 + " Ice candidate." + " Status : " + status + ".", event.candidate);
        this._sendIceCandidate(event.candidate);
        //
    } else {
        LOG.info("End gathering LOCAL Ice candidates." + " Status : " + status + ".");
    }
  },



  doOffer : function () {
    //
    var  constraints =  { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }};
    LOG.info("Creating offer for peer " + this.getPeerId() + " with constraints : ", constraints);
    var self = this;

    var sussessOffer = function (localSDP) {
        LOG.info("Obtained local session descriptor : ", localSDP);
        self._setLocalDescriptor(localSDP);
        self._sendOffer(localSDP);
    };

    var errorOffer = function (err) {
        LOG.error("Error when creating an offer", err);
    }
    //
    this.attributes.remoteConnection.createOffer(sussessOffer,errorOffer, constraints);
    //
  },

  doAnswer : function () {
    //
    var  constraints =  { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }};
    LOG.info("Creating answer for peer " + this.getPeerId() + " with constraints : ", constraints);
    var self = this;

    var sussessAnswer = function (localSDP) {
        LOG.info("Obtained local session descriptor : ", localSDP);
        self._setLocalDescriptor(localSDP);
        self._sendAnswer(localSDP);
    };

    var errorAnswer = function (err) {
        LOG.error("Error when creating an answer", err);
    }
    //
    this.attributes.remoteConnection.createAnswer(sussessAnswer,errorAnswer, constraints);
    //
  },

  /*
  doAnswer : function () {
    var self = this; 
    console.log("Creting answer" + this.getPeerId());
    this.attributes.remoteConnection.createAnswer(function(localDescriptor) {
                                                 self.gotDescriptor(localDescriptor)},
                                                 function() {}, constraints);
  },

  gotDescriptor : function(localDescription) {

    this.get('remoteConnection').setLocalDescription(localDescription); 
    this.get('session').send(this.getPeerId(), localDescription);
    console.log("I have got : " + localDescription);
  }, 

   */
  dispatchMessage : function (msg) {
    LOG.info("Dispatched message to Peer " + this.getPeerId() + ". ", msg);
    if(this.isStarted())
      this.processMessage(msg);
    else 
      this.attributes.msgQueue.push(msg);
  }, 

/*  
  getMessage: function() {
    if ( msg.length < 1) 
      return null; 
    else 
     return  this.mswQueue.shift(); 
  }, 
*/
 _createPeerConnection: function() {
  var self = this;
  var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
  var  pcConstraints   = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
  try{
    this.attributes.remoteConnection = new RTCPeerConnection(pcConfig, pcConstraints);
    var pc =  this.attributes.remoteConnection;
        pc.onicecandidate = function(e) { self.onIceCandidate(e, pc.iceGatheringState)};
        pc.oniceconnectionstatechange= function(e) {console.log("kkkk" + e);};
        pc.onsignalingstatechange = function(e) {console.log("ffff"); console.log(e);};

  console.log('Created RTCPeerConnnection with:\n' +
              'config: \'' + JSON.stringify(pcConfig) + '\';\n' +
              'constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object; \n WebRTC is not supported by this browser.');
    return;
  }
  //pc.onaddstream = function(e) { self.onRemoteStreamAdded(e);};
 // pc.onremovestream = this.onRemoteStreamRemoved;
  
  }

});

})();
