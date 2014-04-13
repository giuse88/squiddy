describe("Create Peer connection test suite", function() {
    var PEER_ID = "mockId";
    var session = jasmine.createSpyObj('session', [ 'send', 'isSessionReady', 'on', 'getLocalStream' ]);
    session.isSessionReady.and.callFake(function () {return false;});
    session.on.and.callFake(function() {});
    session.send.and.callFake(function() {});
    session.getLocalStream.and.callFake(function () {return null;});
    var connection;
    var initiator =true;

    var SDP  = "v=0\r\n" +
        "o=- 7282588543017546346 2 IN IP4 127.0.0.1\r\n" +
        "s=-\r\n" +
        "t=0 0\r\n" +
        "a=group:BUNDLE audio video\r\n" +
        "a=msid-semantic: WMS\r\n" +
        "m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
        "c=IN IP4 0.0.0.0\r\n" +
        "a=rtcp:1 IN IP4 0.0.0.0\r\n" +
        "a=ice-ufrag:IJU9DHoiy8+X8FtX\r\n" +
        "a=ice-pwd:3qgT9ydEM/CMkgan8ZWvgvbg\r\n" +
        "a=ice-options:google-ice\r\n" +
        "a=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\n" +
        "a=setup:actpass\r\n" +
        "a=mid:audio\r\n" +
        "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n" +
        "a=recvonly\r\n" +
        "a=rtcp-mux\r\n" +
        "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:gC/fmSmErYS1MaaCQnXZRtKR6l8yWMc5zbOpdVT8\r\n" +
        "a=rtpmap:111 opus/48000/2\r\n" +
        "a=fmtp:111 minptime=10\r\n" +
        "a=rtpmap:103 ISAC/16000\r\n" +
        "a=rtpmap:104 ISAC/32000\r\n" +
        "a=rtpmap:0 PCMU/8000\r\n" +
        "a=rtpmap:8 PCMA/8000\r\n" +
        "a=rtpmap:106 CN/32000\r\n" +
        "a=rtpmap:105 CN/16000\r\n" +
        "a=rtpmap:13 CN/8000\r\n" +
        "a=rtpmap:126 telephone-event/8000\r\n" +
        "a=maxptime:60\r\n" +
        "m=video 1 RTP/SAVPF 100 116 117\r\n" +
        "c=IN IP4 0.0.0.0\r\n" +
        "a=rtcp:1 IN IP4 0.0.0.0\r\n" +
        "a=ice-ufrag:IJU9DHoiy8+X8FtX\r\n" +
        "a=ice-pwd:3qgT9ydEM/CMkgan8ZWvgvbg\r\n" +
        "a=ice-options:google-ice\r\n" +
        "a=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\n" +
        "a=setup:actpass\r\n" +
        "a=mid:video\r\n" +
        "a=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\n" +
        "a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\n" +
        "a=recvonly\r\n" +
        "a=rtcp-mux\r\n" +
        "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:gC/fmSmErYS1MaaCQnXZRtKR6l8yWMc5zbOpdVT8\r\n" +
        "a=rtpmap:100 VP8/90000\r\n" +
        "a=rtcp-fb:100 ccm fir\r\n" +
        "a=rtcp-fb:100 nack\r\n" +
        "a=rtcp-fb:100 nack pli\r\n" +
        "a=rtcp-fb:100 goog-remb\r\n" +
        "a=rtpmap:116 red/90000\r\n" +
        "a=rtpmap:117 ulpfec/90000\r\n";


    var mockOffer = {sdp : SDP ,"type":"offer"};

   var mockAnswer = {"sdp": "v=0\r\no=- 6465573306213105510 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:AyBahFUhrQOPtHlQ\r\na=ice-pwd:QGUAtvpJDqYq2F8BUH2ZWdGv\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:active\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=sendonly\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=video 1 RTP/SAVPF 100 116 117\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:AyBahFUhrQOPtHlQ\r\na=ice-pwd:QGUAtvpJDqYq2F8BUH2ZWdGv\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:active\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=sendonly\r\na=rtcp-mux\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\n", "type": "answer"};

    var a ={"sdp":"v=0\r\no=- 4287580602782988024 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:K3Wy0WP3kBI7znyf\r\na=ice-pwd:On5xEkoDHh5zFidGzjlL+9fQ\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:active\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=sendonly\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=video 1 RTP/SAVPF 100 116 117\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:K3Wy0WP3kBI7znyf\r\na=ice-pwd:On5xEkoDHh5zFidGzjlL+9fQ\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:active\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=sendonly\r\na=rtcp-mux\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\n","type":"answer"};
    var b = {"sdp":"v=0\r\no=- 3170353243610990819 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:/9jKaskSn+lvH+rB\r\na=ice-pwd:0+34ONNNNlX4hloYhxM4juE0\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=recvonly\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:dSswnwwIckXb9fLpZ3STJjK358Xvk9WJ69UxFvcd\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=video 1 RTP/SAVPF 100 116 117\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:/9jKaskSn+lvH+rB\r\na=ice-pwd:0+34ONNNNlX4hloYhxM4juE0\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=recvonly\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:dSswnwwIckXb9fLpZ3STJjK358Xvk9WJ69UxFvcd\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\n","type":"offer"};
    xdescribe("Create Peer connection when the session is not ready", function() {
        beforeEach(function() {
           session.isSessionReady.and.callFake(function () {return false;});
           // Object under test
           connection = new app.PeerConnection(PEER_ID, session, initiator);
        });

        afterEach(function() {
           connection =null;
        });

        it("should call isSessionReady to check if the session is ready", function() {
            expect(session.isSessionReady).toHaveBeenCalled();
        });

        it("should NOT be started as the session is not ready", function() {
            expect(connection.isStarted()).toBeFalsy();
        });

        it("should set the peer id and the isInitiator flag", function() {
            expect(connection.getPeerId()).toEqual(PEER_ID);
            expect(connection.isInitiator()).toEqual(initiator);
        });


    });


    xdescribe("Create Peer connection when the session is Ready", function() {

        beforeEach(function() {
            session.isSessionReady.and.callFake(function () {return true;});
            session.getLocalStream.and.callFake(function () {return null;});
            initiator=false;
            rtc = RTCPeerConnection;
            RTCPeerConnection = function(){
                // TODO Check contrains
                console.log("Javascript is awesome");
            };
            // Object under test
            connection = new app.PeerConnection(PEER_ID, session, initiator);
        });

        afterEach(function() {
            connection =null;
            RTCPeerConnection=rtc;
        });

        it("should call isSessionReady to check if the session is ready", function() {
            expect(session.isSessionReady).toHaveBeenCalled();
            expect(connection.isStarted()).toBeTruthy();
            expect(connection.getPeerId()).toEqual(PEER_ID);
            expect(connection.isInitiator()).toEqual(initiator);
        });

    });

   describe("This test suite create two peer connections", function() {

       var PEER_ID_1 = PEER_ID + "1", PEER_ID_2 = PEER_ID + "2";

       function saveInfo(peer, value) {
           if(value.type === "answer")
               peer.answer = value;
           else if(value.type === "offer")
               peer.offer = value;
           else
               peer.ice.push(value);
       }


       beforeEach(function() {
           session.isSessionReady.and.callFake(function() {return true});

       });

      afterEach(function(){
/*            peer1=null;
            peer2=null;
            pc2=null;

            pc1=null;
            */
      });

      it("Test the signalStatus machine when a peer receives an offer", function(done){
          var peerReceiver = new app.PeerConnection("mock_receiver", session, false);

          var successRemote = function(){
              console.log("Remote descriptor installed successfully.");
              expect(peerReceiver.getSignalingState()).toEqual("have-remote-offer");
              peerReceiver._setLocalDescriptor(mockAnswer, successLocal, failure);
          };

          var successLocal = function(){
              console.log("Local descriptor installed successfully.");
              expect(peerReceiver.getSignalingState()).toEqual("stable");
              done();
          }.bind(this);

          var failure = function(error){
              console.log("Error installing SDP." + error);
              expect(error).toBeNull();
              done();
          }.bind(this);

          expect(peerReceiver.getSignalingState()).toEqual("none");
          peerReceiver._setRemoteDescription(mockOffer, successRemote,failure);
      });

      xit("Test the signalStatus machine when a peer sends an offer", function(done){
          var peerSender  = new app.PeerConnection("mock_sender", session, false);

          var successRemote = function(){
              console.log("Remote descriptor installed successfully.");
              expect(peerSender.getSignalingState()).toEqual("stable");
              done();
          };

          var successLocal = function(){
              console.log("Local descriptor installed successfully.");
              expect(peerSender.getSignalingState()).toEqual("have-local-offer");
              peerSender._setRemoteDescription(mockAnswer, successRemote,failure);
          }.bind(this);

          var failure = function(error){
              console.log("Error installing SDP." + error);
              expect(error).toBeNull();
              done();
          }.bind(this);

          expect(peerSender.getSignalingState()).toEqual("none");
          peerSender._setLocalDescriptor(mockOffer, successLocal,failure);
      });

      it("Normal offer data exchange", function(done) {

        function verify() {
           expect(peer1.localOffer).toBeTruthy();
           expect(peer1.remoteOffer).toBeTruthy();
           expect(pc1.getIceConnectionState()).toEqual("none");
           expect(pc1.getSignalingState()).toEqual("stable");
           expect(peer2.localOffer).toBeTruthy();
           expect(peer2.remoteOffer).toBeTruthy();
           expect(pc2.getIceConnectionState()).toEqual("none");
           expect(pc2.getSignalingState()).toEqual("stable");
           expect(peer1.localOffer).toEqual(peer2.remoteOffer);
           expect(peer2.localOffer).toEqual(peer1.remoteOffer);
           done();
        }

        var peer1= {ice:[], localOffer:null, remoteOffer:null};
        var peer2= {ice:[], localOffer:null, remoteOffer:null};
        var pc1 = new app.PeerConnection(PEER_ID_1, session, false);
        var pc2 = new app.PeerConnection(PEER_ID_2, session, false);

        var errorCB =  function(err){
          console.log("Error installing SDP." + err);
          console.log(new Error().stack);
          expect(err).toBeNull();
          done();
        }

        pc1.onIceCandidate = function() {};
        pc2.onIceCandidate = function() {};

        var pc1LocalOriginal = pc1._setLocalDescriptor;
        pc1._setLocalDescriptor = function(offer) {
           peer1.localOffer = offer;
           peer2.remoteOffer =offer;
           pc1LocalOriginal.call(pc1, offer, function(){
                pc2._setRemoteDescription(offer, function(){
                     pc2.doAnswer();
                     },errorCB);
                }, errorCB);
        };
        //
        var pc2LocalOriginal = pc2._setLocalDescriptor;
        pc2._setLocalDescriptor= function(offer){
           peer2.localOffer = offer;
           peer1.remoteOffer=offer;
           pc2LocalOriginal.call(pc2, offer, function(){
               pc1._setRemoteDescription(offer, function(){
                  verify();
               },errorCB);
           }, errorCB);

        };
        // Kick off
        pc1.doOffer();

      });

      it(" dddd Normal offer data exchange", function(done) {

           function verify() {
               expect(peer1.localOffer).toBeTruthy();
               expect(peer1.remoteOffer).toBeTruthy();
               expect(pc1.getIceConnectionState()).toEqual("none");
               expect(pc1.getSignalingState()).toEqual("stable");
               expect(peer2.localOffer).toBeTruthy();
               expect(peer2.remoteOffer).toBeTruthy();
               expect(pc2.getIceConnectionState()).toEqual("none");
               expect(pc2.getSignalingState()).toEqual("stable");
               expect(peer1.localOffer).toEqual(peer2.remoteOffer);
               expect(peer2.localOffer).toEqual(peer1.remoteOffer);
               done();
           }

           var peer1= {ice:[], localOffer:null, remoteOffer:null};
           var peer2= {ice:[], localOffer:null, remoteOffer:null};
           var pc1 = new app.PeerConnection(PEER_ID_1, session, false);
           var pc2 = new app.PeerConnection(PEER_ID_2, session, false);

           var errorCB =  function(err){
               console.log("Error installing SDP." + err);
               console.log(new Error().stack);
               expect(err).toBeNull();
               done();
           }

           pc1.onIceCandidate = function() {};
           pc2.onIceCandidate = function() {};

           var pc1LocalOriginal = pc1._setLocalDescriptor;
           pc1._setLocalDescriptor = function(offer) {
               peer1.localOffer = offer;
               peer2.remoteOffer =offer;
               pc1LocalOriginal.call(pc1, offer, function(){
                   pc2._setRemoteDescription(offer, function(){
                       pc2.doAnswer();
                   },errorCB);
               }, errorCB);
           };
           //
           var pc2LocalOriginal = pc2._setLocalDescriptor;
           pc2._setLocalDescriptor= function(offer){
               peer2.localOffer = offer;
               peer1.remoteOffer=offer;
               pc2LocalOriginal.call(pc2, offer, function(){
                   pc1._setRemoteDescription(offer, function(){
                       verify();
                   },errorCB);
               }, errorCB);

           };
           // Kick off
           pc1.doOffer();

       });
   });

});


/*
 /*     peer1= {ice:[]};
 peer2= {ice:[]};
 session.isSessionReady.and.callFake(function() {return true});
 session.send.and.callFake(function (peerId ,value) {
 if(peerId=== PEER_ID_1)
 saveInfo(peer1, value);
 else
 saveInfo(peer2, value);
 });

 function onChange(obj){
 if ( obj.getIceGatheringState() === 'complete')
 done()
 };
 */
