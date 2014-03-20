/* PeerConnection.js */

var app = app || {};

(function() {

app.PeerConnection = Backbone.Model.extend({
  
  defaults: {
    isStarted           : false,
    msgQueue            : null,
    session             : null,
    remoteStream        : null,
    localStream         : null,
    peerId              : 'none',
    iceConnectionState  : 'none',
    iceGatheringState   : 'none',
    signalingState      : 'none',
    isInitiator         : false,
    remoteConnection    : null
  }, 

  initialize: function(id, session, isInitiator) {
    var self=this; 
    
    this.attributes.msgQueue = new Array(); 
    this.attributes.peerId = id;
    this.attributes.session = session;

    this.attributes.session.on('localStream', function(stream) {self._addLocalStream(stream, true)});
    this.attributes.session.on('removedLocalStream', function(stream){ self._removeLocalStream(stream, true)});

    if(isInitiator)
      this.set('isInitiator', true);  

    if (session.isSessionReady())
      this._start(); 
    else 
      session.on('ready', function() { console.log("Session ready" + self.getPeerId()); self._start()}); 

    this._log("Initialization peer connection completed.", this.toJSON());
  },


  getPeerId: function () {
    return this.get('peerId');
  }, 

  isInitiator : function() {
    return this.get('isInitiator'); 
  },

  isStarted: function() {
    return this.get('isStarted');
  },

  getRemoteStream : function() {
    return this.get('remoteStream');
  },

  getLocalStream : function() {
    return this.get('localStream');
  },

  dispatchMessage : function (msg) {
   //
    if(this.isStarted())
      this.processMessage(msg);
    else
      this.attributes.msgQueue.push(msg);
   //
   this._log("Dispatched message.", msg);
  },

  //===================================
  //        PRIVATE
  //====
  _start: function() {

    this._createPeerConnection();

    this.set('isStarted', true);
    this._log("Is initiator : " + this.isInitiator());

    this.processQueue();
   
    if (this.isInitiator())
     this.doOffer();

    this._log("Started.");
  },
  
  processQueue: function () {
    this._log("Messages pending in the queue : " + this.attributes.msgQueue.length);
    //
    while(this.attributes.msgQueue.length > 0)
        this.processMessage(this.attributes.msgQueue.shift());
    //
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
    this._err("Unknow message");
  }
  },



  addRemoteIceCandidate : function (message) {
        var candidate = new RTCIceCandidate(message);
        this.get('remoteConnection').addIceCandidate(candidate);
        this._log("Added Remote ICE candidate", candidate);
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

    this.set('iceGatheringState', status);

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

  _addLocalStream: function(stream, renegotiation) {
    this.set('localStream', stream);
    this.attributes.remoteConnection.addStream(stream);
    LOG.info("Added local stream to peer connection : " + this.getPeerId());

    if (renegotiation)
        this.doRenegotiation()
  },

  _removeLocalStream: function(stream, renegotiation) {
    this.attributes.remoteConnection.removeStream(stream);
    this.set('localStream', null);
    if (renegotiation)
        this.doRenegotiation()
    LOG.info("Removed local stream from peer connection : " + this.getPeerId());
     },

  doRenegotiation : function () {
    this.doOffer();
  },



  handleLocalStreams : function() {

    var localStream = this.attributes.session.getLocalStream();

    if (localStream) {
        this._addLocalStream(localStream, false);
    }else {
      this._log("Local stream is not ready yet");
    }
  },

  onRemoteStreamRemoved: function (event) {
    event.stream.stop();
    this.set('remoteStream', null);
    this._log("Remote stream removed.", event.stream);
  },


   onRemoteStreamAdded : function (event) {
    var remoteStream = this.get('remoteStream');
    remoteStream && remoteStream.stop();
    this.set('remoteStream', event.stream);
    this._log("Remote stream added.", this.get('remoteStream'));
  },

   onSignalingStateChange : function (event) {
    this.set('signalingState', event.srcElement.signalingState);
    this._log("The signal status has changed to " + this.get('signalingState'));
   },

   onIceConnectionStatusStateChange : function (event) {
    this.set('iceConnectionState', event.srcElement.iceConnectionState);
    this._log("Ice connection has changed to " + this.get('iceConnectionState'));
   },

  _createPeerConnection: function() {
  var self = this;
  var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
  var  pcConstraints   = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
  try{
    this.attributes.remoteConnection = new RTCPeerConnection(pcConfig, pcConstraints);
    var pc =  this.attributes.remoteConnection;
        pc.onicecandidate = function(e) { self.onIceCandidate(e, pc.iceGatheringState)};
        pc.oniceconnectionstatechange= function(e) { self.onIceConnectionStatusStateChange(e)};
        pc.onsignalingstatechange = function(e) {self.onSignalingStateChange(e)};

  console.log('Created RTCPeerConnnection with:\n' +
              'config: \'' + JSON.stringify(pcConfig) + '\';\n' +
              'constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object; \n WebRTC is not supported by this browser.');
    return;
  }
  // handle local stream
  this.handleLocalStreams();
  // remote streams
  pc.onaddstream = function(stream) {  self.onRemoteStreamAdded(stream);};
  pc.onremovestream = function(stream) { self.onRemoteStreamRemoved(stream);};
  //
  },

  //=====================================//
  //            PRIVATE METHODS          //
  //=====================================//

   _log : function(msg, object) {
       LOG.info( "<" +  this.getPeerId() + "> " + msg, object);
   },

   _err : function(msg, object) {
       LOG.error( "<" +  this.getPeerId() + "> " + msg, object);
   }

});

})();
