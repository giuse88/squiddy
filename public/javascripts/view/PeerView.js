
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
        // dom
        this.$mediaContainer = this.$('.remotePeerMediaContainer');
        console.log(this.$mediaContainer);
        console.log($('.remotePeerMediaContainer'));
        this.$remoteVideo = this.$mediaContainer.children("video");
        this.remoteVideo =this.$('.remotePeerMediaContainer').children('video')[0];  // dom
        console.log(this.remoteVideo);

        // Listeners
        this.listenTo(this.model, 'change:remoteStream', this.changeRemoteStream);
        this.listenTo(this.model, 'change:localStream', this.changeLocalStream);
        this.listenTo(this.model, 'change', this.changePeer);
    },

    // Re-renders the titles of the todo item.
    render: function() {
        this.$el.html( this.template(
            { peerId : this.model.getPeerId(),
              status : "none",
              streams : "none"
            }
        ));
        return this;
    },
    //
    changePeer: function( peerConnection) {
        "use strict";
        LOG.info("Change in status of the connection to peer " + peerConnection.getPeerId());
    },

    changeLocalStream: function( peerConnection) {
        LOG.info("< " + peerConnection.getPeerId() + " >" + " Change in local stream!!!! :D ");
    },
    //
    changeRemoteStream: function( peerConnection) {
        LOG.info("< " + peerConnection.getPeerId() + " >" + " Change in remote stream!!!! :D ");
        var stream = peerConnection.get('remoteStream');
        console.log("REMOTE STREAM", stream);
        console.log("REMOTE STREAM", peerConnection.getRemoteStream());
        console.log(this.remoteVideo);
        console.log(this.$remoteVideo);
        this.remoteVideo = this.$('.remotePeerMediaContainer').children('video')[0];
        if (stream)
            attachMediaStream(this.remoteVideo, stream);
        else
            LOG.error("< " + peerConnection.getPeerId() + " > Error attaching remote stream.", stream);
    }
    //
    });
}())