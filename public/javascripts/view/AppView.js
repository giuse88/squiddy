var app = app || {};

(function() {

    app.AppView = Backbone.View.extend({

        el: "#peers",

        // Cache the template function for a single item.
        // TODO the tamplate should be called statusj
        template: _.template( $('#localPeer-template').html() ),

        events : {
            "change #videoSelector": "handleUserChangeInLocalStream",
            "click  #localVideoToggle"  : "toggleLocalVideo",
            "click  #localAudioToggle"  : "toggleLocalAudio"
        },

        initialize: function() {
            // we create the session
            this.peerSession = new app.PeerSession();
            // binding to HTML elements
            this.$peerList= this.$("#peerList");
            this.$localPeer= this.$("#localPeer");
            this.$localVideoTogglerButton = this.$("#localVideoToggle");
            this.$localStreamContainer= this.$("#localStreamContainer");
            // I would like to use a jquery object
            this.localVideo = $('#localVideo')[0]; //dom
            // Listeners
            this.listenTo(this.peerSession, 'ready', this.render);
            this.listenTo(this.peerSession, 'add',   this.addPeer);
            this.listenTo(this.peerSession, 'localStream', this.addLocalStream);
            this.listenTo(this.peerSession, 'removedStream', this.removeLocalStream);
            this.listenTo(this.peerSession, 'remove', this.removePeer);
            //
            _.bindAll(this, "handleUserChangeInLocalStream");
        },

        // Re-renders the titles of the todo item.
        render: function() {
            // LOGIC for the all app view goes here
            this.$localPeer.html(this.template({
               peerId : this.peerSession.getMyPeerId(),
               connectedPeers : this.peerSession.size(),
               streams : "None"
            }));
            LOG.info("Rendering view for peer " + this.peerSession.getMyPeerId() +  ".");
        },

        addPeer: function(peerConnection) {
            var view = new app.PeerView({ model: peerConnection });
            this.$peerList.append( view.render().el );
            LOG.info ("< AppView > New peer " + peerConnection.getPeerId());
            // update appView
            this.render();
         },
        removePeer: function(peerConnection) {
            this.$("#" + peerConnection.getPeerId()).remove();
            LOG.info ("< AppView > Removed peer : " + peerConnection);
            // update appView
            this.render();
        },

        addLocalStream: function(stream) {
            LOG.info("< AppView > Local stream added", stream);
            this.$localVideoTogglerButton.removeAttr("disabled");
            this.$localVideoTogglerButton.html("Pause");
            attachMediaStream(this.localVideo, stream);
        },

        removeLocalStream: function(stream) {
            LOG.info("< AppViw > Local stream removed");
        },

        toggleLocalAudio : function (toggleEvent) {
            var stream = this.peerSession.getLocalStream();
            LOG.info("< AppView > Local stream stopped.");
        },

        toggleLocalVideo : function() {
           var stream = this.peerSession.getLocalStream();
           var enable = false;
           // this should be in the session TODO
           var videoTracks = stream ? stream.getVideoTracks() : null;
            if ( videoTracks && videoTracks.length > 0 ) {
                var videoTrack = stream.getVideoTracks()[0];
                videoTrack.enabled = !videoTrack.enabled;
                enable = videoTrack.enabled;
            }
           var buttonText = ( enable ? "Pause" : "Resume");
           this.$localVideoTogglerButton.html(buttonText);
           LOG.info("Local video has been " + ( enable ? "started" : "stopped") + ".")
        },

        handleUserChangeInLocalStream: function (selectEvent) {
            var value = $(selectEvent.currentTarget).val();
            this.peerSession._doGetUserMedia(value);
            LOG.info("< AppView > User selected " + value + " stream");
        }
    });
}())