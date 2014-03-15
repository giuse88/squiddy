
var app = app || {};

(function() {

app.PeerView = Backbone.View.extend({

    //... is a list tag.
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
        // Listeners
      //  this.listenTo(app.PeerSession, 'add',   this.addPeer);
    //   this.listenTo(this.model, 'change', this.changePeer);
        //    this.listenTo(app.PeerSession, 'remove', this.removePeer);
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
        LOG.info("Change in the connection");
    }
    });
}())