/* PeerConnection.js */

var app = app || {};

(function() {

    var  SET_LOCAL_DESCRIPTION_DELAY  = 1000;
    var  DEFAULT_CONNECTION_ATTEMPTS = 3;
    var  RENEGOTIATION_DELAY = 1000;

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
    defaultAnswerConstraints : null,
    connectionAttempts : 3,
    isRenegotiationScheduled : false
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

    if(isInitiator)
      this.set('isInitiator', true);  

    // to be removed
    if (session.isSessionReady())
      this._start(); 
    else 
      session.on('ready', function() { console.log("Session ready" + self.getPeerId()); self._start()}); 

     this._log("Initialization peer connection completed.");
  },

  //============================
  //        PUBLIC INTERFACE
  //

  removeLocalStream:function(stream){
     this._removeLocalStream(stream, false)
  },

  addLocalStream:function(stream){
     this._addLocalStream(stream, false);
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

  getIsRenegotiationScheduled : function() {
    return this.get('isRenegotiationScheduled');
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
    else {
      this.attributes.msgQueue.push(msg);
      this._log("Message saved in the queue.", msg);
    }
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


  close: function() {

      this.set('isStarted', false);
   //    signalingReady = false;
      this.get('remoteConnection').close();
      this.set('remoteConnection', null);
 //          remoteStream = null;
 //         msgQueue.length = 0;
      this._log("Closed connection");
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
    this._log("Messages pending in the queue processed.");
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
            this.maybeTriggerConnected();
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
      var attempt = this.get('connectionAttempts');

      console.log(pc);
      this._status();

      var success = function() {
         self._resetConnectionAttempts();
         self._log("Local descriptor successfully installed.")
         self._log("Signal State : ", pc.signalingState);
         successCB && successCB();
      }

      var error = function(err) {
         self._resetConnectionAttempts();
         self._err("Error setting local descriptor. Cause :" + err);
         console.error(self.get('remoteConnection'));
         alert(err);
         errorCB && errorCB(err);
      }

      if ( attempt  > 0 &&  !(pc.signalingState == "have-local-offer")){
        //
        try{
          pc.setLocalDescription(new RTCSessionDescription(localSDP), success, error);
        }catch(e){
            self._err("An Exception was thrown when setting a local descriptor", e);
            alert(e);
            errorCB && errorCB();
        }
       //
      }else if ( attempt > 0 ){
          // new attempt
          this._log("Rescheduling new attempt to set local description");
          setTimeout(function() {
            self._log("Attempt " + attempt + " to setLocalDescription");
            self.set('connectionAttempts', attempt - 1);
            self._setLocalDescriptor(localSDP, successCB,errorCB);
          }, SET_LOCAL_DESCRIPTION_DELAY);
          //
      } else {
          var mes = "I cannot set local description. Exceed attempts.";
          this._err(mes)
          alert(mes);
      }
  },

  _setRemoteDescription:function (remoteSDP, successCB, errorCB){

      var pc = this.get('remoteConnection');
      var self = this;

      var success = function () {
          self._log("Remote descriptor successfully installed.");
          self._log("Signal State : ", pc.signalingState);
          self.processIceCandidates();
          console.log( "remote stream : " + pc.remoteStream);
          console.log(pc);
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

    this._log("Creating offer for peer " + this.getPeerId() + " with constraints : ", constraints);
    var  constraints = $.extend(true, this.get('defaultOfferConstraints'),  additionalConstraints || {});
    var self = this;

    var sussessOffer = function (localSDP) {
        localSDP.sdp = removeAllCryptoLines(localSDP.sdp);
        self._log("Obtained local session descriptor : ");
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
        // this should not be neccessary
        localSDP.sdp = removeAllCryptoLines(localSDP.sdp);
        console.log(localSDP.sdp);
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
    var pc = this.get('remoteConnection');
    this.set('localStream', stream);
    pc.addStream(stream);
    LOG.info("Added local stream to peer connection : " + this.getPeerId());

    if (renegotiation)
        this.scheduleRenegotiation()
  },

  _removeLocalStream: function(stream, renegotiation) {
    this.attributes.remoteConnection.removeStream(stream);
    this.set('localStream', null);
    if (renegotiation)
        this.scheduleRenegotiation()
    LOG.info("Removed local stream from peer connection : " + this.getPeerId());
     },

  old_doRenegotiation : function () {
    this._log("Starting renegotiation.");
    // I don't think it is neccessary here
    //var restartIceConnection = {mandatory: {IceRestart: true}};
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
    this.maybeTriggerConnected();
    //
    this._log("The signal status has changed to " + this.get('signalingState'));
   },

   onIceConnectionStatusStateChange : function (event) {
   //
    var status = this._extractStatusForICEStateChange(event);
    this.set('iceConnectionState', status);

    if( status === "failed") {
        //var restartIceConnection = {mandatory: {IceRestart: true}};
        this._err("Connection to remote peer failed. Attempting a new connection");
        this.scheduleRenegotiation();
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
   this.maybeTriggerConnected();
   this._log("Ice connection has changed to " + this.get('iceConnectionState'));
   },

  _createPeerConnection: function() {
  var self = this;
  var pcConfig = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
  var pcConstraints   = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
  //var pcConstraints = {"optional": []};
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
  pc.onnegotiationneeded = function (event) {
      // this is a bug in chrome in my point of view
      if ( pc.iceConnectionState == 'new')
            self._log("Skip renegotiation");
      else
            self.scheduleRenegotiation();
    }
  //
  },

   //=====================================//
   //             RENEGOTIATION           //
   //=====================================//

    scheduleRenegotiation : function() {

       var self = this;
       this._log("Scheduling renegotiation.");
       var restartIceConnection = {mandatory: {IceRestart: true}};

        var performRenegotiation  = function() {
            self.set("isRenegotiationScheduled", true);
            if (self._isFullStable()) {
                // start renegotiation
                self._log("Performing renegotiation.");
                self.doOffer(null,null, restartIceConnection);
                // not sure about this
                self.set("isRenegotiationScheduled", false);
            }else {
                self._log("Renegotiation cannot be performed in this status. Trying again in 1s.");
                setTimeout(performRenegotiation, RENEGOTIATION_DELAY)
            }
        };

        if (this.get("isRenegotiationScheduled")) {
            this._log("Renegotiation already scheduled. SKIPPED");
            return;
        }else {
            performRenegotiation();
        }
    },

  //=====================================//
  //            PRIVATE METHODS          //
  //=====================================//

    _isFullStable : function() {
        return this._isICEConnected() &&
               this._isICEGatheringCompleted() &&
               this._isSingnalStable();
    },

    _isSingnalStable : function () {
        var pc = this.get('remoteConnection');
        return "stable" ===   pc.signalingState;
    },
    _isICEGatheringCompleted : function () {
        var pc = this.get('remoteConnection');
        return "complete" ===  pc.iceGatheringState;
    },
    _isICEConnected : function () {
        var pc = this.get('remoteConnection');
       return "completed" === pc.iceConnectionState ||
              "connected" === pc.iceConnectionState;
    },

    maybeTriggerConnected : function() {
        if(this._isFullStable()) {
          this.trigger("connected");
          this._log("PeerConnected event triggered");
        }
    },

    _resetConnectionAttempts : function(){
       this.set('connectionAttempts', DEFAULT_CONNECTION_ATTEMPTS);
    },

   _status : function() {
       var pc = this.get('remoteConnection');
       this._log("-- STATUS -- " +
           " SignalState : "  + pc.signalingState+
           " iceGatheringState :"+ pc.iceGatheringState +
           " iceConnectionState : " + pc.iceConnectionState )
   },

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
