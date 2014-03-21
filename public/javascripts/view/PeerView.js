
var app = app || {};

(function() {

app.PeerView = Backbone.View.extend({

    tagName: 'li',

    // Cache the template function for a single item.
    template:       _.template($('#peer-template').html() ),
    templateInfo:   _.template($('#peer-template-info').html()),
    templateMedia:  _.template($('#peer-template-media').html()),

    // Attributes for $el
    attributes : function () {
        return {
            id : this.model.getPeerId(),
            class : "remotePeer"
        }
    },

    initialize: function() {
        // Listeners
        this.listenTo(this.model, 'change:remoteStream',        this.renderPeerRemoteStream);
        this.listenTo(this.model, 'change:signalingState',      this.renderPeerInfo);
        this.listenTo(this.model, 'change:iceConnectionState',  this.renderPeerInfo);
        this.listenTo(this.model, 'change:iceGatheringState',   this.renderPeerInfo);
        // Autorendering view
        this.render();
        //
        LOG.peerInfo(this.model.getPeerId(), "Peer View initialized.")
    },


    render: function() {
        //
        this.$el.html(this.template({}));
        // Update dom elements
        this.$mediaContainer    = this.$('.remotePeerMediaContainer');
        this.$peerInfo          = this.$('.remotePeerInfo');

        this.renderPeerInfo(this.model);
        this.renderPeerRemoteStream(this.model);

        LOG.peerInfo(this.model.getPeerId(), "View rendered.");

        return this;
    },

   renderPeerInfo : function(peerConnection) {
      this.$peerInfo.html(this.templateInfo(peerConnection.toJSON()));
      LOG.peerInfo(this.model.getPeerId(), "Updated status view.");
   },


    renderPeerRemoteStream : function( peerConnection) {
        var stream = peerConnection.getRemoteStream();
        this.$remoteVideo && this.$remoteVideo.remove();
        //
        if (stream) {
            this.$mediaContainer.html(this.templateMedia(peerConnection.toJSON));
            this.$remoteVideo = this.$mediaContainer.children("video");
            attachMediaStream(this.$remoteVideo.get(0), stream);
        }
        //
        LOG.peerInfo(this.model.getPeerId(), "Updated media container.");
    }

    });
}())