var app = app || {};

(function($) {

    var sizeToPeerNumber = {
        1 : {width: "100%", height :"100%"},
        2 : {width: "50%" , height :"100%"},
        3 : {width: "50%" , height :"50%"},
        4 : {width: "50%" , height :"50%"}
    };

    var VIDEO_ON  = "Local video on";
    var VIDEO_OFF = "Local video off";
    var AUDIO_ON  = "Local audio on";
    var AUDIO_OFF = "Local audio off";

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
            this.$peerList= this.$("#peers");
            this.$localPeer= this.$("#localPeer");
            this.$localVideoTogglerButton = this.$("#localVideoToggle");
            this.$localAudioToggleButton = this.$("#localAudioToggle");
            this.$localStreamContainer= this.$("#localStreamContainer");
            // components

            this.views = [];
            // we create the session
            this.peerSession = new app.PeerSession();
            // Listeners

            this.listenTo(this.peerSession, 'ready', this.render);
            this.listenTo(this.peerSession, 'add',   this.addPeer);
            this.listenTo(this.peerSession, 'remove', this.removePeer);
            // Local stream
            this.listenTo(this.peerSession, 'localStream', this.addLocalStream);
            this.listenTo(this.peerSession, 'removedLocalStream', this.removeLocalStream);
            this.listenTo(this.peerSession, 'error', this.renderError);
            //
            _.bindAll(this, "handleUserChangeInLocalStream");
            _.bindAll(this, "centerVideo");
            _.bindAll(this, "hidePopup");
            _.bindAll(this, "renderError");
        },

        installMenuBar: function () {
            //
            var idle = 1;
            var withinBar = false;
            var $menuBar = this.$menuBar;
            var $localVideoContainer = this.$localVideoContainer;
            //
            function showBar() {
                $menuBar.slideDown();
                $localVideoContainer.animate({ "bottom": "+=50px" });
            }
            //
            function hideBar() {
                $menuBar.slideUp();
                $localVideoContainer.animate({ "bottom": "-=50px" });
            }

            $(document).mousemove(function(event){
               idle=0;
               if(isHidden('#menu-bar'))
                   showBar();
            });
            setInterval(function(){
               if (!isHidden('#menu-bar') && idle !=0 && !withinBar )
                   hideBar();
                else
                   idle=1;
            }, 2000);
            //
            showBar();
            //
            $menuBar.mouseleave(function(){
                withinBar = false;
            }).mouseenter(function() {
                withinBar = true;
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
                    $localVideo.animate({ "width": "300px", height:"225px", "margin-left":"-50px", "margin-top": "-12.5px"});
                    $video.data('small', false);
                } else {
                   $video.animate({ "width": smallSize, "height": smallSize });
                    $localVideo.animate({ "width": "100px", height:"75px", "margin-left":"-15px", "margin-top": "-2.5px"});
                    $video.data('small', true);
                }
            };
            //
            $video.click(toggleSizeVideo);
            //
        },

        render: function(removedPeer) {
            // remove animation if there is one peer
            if ( this.views.length > 1 || removedPeer) {
             _.each(this.views, function (view){
                view.transform(sizeToPeerNumber[new String(this.views.length)]);
               }, this);
            } else if ( this.views.length == 1) {
                $("#" + this.views[0].getPeerId()).css(sizeToPeerNumber[new String(this.views.length)]);
            }
            LOG.info("Rendering view for peer " + this.peerSession.getMyPeerId() +  ".");
        },

        addPeer: function(peerConnection) {
            this.removeBackgroundObjects();
            //
            var view = new app.PeerView({ model: peerConnection });
            this.$peerList.append( view.el );
            this.views.push(view);
            LOG.info ("< AppView > New peer " + peerConnection.getPeerId());
            //
            this.render(false);
         },

        removeBackgroundObjects:function() {
           $(".background").hide();
        },

        showBackgroundObjects:function() {
            $(".background").show();
        },

        removePeer: function(peerConnection) {
            var peerId =  peerConnection.getPeerId();
            // Remove Dom object and view from collection
            this.$("#"+peerId).remove();
            this.views = _.filter(this.views, function(view){
                return view.getPeerId() !== peerId;
            }, this);

            if (this.views.length == 0)
                this.showBackgroundObjects();

            LOG.info ("< AppView > Removed peer : " + peerConnection);
            //
            this.render(true);
        },

        addLocalStream: function(stream) {

            LOG.info("< AppView > Local stream added", stream);
            LOG.info("< AppView > Local video tracks", stream.getVideoTracks());
            LOG.info("< AppView > Local audio tracks", stream.getAudioTracks());
            //
            this.installMenuBar();
            this.installLocalVideo();
            var video = this.$localVideo.get(0);
            attachMediaStream(video, stream);
            video.play();
        },

        removeLocalStream: function() {
            this.$localVideo.remove();
            this.$localVideoTogglerButton.attr("disabled", "disabled");
            this.$localVideoTogglerButton.html("No Video");
            LOG.info("< AppViw > Local stream removed");
        },

        toggleLocalVideo : function() {
           var enabled = this.peerSession.toggleVideoPause();
           //
           if ( enabled != null) {
               var msg = enabled ? VIDEO_ON : VIDEO_OFF;
               this.showPopup({video:true}, enabled, msg);
               this.toggleRedBar(this.$localVideoTogglerButton,!enabled);
               enabled ? this.$localVideoContainer.show() : this.$localVideoContainer.hide();
               LOG.info("Local video has been " + ( enabled ? "started" : "stopped") + ".")
           }else
               LOG.info("No local video.");
           //
        },

        toggleRedBar : function ($element, show) {
            if(show)
                $element.find(".red-bar").show();
            else
                $element.find(".red-bar").hide();
        },

        showPopup : function (obj, enabled, msg) {
          this.$popUp.hide(); // if there is already a popUp
          //
          this.$popUp.find(".big-icon-text").html(msg)
          if (obj.audio) {
              this.$popUp.find("#audio-popup").show();
              this.$popUp.find("#video-popup").hide();
          } else if (obj.video) {
              this.$popUp.find("#video-popup").show();
              this.$popUp.find("#audio-popup").hide();
          } else {
              LOG.error("Unknown object showing popup");
          }
          //
          this.toggleRedBar(this.$popUp, !enabled);
          this.$popUp.show();
          setTimeout(this.hidePopup, 1000);
          //
        },

        hidePopup:  function () {
            this.$popUp.fadeOut();
        },

        toggleLocalAudio : function() {
            var enabled = this.peerSession.toggleAudioMute();
            //
            if (enabled != null) {
                var msg = enabled ? AUDIO_ON : AUDIO_OFF;
                this.showPopup({audio:true}, enabled, msg);
                this.toggleRedBar(this.$localAudioToggleButton,!enabled);
                LOG.info("Local audio has been " + ( enabled ? "unmute" : "mute") + ".")
            } else  {
                LOG.info("No local audio.");
            }
            //
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
        },
        renderError : function(error) {
            this.$el.append(renderError(error));
        }

    });
}($))