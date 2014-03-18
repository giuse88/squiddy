/*
  Peer Session 
  
  information to be saved in the session 
   room id
   isconnected 
   is initiator 

*/

var app = app || {};

(function() {

    var qvga  = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 180
            }
        }
    };

    var vga  = {
        video: {
            mandatory: {
                maxWidth: 640,
                maxHeight: 360
            }
        }
    };

    var hd  = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    };

    var none = {
        video: false
    };
    var videoOptions = {
        "NONE" : none,
        "VGA"  : vga,
        "HD"   : hd,
        "QVGA" : qvga
    };

  app.PeerSession = Backbone.Collection.extend({
  model: app.PeerConnection,

  initialize: function() {
    //
    this._attributes = {
       pcConstraints    : {"optional": [{"DtlsSrtpKeyAgreement": true}]},
       constraints      : { mandatory : { OfferToReceiveAudio : true, OfferToReceiveVideo : true }},
       mediaConstraints : { /*"audio": true ,*/ "video": true }
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
  _setOnMessageHandler : function() {
      var self = this;
      self._signalingService.setHandlerForMessageEvent(function(message){
          LOG.info("Received message from peer " + message.from +". ", message);
          var id = message.from;

          // Is this always true?
          // what about the ICE_CANDIDATE
          if (!self.getPeer(id) && message.type === "OFFER")
              self.add( new app.PeerConnection(id, self));
          else if ( !self.getPeer(id))
               LOG.error("Received an unknown message", message);

          var newPeer = self.getPeer(id);
          newPeer.dispatchMessage(message);
      });
  },
  _setOnByeHandler : function() {
      var self = this;
      self._signalingService.setHandlerForByeEvent(function(data){
         //
          LOG.info("Closing connection with peer '" +  data.peerId +"' .", data);
          // TODO create a method in the session whihc provicdes this functionality
          var peerToBeRemoved = self.getPeer(data.peerId);
          self.remove(peerToBeRemoved);
          LOG.info("Connection with peer '"+ data.peerId + " closed.");
          LOG.info("Removed model for  peer '"+ peerToBeRemoved.getPeerId() + " closed.");
         //
      });
  },

  _setOnNewPeerHandler : function() {
      var self = this;
      self._signalingService.setHandlerForNewPeerEvent(function(data){
          //
            LOG.info("Connecting to peer " +  data.peerId +".", data);
            var newPeer = new app.PeerConnection(data.peerId, self, true);
            self.add(newPeer);
            LOG.info("Connected to peer "+ data.peerId +" completed.");
          //
      });
  },
  _setOnJoinedHandler : function() {
      // TODO is there the possibility that a peer connect when the session is not ready?
      var self = this;
      self._signalingService.setHandlerForJoinedEvent(function(data){
          if ( data.roomId  !== self._roomId)
                LOG.error("Received invalid roomId from the server.",data);
          self.setConnected();
          LOG.info("Peer " + self._peerId + " joined  room  " + data.roomId +" .");
      });
  },

  send: function (destination, data, type) {
    var message = { 
      to     : destination, 
      from   : this._peerId,
      roomId : this._roomId,
      msg    : data 
    };
    //
     if (type)
        message.type = type;
    //
    this._signalingService.send(events.MESSAGE, message);
    LOG.info("Sent message to " + destination + ".", data);
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

   printPeers : function(id) {
        return this.each(function(peer) { console.log(peer._peerId)});
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

   _removeLocalStream : function(){
       this._localStream.stop();
       this.trigger('removedLocalStream', this._localStream);
   },

   // THis should go to an indipendent  module
  _doGetUserMedia: function(videoOption, audioOption) {
    var self = this;

    if(videoOption.toUpperCase() === "NONE") {
        this._removeLocalStream();
        return;
    }

    var mediaConstraints = {};

    if(videoOption){
      mediaConstraints = $.extend(mediaConstraints, videoOptions[videoOption.toUpperCase()]);
    } else
      mediaConstraints = $.extend(mediaConstraints, {video:true});

    if(audioOption)
      mediaConstraints = $.extend(mediaConstraints, audioOption);
    else
      mediaConstraints = $.extend(mediaConstraints, {audio:false});

    LOG.info("MediaConstraints - ", mediaConstraints);

    function onUserMediaSuccess (stream) {
      LOG.info('User has granted access to local media.');
      self._localStream = stream;
      self.trigger('localStream', stream);
    };
  
    function onUserMediaError (error) {
      LOG.error('Failed to get access to local media. Error code was ' + error.code);
    };

    try {
      //
      this._localStream && this._localStream.stop();
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

