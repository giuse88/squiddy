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
    this._attributes = {}
    this._sessionId = make_peer_id(SIZE_PEER_ID);
    this._roomId = get_room_id_from_url() || ''; 
    this._isInitiator=false;
    this._socket = null; 
    this._localStream = null;
    this._connected = false; 
    this._doGetUserMedia();
    console.log("Initialized Session"); 
  },
 
  isSessionReady: function() {
   return (this._socket != null) && (this._localStream != null) && this._connected; 
  }, 

  setSocket:function(socket) {
    this._socket=socket; 
  }, 

  getSocket: function() {
    return this._socket; 
  }, 

  getRoomId: function() {
   return this._roomId;
  }, 

  setConnected : function () {
    this._connected = true;
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
             
  isInitiator: function() {
    return this._isInitiator; 
  },

  getLocalStream: function() {
    return this._localStream;
  },

  setAsInitiator: function(){
    this._isInitiator=true; 
  //  window.location = window.location.pathname + "?roomid=" + this._roomId; 
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

