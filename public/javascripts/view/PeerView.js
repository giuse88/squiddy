
var app = app || {};

(function() {

app.PeerView = Backbone.View.extend({

    tagName: 'div',

    // Cache templates from HTML page.
    //template:       _.template($('#peer-template').html() ),
    templateInfo:   _.template($('#peer-template-info').html()),
    template:  _.template($('#peer-template-media').html()),

    // Attributes for $el
    attributes : function () {
        return {
            id : this.model.getPeerId(),
            class : "remote-media-container"
        }
    },

    initialize: function() {
        // Listeners
        this.listenTo(this.model, 'change:remoteStream',        this.renderPeerRemoteStream);
        this.listenTo(this.model, 'change:signalingState',      this.renderPeerInfo);
        this.listenTo(this.model, 'change:iceConnectionState',  this.renderPeerInfo);
        this.listenTo(this.model, 'change:iceGatheringState',   this.renderPeerInfo);
        this.listenTo(this.model, 'change:isRenegotiationScheduled',   this.renderPeerInfo);
        // Auto-rendering view
        this.render();
        //
        _.bindAll(this, "renderPeerRemoteStream");
        //
        LOG.peerInfo(this.model.getPeerId(), "Peer View initialized.")
    },


    render: function() {
        //
        this.$el.html(this.template({}));
        console.log(this.$el)
        // Update dom elements
        this.$peerInfo          = this.$('.remotePeerInfo');
        //
        this.renderPeerInfo(this.model);
      //  this.renderPeerRemoteStream(this.model);
        //
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
           // this.$mediaContainer.html(this.templateMedia(peerConnection.toJSON));
            this.$remoteVideo = this.$el.find("video");
            console.log(this.$remoteVideo.get(0));
            attachMediaStream(this.$remoteVideo.get(0), stream);
        }
        //
        LOG.peerInfo(this.model.getPeerId(), "Updated media container.");
    },

    transform: function (css) {
      $("#" + this.model.getPeerId()).animate(css);
    },

    getPeerId : function () {
        return this.model.getPeerId();
    }

    });
}())