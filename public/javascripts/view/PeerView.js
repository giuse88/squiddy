
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
        this.listenTo(this.model, 'connected', this.onConnected);
        this.listenTo(this.model, 'change:isRenegotiationScheduled',   this.renderPeerInfo);
        // Auto-rendering view
        this.render();
        //
        _.bindAll(this, "renderPeerRemoteStream");
        _.bindAll(this, "onConnected");
        _.bindAll(this, "renderPeerInfo");
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
        console.log(this.$el);
        this.renderConnectingImg();
        //
        LOG.peerInfo(this.model.getPeerId(), "View rendered.");
        return this;
    },

    onConnected : function(pc){
        this.cleanConnectingImage();
    },

   renderPeerInfo : function(peerConnection) {
      this.$peerInfo.html(this.templateInfo(peerConnection.toJSON()));
      LOG.peerInfo(this.model.getPeerId(), "Updated status view.");
   },

   renderConnectingImg: function(){
       // pulsing animation
       var self = this;
       function addCircle() {
           var $circle =  $('<div class="circle"></div>');
           $circle.animate({
               'width': '200px',
               'height': '200px',
               'margin-top': '-100px',
               'margin-left': '-100px',
               'opacity': '0'
           }, 4000, 'easeOutCirc');
           self.$connectionImg.append($circle);
           setTimeout(function __remove() {
               $circle.remove();
           }, 4000);
       }
       //
       this.$connectionImg = $('<div class="connection-img"></div>');
       this.$connectionImg.append("<p class='connecting info-msg'>Connecting ...</p>")
       this.$el.append(this.$connectionImg);
       addCircle();
       //
       this.idInterval = setInterval(addCircle, 1200);
   },

    cleanConnectingImage : function() {
        clearInterval(this.idInterval);
        this.$connectionImg && this.$connectionImg.remove();
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
            this.$remoteVideo.fadeIn("fadeIn");
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