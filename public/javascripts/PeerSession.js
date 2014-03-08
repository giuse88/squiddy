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
        audio : true,
        video : true,
        data  : false,
        screen : false
    };
    //
    this._localStream = null;
    this._connected = false;
    //
    this._sessionId = get_room_id_from_url() || '';
    this._roomId    = this._sessionId;
    this._signalingService = new SignalingService();
    this._setOnConnectHandler();
    //
    log("Session " + this._sessionId +  " initialized");
  },

  _setOnConnectHandler : function(){
      //
      this._signalingService.connect( function(data) {

      if (!data){
          error("PeerId not received from the server.", data);
          return;
      }

      self._peerId = data.peerId;
      log("Got Peer Id : " + self._peerId +  ".");
      self._connected = true;
      log("Peer " + self._peerId + " connected.");
      });
      //
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
   return (this._localStream  != null)  && this._connected;
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
      console.log('User has granted access to local media.');
      self._localStream = stream;
      self._triggerSessionReadyEvent(); 
    };
  
    function onUserMediaError (error) {
      console.log('Failed to get access to local media. Error code was ' + error.code);
      alert('Failed to get access to local media. Error code was ' + error.code + '.');
    };

    try {
      getUserMedia(mediaConstraints, onUserMediaSuccess, onUserMediaError);
      console.log('Requested access to local media with mediaConstraints:\n' +
                  '  \'' + JSON.stringify(mediaConstraints) + '\'');
    } catch (e) {
      alert('getUserMedia() failed. Is this a WebRTC capable browser?');
      console.log('getUserMedia failed with exception: ' + e.message);
    }
  } 

});

})();

