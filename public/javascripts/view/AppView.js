/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 12/03/2014
 * Time: 07:46
 * To change this template use File | Settings | File Templates.
 */


var app = app || {};

(function() {

    app.AppView = Backbone.View.extend({

        el: "#peers",

        initialize: function() {
            //
            this.$peerList= this.$("#peerList");
            // Listeners
            this.listenTo(app.PeerSession, 'add',   this.addPeer);
            this.listenTo(app.PeerSession, 'remove', this.removePeer);
        },

        // Re-renders the titles of the todo item.
        render: function() {
            "use strict";
            // LOGIC for the all app view goes here
            LOG.info("rendering view");
        },

        addPeer: function(peerConnection) {
            LOG.info ("< AppView > New peer " + peerConnection.getPeer());
            // TODO move this to the peerConnection object
            var peerTemplate = {
                peerId : peerConnection.getPeer(),
                status : peerConnection.status(),
                streams : ""
            };
             var view = new app.PeerView({ model: peerTemplate });
             this.$peerList.append( view.render().el );
         },
         removePeer: function() {}
    });
}())