/*
  Peer Session 
  
  information to be saved in the session 
   room id
   isconnected 
   is initiator 

*/

var app = app || {};

(function() {

app.PeerSession = Backbone.Collection.extend({
  model: app.PeerConnection,

  initialize: function() {
    //
    this._attributes = {
       pcConstraints    : {"optional": [{"DtlsSrtpKeyAgreement": true}]},
       constraints      : { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }},
       mediaConstraints : { "audio": true , "video": true }
    };
    //
    this._localStream = null;
    this._connected = false;
    // room Id
    this._sessionId = get_room_id_from_url() || '';
    this._roomId    = this._sessionId;
    // Signaling
    this._signalingService = new SignalingService();
    this._setOnConnectHandler();
    this._setOnMessageHandler();
    this._setOnByeHandler();
    this._setOnNewPeerHandler();
    this._setOnJoinedHandler();
    // User Media
    //this._doGetUserMedia();
    //
    LOG.info("Session " + this._sessionId +  " initialized");
  },

  _setOnConnectHandler : function(){
      //
      var self = this;

      self._signalingService.connect( function(data) {

      if (!data){
          error("PeerId not received from the server.", data);
          return;
      }
      //
      self._peerId = data.peerId;
      LOG.info("Got Peer Id : " + self._peerId +  ".");
      LOG.info("Peer " + self._peerId + " is connected to the remote server.");
      //
      self._sendJoinRequest();
      //
      });
      //
  },

  _sendJoinRequest : function() {
      var request ={
          peerId : this._peerId,
          roomId : this._roomId
      };
      this._signalingService.send(events.JOIN, request);
      LOG.info("Peer " + this._peerId + " has sent request to join room " + this._roomId + ".");
  },
  _setOnMessageHandler : function() {},
  _setOnByeHandler : function() {},

  _setOnNewPeerHandler : function() {
     // when another peer connect
      var self = this;
      self._signalingService.setHandlerForNewPeerEvent(function(data){
          //
            LOG.info("New peer has connected", data);
            var newPeer = new app.PeerConnection(data.peerId, self, true);
            self.add(newPeer);
          //
      });
  },
  _setOnJoinedHandler : function() {
      // TODO is there the possibility that a peer connect when the session is not ready?
      var self = this;
      self._signalingService.setHandlerForJoinedEvent(function(data){
          if ( data.roomId  !== self._roomId)
                LOG.error("Received invalid roomId from the server.",data);
          self._connected = true;
          LOG.info("Peer " + self._peerId + " joined  room  " + data.roomId +" .");
      });
  },

  send: function (destination, data) {
    var message = { 
      to     : destination, 
      from   : this._sessionId,  
      roomId : this._roomId, 
      msg    : data 
    };
    this._signalingService.send(events.MESSAGE, message);
  },

  isSessionReady: function() {
   return this._connected;
  }, 

  _triggerSessionReadyEvent: function () {
    if (this.isSessionReady())
      this.trigger('ready', this); 
  }, 

  getSocket: function() {
    return this._socket; 
  }, 

  getRoomId: function() {
   return this._roomId;
  }, 

  setConnected : function () {
    this._connected = true;
    this._triggerSessionReadyEvent(); 
  }, 

  isConnected : function () {
    return this._connected; 
  }, 

  setRoomId: function(roomId) {
   this._roomId = roomId; 
  }, 

  getSessionId: function() {
   return this._sessionId; 
  },

  getLocalStream: function() {
    return this._localStream;
  },

  getPeer : function(id) {
    return this.findWhere({ peerId : id });  
  },

  getMyPeerId : function() {
      "use strict";
      return this._peerId;
  },

  attr: function(prop, value) {
    if (value === undefined)
        return this._attributes[prop]
     else {
        this._attributes[prop] = value;
        this.trigger('change:' + prop, value);
    }
  }, 
  
  _doGetUserMedia: function() {
    var self = this; 
    
    function onUserMediaSuccess (stream) {
      LOG.info('User has granted access to local media.');
      self._localStream = stream;
      self._triggerSessionReadyEvent(); 
    };
  
    function onUserMediaError (error) {
      LOG.error('Failed to get access to local media. Error code was ' + error.code);
      alert('Failed to get access to local media. Error code was ' + error.code + '.');
    };

    try {
      var mediaConstraints = self.attr('mediaConstraints');
      LOG.info("MediaConstraints - ", mediaConstraints);
      //
      getUserMedia(mediaConstraints, onUserMediaSuccess, onUserMediaError);
      //
      LOG.info('Requested access to local media with mediaConstraints:\n' +
                  '  \'' + JSON.stringify(mediaConstraints) + '\'');
    } catch (e) {
      alert('getUserMedia() failed. Is this a WebRTC capable browser?');
      LOG.error('getUserMedia failed with exception: ' + e.message);
    }
  } 

});

})();

