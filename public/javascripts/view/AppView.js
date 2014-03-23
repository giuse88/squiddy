var app = app || {};

(function() {

    app.AppView = Backbone.View.extend({

        el: "#peers",

        // Cache the template function for a single item.
        // TODO the tamplate should be called statusj
        template: _.template( $('#localPeer-template').html() ),

        events : {
            "change #videoSelector"     : "videoChange",
            "change #audioSelector"     : "audioChange",
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
            // Listeners
            this.listenTo(this.peerSession, 'ready', this.render);
            this.listenTo(this.peerSession, 'add',   this.addPeer);
            this.listenTo(this.peerSession, 'remove', this.removePeer);
            // Local stream
            this.listenTo(this.peerSession, 'localStream', this.addLocalStream);
            this.listenTo(this.peerSession, 'removedLocalStream', this.removeLocalStream);
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
            this.$peerList.append( view.el );
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
            //
            this.$localVideo && this.$localVideo.remove();
            this.$localStreamContainer.append("<video id='localVideo' muted='true' autoplay='autoplay'></video>");
            this.$localVideo = this.$localStreamContainer.find("#localVideo");
            console.log(this.$localVideo);
            //this.$localVideo.attr("id", "localVideo");
            var video = this.$localVideo.get(0);
            attachMediaStream(video, stream);
            video.play();
            //
            this.$localVideoTogglerButton.removeAttr("disabled");
            this.$localVideoTogglerButton.html("Pause");
        },

        removeLocalStream: function() {
            this.$localVideo.remove();
            this.$localVideoTogglerButton.attr("disabled", "disabled");
            this.$localVideoTogglerButton.html("No Video");
            LOG.info("< AppViw > Local stream removed");
        },

        toggleLocalAudio : function (toggleEvent) {
            var stream = this.peerSession.getLocalStream();
            LOG.info("< AppView > Local stream stopped.");
        },

        toggleLocalVideo : function() {
           var stream = this.peerSession.getLocalStream();
           var enable = false;
            //=============== TO BE REMOVED END ===========
           // this should be in the session TODO
           var videoTracks = stream ? stream.getVideoTracks() : null;
            if ( videoTracks && videoTracks.length > 0 ) {
                var videoTrack = stream.getVideoTracks()[0];
                videoTrack.enabled = !videoTrack.enabled;
                enable = videoTrack.enabled;
            }
           //=============== TO BE REMOVED END ===========
           var buttonText = ( enable ? "Pause" : "Resume");
           this.$localVideoTogglerButton.html(buttonText);
           LOG.info("Local video has been " + ( enable ? "started" : "stopped") + ".")
        },

        handleUserChangeInLocalStream: function (selectEvent) {
            var value = $(selectEvent.currentTarget).val();
            this.peerSession._doGetUserMedia(value, {audio:true});
            LOG.info("< AppView > User selected " + value + " stream");
        },

        audioChange : function(selectEvent) {
            var value = ($(selectEvent.currentTarget).val() === 'true');
            this.peerSession.setAudioConstraints(value);
            LOG.info("<AppView> User selected " + value + " for the audio stream.");
        },

        videoChange: function (selectEvent) {
            var value = $(selectEvent.currentTarget).val();
            this.peerSession.setVideoConstraints(value);
            LOG.info("<AppView> User selected " + value + " stream");
        }

    });
}())