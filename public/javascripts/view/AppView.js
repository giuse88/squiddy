var app = app || {};

(function($) {

    app.AppView = Backbone.View.extend({

        el: "#container",

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
            this.$menuBar = $('#menu-bar');
            this.$localVideoContainer = $( "#local-video-container" );
            this.$localVideo = $("#localVideo");
            this.$popUp = $('#popup');
            // binding to HTML elements
            this.$peerList= this.$("#peerList");
            this.$localPeer= this.$("#localPeer");
            this.$localVideoTogglerButton = this.$("#localVideoToggle");
            this.$localAudioToggleButton = this.$("#localAudioToggle");
            this.$localStreamContainer= this.$("#localStreamContainer");
            // components
            this.installMenuBar();
            this.installLocalVideo();

            // we create the session
            this.peerSession = new app.PeerSession();
            // Listeners

            this.listenTo(this.peerSession, 'ready', this.render);
            this.listenTo(this.peerSession, 'add',   this.addPeer);
            this.listenTo(this.peerSession, 'remove', this.removePeer);
            // Local stream
            this.listenTo(this.peerSession, 'localStream', this.addLocalStream);
            this.listenTo(this.peerSession, 'removedLocalStream', this.removeLocalStream);
            //
            _.bindAll(this, "handleUserChangeInLocalStream");
            _.bindAll(this, "centerVideo");
        },

        installMenuBar: function () {
            //
            var timeoutId = 'timeoutId';
            var $menuBar = this.$menuBar;
            var $localVideoContainer = this.$localVideoContainer;
            //
            function showBar() {
                $menuBar.slideDown();
                moveLocalVideo();
            }
            //
            function hideBar() {
                $menuBar.slideUp();
                moveLocalVideo();
            }
            //
            function moveLocalVideo() {
                var $video = $localVideoContainer;
                if($video.data('down')) {
                    $video.animate({ "bottom": "-=50px" });
                    $video.data('down', false);
                } else {
                    $video.animate({ "bottom": "+=50px" });
                    $video.data('down', true);
                }
            }
            //
            function installSensitiveArea() {
                $(document).mousemove(function(event){
                    var docheight = $( document ).height() - 10;
                    if( event.pageY > docheight && isHidden('#menu-bar')){
                        showBar();
                    }
                });
            }
            //
            showBar();
            $menuBar.data(timeoutId, setTimeout(hideBar , 2000));
            installSensitiveArea();
            //
            $menuBar.mouseleave(function(){
                $menuBar.data(timeoutId) && clearTimeout($(this).data(timeoutId));
                $menuBar.data(timeoutId, setTimeout(hideBar , 2000));
            }).mouseenter(function() {
                $menuBar.data(timeoutId) && clearTimeout($(this).data(timeoutId));
            });
            LOG.info("Menu bar installed.")
        },

        installLocalVideo: function() {
            var $video = this.$localVideoContainer;
            var $localVideo = this.$localVideo;
            var smallSize = "70px",
                mediumSize = "200px";

            function toggleSizeVideo() {
                if($video.data('small')) {
                    $video.animate({ "width": mediumSize, "height": mediumSize });
                    $localVideo.animate({ "width": "300px", height:"225px", "margin-left":"-50px", "margin-bottom": "-12.5px"});
                    $video.data('small', false);
                } else {
                   $video.animate({ "width": smallSize, "height": smallSize });
                    $localVideo.animate({ "width": "100px", height:"75px", "margin-left":"-15px", "margin-bottom": "-2.5px"});
                    $video.data('small', true);
                }
            };
            //
            $video.click(toggleSizeVideo);
            //
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
            LOG.info("< AppView > Local video tracks", stream.getVideoTracks());
            LOG.info("< AppView > Local audio tracks", stream.getAudioTracks());
            //
            console.log(this.$localVideo);
            //this.$localVideo.attr("id", "localVideo");
            var video = this.$localVideo.get(0);
            attachMediaStream(video, stream);
            video.play();
            // find better solution.
            // Neccessary to get the height of the video
           // setTimeout(this.centerVideo, 100);
        },

        removeLocalStream: function() {
            this.$localVideo.remove();
            this.$localVideoTogglerButton.attr("disabled", "disabled");
            this.$localVideoTogglerButton.html("No Video");
            LOG.info("< AppViw > Local stream removed");
        },

        toggleLocalVideo : function() {
            // TODO check if the stream is null
           var enabled = this.peerSession.toggleVideoPause();
           var buttonText = ( enabled ? "Pause" : "Resume");
          // this.$localVideoTogglerButton.html(buttonText);
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
        },

        centerVideo : function() {
            var height = this.$localVideo.css('height');
            var margin = - ( parseInt(height) -200) /2;
            this.$localVideo.css('margin-top', margin);
        }

    });
}($))