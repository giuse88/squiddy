/* PeerConnection.js */

var app = app || {};

(function() {

app.PeerConnection = Backbone.Model.extend({
  
  defaults: {
    isStarted           : false,
    isInitiator         : false,
    msgQueue            : null,
    session             : null,
    remoteStream        : null,
    remoteConnection    : null,
    localStream         : null,
    peerId              : 'none',
    iceConnectionState  : 'none',
    iceGatheringState   : 'none',
    signalingState      : 'none',
    status              : 'none',
    acceptIceCandidates : false,
    remoteIceCandidates : null,
    defaultOfferConstraints : null,
    defaultAnswerConstraints : null
  },

  //===============================
  //         CONSTRUCTOR
  //===============================

  initialize: function(id, session, isInitiator) {
    var self=this; 
    
    this.attributes.msgQueue = new Array();
    this.attributes.remoteIceCandidates = new Array();
    this.attributes.peerId = id;
    this.attributes.session = session;
    this.attributes.defaultOfferConstraints  = { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }};
    this.attributes.defaultAnswerConstraints = { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }};

    this.attributes.session.on('localStream', function(stream) {self._addLocalStream(stream, true)});
    this.attributes.session.on('removedLocalStream', function(stream){ self._removeLocalStream(stream, true)});

    if(isInitiator)
      this.set('isInitiator', true);  

    if (session.isSessionReady())
      this._start(); 
    else 
      session.on('ready', function() { console.log("Session ready" + self.getPeerId()); self._start()}); 

     this._log("Initialization peer connection completed.");
  },

  //============================
  //        PUBLIC INTERFACE
  //

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

  getSignalingState : function() {
    return this.get('signalingState');
  },

  getIceConnectionState : function() {
    return this.get('iceConnectionState');
  },

  getIceGatheringState : function() {
    return this.get('iceGatheringState');
  },

  dispatchMessage : function (msg) {
   //
    if(this.isStarted())
      this.processMessage(msg);
    else
      this.attributes.msgQueue.push(msg);
   //
   //this._log("Dispatched message.", msg);
  },

  //===================================
  //        PRIVATE
  //===================================
  _start: function() {

    this._createPeerConnection();

    this.set('isStarted', true);
    this._log("Is initiator : " + this.isInitiator());

    this.processQueue();
   
    if (this.isInitiator())
     this.doOffer();

    this._log("Started.");
  },


  //===================================
  // Message processing
  //===================================

  processQueue: function () {
    this._log("Messages pending in the queue : " + this.attributes.msgQueue.length);
    //
    while(this.attributes.msgQueue.length > 0)
        this.processMessage(this.attributes.msgQueue.shift());
    //
  }, 

  processMessage: function (message) {
  //
      var self= this;
  //
  if (message.type === 'ICE_CANDIDATE'){
    this.addRemoteIceCandidate(message.msg);
  } else if ( message.type === 'OFFER') {
    this._setRemoteDescription(message.msg, function () {
        self.doAnswer();
    });
  } else if ( message.type === 'ANSWER') {
      this._setRemoteDescription(message.msg);
  } else {
    this._err("Unknown  message");
  }
  },

  //===============================
  // ICE candidates
  //===============================

  _addIceCandidate: function(candidate, successCB, errorCB) {

      var self = this;

      var success = function () {
          self._log("Successfully add remote ICE candidate.", candidate);
          successCB && successCB();
      };

      var error = function (err) {
          self._err("Error when adding a remote ICE candidate. Error :" + err, candidate);
          errorCB && errorCB(err);
      };
      console.log(candidate);
      //console.log(this.get('remoteConnection'));
      this.get('remoteConnection').addIceCandidate(candidate, success, error);
  },

 /*  old_addRemoteIceCandidate : function (message) {
        var candidate = new RTCIceCandidate(message);
        //this.get('remoteConnection').addIceCandidate(candidate);
        this._addIceCandidate(candidate);
        this._log("Added Remote ICE candidate", candidate);
    },
 */
  addRemoteIceCandidate : function (message) {

     if ( message === "ICE_COMPLETED" ) {
         this.set('acceptIceCandidates', false);
         this._log("Remote Ice candidate gathering complete");
         return;
     }
     var candidate = new RTCIceCandidate(message);
     //
     if(this.get('acceptIceCandidates'))
         this._addIceCandidate(candidate);
      else {
        this.get('remoteIceCandidates').push(candidate);
        this._log("Cached Remote ICE candidate", candidate);
     }
   },

    processIceCandidates: function(){
      //
      _.each(this.get('remoteIceCandidates'), function (iceCandidate){
           this._addIceCandidate(iceCandidate);
      }, this);
      //
      this.get('remoteIceCandidates').length = 0;
      this.set('acceptIceCandidates', true);
      //
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

  onIceCandidate: function(event, status) {

        this.set('iceGatheringState', status);

        if (event.candidate) {
            //
            this._log("Gathered LOCAL " + this._iceCandidateType(event.candidate.candidate)
                + " Ice candidate." + " Status : " + status + ".", event.candidate);
            this._sendIceCandidate(event.candidate);
            //
        } else {
            // to comunicate the end of the remote Ice candidates ( weak mechanism §)
            this._sendIceCandidate("ICE_COMPLETED");
            this._log("End gathering LOCAL Ice candidates." + " Status : " + status + ".");
        }
   },

   // ========================================
   //           OFFER // ANSWER
   // ========================================

  _sendAnswer    : function( answer ) {
      this.attributes.session.send(this.attributes.peerId, answer , "ANSWER");
  },

  _sendOffer     : function( offer  ) {
      this.attributes.session.send(this.attributes.peerId, offer, "OFFER");
  },

  _setLocalDescriptor : function (localSDP, successCB, errorCB) {
      var self = this;
      var pc = this.get('remoteConnection');

      var success = function() {
         self._log("Local descriptor successfully installed.")
         self._log("Signal State : ", pc.signalingState);
         successCB && successCB();
      }

      var error = function(err) {
         self._err("Error setting local descriptor. Cause :" + err);
         console.error(self.get('remoteConnection'));
         alert(err);
         errorCB && errorCB(err);
      }

      try{
        pc.setLocalDescription(new RTCSessionDescription(localSDP), success, error);
      }catch(e){
        self._err("An Exception was thrown when setting a local descriptor", e);
        alert(e);
        errorCB && errorCB();
      }
  },

  _setRemoteDescription:function (remoteSDP, successCB, errorCB){

      var pc = this.get('remoteConnection');
      var self = this;

      var success = function () {
          self._log("Remote descriptor successfully installed.");
          self._log("Signal State : ", pc.signalingState);
          self.processIceCandidates();
          successCB && successCB();
      }

      var error = function(err) {
          self._err("Error setting remote descriptor. Cause :" + err + ". Values : ");
          console.error(remoteSDP);
          console.error(self.get('remoteConnection'));
          alert(err);
          errorCB && errorCB();
      }

      try {
        pc.setRemoteDescription(new RTCSessionDescription(remoteSDP) ,success,  error);
      }catch(e){
         self._err("An Exception has been thrown when setting a remote descriptor", e);
         errorCB && errorCB();
      }
  },

  doOffer : function (successCB, errorCB, additionalConstraints) {

    var  constraints = $.extend(true, this.get('defaultOfferConstraints'),  additionalConstraints || {});
    this._log("Creating offer for peer " + this.getPeerId() + " with constraints : ", constraints);
    var self = this;

    var sussessOffer = function (localSDP) {
        self._log("Obtained local session descriptor : ", localSDP);
        self._setLocalDescriptor(localSDP, function(){
            self._sendOffer(localSDP);
        });
        successCB && successCB();
    };

    var errorOffer = function (err) {
        var msg = "Error when creating an offer" + err;
        self._err(msg);
        alert(msg);
        errorCB && errorCB(err);
    }
    //
    this.attributes.remoteConnection.createOffer(sussessOffer,errorOffer, constraints);
    //
  },

  doAnswer : function () {
    //
    var  constraints =  { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }};
    this._log("Creating answer for peer " + this.getPeerId() + " with constraints : ", constraints);
    var self = this;

    var sussessAnswer = function (localSDP) {
        LOG.info("Obtained local session descriptor : ", localSDP);
        self._setLocalDescriptor(localSDP,function(){
            self._sendAnswer(localSDP);
        });
    };

    var errorAnswer = function (err) {
        var msg = "Error when creating an answer" + err;
        self._err(msg);
        alert(err);
    }
    //
    this.attributes.remoteConnection.createAnswer(sussessAnswer, errorAnswer, constraints);
    //
  },


   //==================================
   //   stream
   //----------------------------------


  _addLocalStream: function(stream, renegotiation) {
    console.log(stream);
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
    //
    var status = this._extractStatusForSignalingStateChange(event);
    this.set('signalingState',status);
    //
    this._log("The signal status has changed to " + this.get('signalingState'));
   },

   onIceConnectionStatusStateChange : function (event) {
   //
    var status = this._extractStatusForICEStateChange(event);
    this.set('iceConnectionState', status);

    if( status === "Failed") {
        var restartIceConnection = {mandatory: {IceRestart: true}};
        this._err("Connection to remote peer failed. Attempting a new connection");
        this.doOffer(null,null, restartIceConnection);
    }
      /*
        THIS MUST TESTED
       if( the connection is set to disconnect)
       You can restart the ice connection by creating a new offer with
       peerConnection.createOffer(successCallback, failureCallback, {mandatory: {IceRestart: true}}),
       and configuring your successCallback to do a complete negotiation (setLocalDescription,
       send offer over the signaling channel, etc.).
       */
   //
   this._log("Ice connection has changed to " + this.get('iceConnectionState'));
   },

  _createPeerConnection: function() {
  var self = this;
  var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
  //  var  pcConstraints   = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
      var pcConstraints = {"optional": []};
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
   },

   _extractStatusForSignalingStateChange: function (event) {
      var status ="Status Error";
       //
      if (event && event.srcElement && event.srcElement.signalingState)
         status = event.srcElement.signalingState;
      else if (event && navigator.sayswho.indexOf('Firefox') > -1 )
         status = event; /* FIREFOX */
      else
        this._err("Signaling change status : invalid event.", event);
       //
       return status;
    },

    _extractStatusForICEStateChange: function (event) {
        var status ="Status Error";
        //
        if ( navigator.sayswho.indexOf('Chrome') > -1  && event.srcElement
            && event.srcElement.iceConnectionState )
            status = event.srcElement.iceConnectionState;
        else if ( navigator.sayswho.indexOf('Firefox') > -1  && event.explicitOriginalTarget  &&
           event.explicitOriginalTarget.iceConnectionState)
            status = event.explicitOriginalTarget.iceConnectionState;
        else
            this._err("ICE change status : invalid event.", event);
        //
        return status;
    }
});

})();
