
var app = app || {};

(function() {

app.PeerView = Backbone.View.extend({

    tagName: 'li',

    // Cache the template function for a single item.
    template: _.template( $('#peer-template').html() ),

    // Attributes for $el
    attributes : function () {
        return {
            id : this.model.getPeerId(),
            class : "remotePeer"
        }
    },

    initialize: function() {
        // Listeners
        this.listenTo(this.model, 'change:remoteStream',        this.changeRemoteStream);
        this.listenTo(this.model, 'change:localStream',         this.changeLocalStream);
        this.listenTo(this.model, 'change:signalingState',      this.changeSignalingState);
        this.listenTo(this.model, 'change:iceConnectionState',  this.changeIceConnectionState);
        this.listenTo(this.model, 'change:iceGatheringState',   this.changeIceGatheringState);
        // Autorendering view
       // this.render();
        // dom
        this.$mediaContainer = this.$('.remotePeerMediaContainer');
    },

    // Re-renders the titles of the todo item.
    render: function() {
        //
        this.$el.html( this.template( this.model.toJSON()));
        // Update dom elements
        this.$mediaContainer    = this.$('.remotePeerMediaContainer');
        this.$signalingState    = this.$('.signalingState');
        this.$iceConnection     = this.$('.iceConnection');
        this.$iceGathering      = this.$('.iceGathering');
        //
        return this;
    },

    //
    changeSignalingState: function( peerConnection) {
        this.$signalingState.html(peerConnection.getSignalingState());
        LOG.info("Change in status of the connection to peer " + peerConnection.getPeerId());
    },

    changeIceConnectionState: function( peerConnection) {
        this.$iceConnection.html(peerConnection.getIceConnectionState());
        LOG.info("Change in status of the connection to peer " + peerConnection.getPeerId());
    },

    changeIceGatheringState: function( peerConnection) {
        this.$iceGathering.html(peerConnection.getIceGatheringState());
        LOG.info("Change in status of the connection to peer " + peerConnection.getPeerId());
    },
    changeLocalStream: function( peerConnection) {
        LOG.info("< " + peerConnection.getPeerId() + " >" + " Change in local stream!!!! :D ");
    },
    //
    changeRemoteStream: function( peerConnection) {
        LOG.info("< " + peerConnection.getPeerId() + " >" + " Change in remote stream!!!! :D ");
        //
        var stream = peerConnection.getRemoteStream();
        // need refactoring
        this.$mediaContainer = this.$('.remotePeerMediaContainer');
        this.$remoteVideo && this.$remoteVideo.remove();
        //
        if (stream) {
            this.$mediaContainer.append("<video autoplay='autoplay'></video>");
            console.log(this.$mediaContainer);
            this.$remoteVideo = this.$mediaContainer.children("video");
            console.log(this.$remoteVideo);
            attachMediaStream(this.$remoteVideo.get(0), stream);
        }
     /*   else
            LOG.error("< " + peerConnection.getPeerId() + " > Error attaching remote stream.", stream);
      */
    }
    //
    });
}())