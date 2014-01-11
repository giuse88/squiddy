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
    msgQueue : [],  
    peerId : '', 
    remoteStream  : undefined, 
  }, 

  initialize: function(id) {
    this.attributes.peerId = id;
    console.log("Creating Peer Connection");  
  },

  getPeerId: function () {
    return this.attributes.peerId; 
  }, 
  
  makeOffer: function() {}, 
  makeAnswer: function() {}, 

  _start: function() {}, 
  _createRemoteConnection: function (){}, 
  
  addMessage : function(msg) {
        this.msgQueue.push(msg); 
  }, 
  
  getMessage: function() {
    if ( msg.length < 1) 
      return null; 
    else 
     return  this.mswQueue.shift(); 
  }

});

})();
