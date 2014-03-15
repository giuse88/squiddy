
var app = app || {};

(function() {

app.PeerView = Backbone.View.extend({

    //... is a list tag.
    tagName: 'li',

    // Cache the template function for a single item.
    template: _.template( $('#peer-template').html() ),


    initialize: function() {
        //
        // Listeners
      //  this.listenTo(app.PeerSession, 'add',   this.addPeer);
    //   this.listenTo(this.model, 'change', this.changePeer);
   //    this.listenTo(app.PeerSession, 'remove', this.removePeer);
    },

    // Re-renders the titles of the todo item.
    render: function() {
        this.$el.html( this.template( this.model ));
        return this;
    },
    /*
    addPeer: function(peerConnection) {
        LOG.info ("< View > New peer " + peerConnection.getPeer());
        // TODO move this to the peerConnection object
        var peerTemplate = {
            peerId : peerConnection.getPeer(),
            status : peerConnection.status(),
            streams : ""
        };

    },
    removePeer: function() {},
     */
    changePeer: function( peerConnection) {
        "use strict";
        LOG.info("Change in the connection");
    }
    });
}())