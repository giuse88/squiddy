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
            // we create the session
            this.peerCollection = new app.PeerSession();
            // binding to HTML elements
            this.$peerList= this.$("#peerList");
            // Listeners
            this.listenTo(this.peerCollection, 'add',   this.addPeer);
            this.listenTo(this.peerCollection, 'remove', this.removePeer);
        },

        // Re-renders the titles of the todo item.
        render: function() {
            "use strict";
            // LOGIC for the all app view goes here
            LOG.info("rendering view");
        },

        addPeer: function(peerConnection) {
            console.log(peerConnection);
            LOG.info ("< AppView > New peer " + peerConnection.getPeerId());

            // TODO move this to the peerConnection object
            var peerTemplate = {
                peerId : peerConnection.getPeerId(),
                status : "",
                streams : ""
            };
             var view = new app.PeerView({ model: peerTemplate });
             this.$peerList.append( view.render().el );
         },
         removePeer: function(peerConnection) {
             LOG.info ("< AppView > Removed peer : " + peerConnection);
             //
         }
    });
}())