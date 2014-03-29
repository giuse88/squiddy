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
            this.$localAudioToggleButton = this.$("#localAudioToggle");
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
            LOG.info("< AppView > Local video tracks", stream.getVideoTracks());
            LOG.info("< AppView > Local audio tracks", stream.getAudioTracks());
            this.$localVideo && this.$localVideo.remove();
            this.$localStreamContainer.append("<video id='localVideo' muted='true' autoplay='autoplay'></video>");
            this.$localVideo = this.$localStreamContainer.find("#localVideo");
            console.log(this.$localVideo);
            //this.$localVideo.attr("id", "localVideo");
            var video = this.$localVideo.get(0);
            attachMediaStream(video, stream);
            video.play();
            //TODO refactro to support audio
            if (stream.getVideoTracks().length > 0) {
                this.$localVideoTogglerButton.removeAttr("disabled");
                this.$localVideoTogglerButton.html("Pause");
            }
            //
            if (stream.getAudioTracks().length > 0) {
                this.$localAudioToggleButton.removeAttr("disabled");
                this.$localAudioToggleButton.html("Mute");
            }
        },

        removeLocalStream: function() {
            this.$localVideo.remove();
            this.$localVideoTogglerButton.attr("disabled", "disabled");
            this.$localVideoTogglerButton.html("No Video");
            LOG.info("< AppViw > Local stream removed");
        },

        toggleLocalVideo : function() {
           var enabled = this.peerSession.toggleVideoPause();
           var buttonText = ( enabled ? "Pause" : "Resume");
           this.$localVideoTogglerButton.html(buttonText);
           LOG.info("Local video has been " + ( enabled ? "started" : "stopped") + ".")
        },

        toggleLocalAudio : function() {
            var enable = this.peerSession.toggleAudioMute();
            var buttonText = ( enable ? "Mute" : "Unmute");
            this.$localAudioToggleButton.html(buttonText);
            LOG.info("Local video has been " + ( enable ? "unmute" : "mute") + ".")
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