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

        // Cache the template function for a single item.
        template: _.template( $('#localPeer-template').html() ),

        initialize: function() {
            // we create the session
            this.peerSession = new app.PeerSession();
            // binding to HTML elements
            this.$peerList= this.$("#peerList");
            this.$localPeer= this.$("#localPeer");
            // Listeners
            this.listenTo(this.peerSession, 'ready', this.render);
            this.listenTo(this.peerSession, 'add',   this.addPeer);
            this.listenTo(this.peerSession, 'remove', this.removePeer);
        },

        // Re-renders the titles of the todo item.
        render: function() {
            // LOGIC for the all app view goes here
            this.$localPeer.append(this.template({
               peerId : this.peerSession.getMyPeerId(),
               streams : "None"
            }));
            LOG.info("Rendering view for peer " + this.peerSession.getMyPeerId() +  ".");
        },

        addPeer: function(peerConnection) {
            console.log(peerConnection);
            LOG.info ("< AppView > New peer " + peerConnection.getPeerId());

            // TODO move this to the peerConnection object
            var peerTemplate = {
                peerId : peerConnection.getPeerId(),
                status : "None",
                streams : "None"
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