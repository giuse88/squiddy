/* PeerConnection.js */

Backbone.Model.extend({

  defaults: {
    isInitiator : false,  
    isConnected : false,  
    isStarted   : false,  
    msgQueue = [],  
    roomId = '', 
    peerId = '',  
    socket = null,  
    localStream   = undefined,  
    remoteStream  = undefined, 
  }, 

  initialize: function() {
    console.log("Creating Peer Connection");  
  }

});
