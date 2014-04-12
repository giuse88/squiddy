describe("Create Peer connection test suite", function() {
    var PEER_ID = "mockId";
    var session = jasmine.createSpyObj('session', [ 'send', 'isSessionReady', 'on', 'getLocalStream' ]);
    session.isSessionReady.and.callFake(function () {return false;});
    session.on.and.callFake(function() {});
    session.send.and.callFake(function() {});
    session.getLocalStream.and.callFake(function () {return null;});
    var connection;
    var initiator =true;

    var o ={"sdp":"v=0\r\no=- 7282588543017546346 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:IJU9DHoiy8+X8FtX\r\na=ice-pwd:3qgT9ydEM/CMkgan8ZWvgvbg\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=recvonly\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:gC/fmSmErYS1MaaCQnXZRtKR6l8yWMc5zbOpdVT8\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=video 1 RTP/SAVPF 100 116 117\r\nc=IN IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:IJU9DHoiy8+X8FtX\r\na=ice-pwd:3qgT9ydEM/CMkgan8ZWvgvbg\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=recvonly\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:gC/fmSmErYS1MaaCQnXZRtKR6l8yWMc5zbOpdVT8\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\n","type":"offer"};
    var OFFER = "" +
    "v=0" +
    "o=- 568095284612012343 2 IN IP4 127.0.0.1" +
    "s=-" +
    "t=0 0" +
    "a=group:BUNDLE audio video" +
    "a=msid-semantic: WMS" +
    "m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126" +
    "c=IN IP4 0.0.0.0" +
    "a=rtcp:1 IN IP4 0.0.0.0" +
    "a=ice-ufrag:A0qpeMnuZGYox2se" +
    "a=ice-pwd:n9ILdmSYbCb2QR8gxqlA7bQ7" +
    "a=ice-options:google-ice" +
    "a=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05" +
    "a=setup:actpass" +
    "a=mid:audio" +
    "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level" +
    "a=recvonly" +
    "a=rtcp-mux" +
    "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:UZ4zd67BRV4a4KyfXaFbZXOS/YH9jwze4pvYAn4j" +
    "a=rtpmap:111 opus/48000/2" +
    "a=fmtp:111 minptime=10" +
    "a=rtpmap:103 ISAC/16000" +
    "a=rtpmap:104 ISAC/32000" +
    "a=rtpmap:0 PCMU/8000" +
    "a=rtpmap:8 PCMA/8000" +
    "a=rtpmap:106 CN/32000" +
    "a=rtpmap:105 CN/16000" +
    "a=rtpmap:13 CN/8000" +
    "a=rtpmap:126 telephone-event/8000" +
    "a=maxptime:60" +
    "m=video 1 RTP/SAVPF 100 116 117" +
    "c=IN IP4 0.0.0.0" +
    "a=rtcp:1 IN IP4 0.0.0.0" +
    "a=ice-ufrag:A0qpeMnuZGYox2se" +
    "a=ice-pwd:n9ILdmSYbCb2QR8gxqlA7bQ7" +
    "a=ice-options:google-ice" +
    "a=fingerprint:sha-256 54:90:7A:6F:BC:46:C4:5F:25:B9:02:97:3D:A7:53:5D:B4:F6:CE:55:EB:78:51:84:0C:41:0B:2B:21:AA:CD:05" +
    "a=setup:actpass" +
    "a=mid:video" +
    "a=extmap:2 urn:ietf:params:rtp-hdrext:toffset" +
    "a=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time" +
    "a=recvonly" +
    "a=rtcp-mux" +
    "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:UZ4zd67BRV4a4KyfXaFbZXOS/YH9jwze4pvYAn4j" +
    "a=rtpmap:100 VP8/90000" +
    "a=rtcp-fb:100 ccm fir" +
    "a=rtcp-fb:100 nack" +
    "a=rtcp-fb:100 nack pli" +
    "a=rtcp-fb:100 goog-remb" +
    "a=rtpmap:116 red/90000" +
    "a=rtpmap:117 ulpfec/90000";

    var mock={}

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

       var peer1,pc1,pc2,peer2;
       var PEER_ID_1 = PEER_ID + "1", PEER_ID_2 = PEER_ID + "2";

       function saveInfo(peer, value) {
           if(value.type === "answer")
               peer.answer = value;
           else if(value.type === "offer")
               peer.offer = value;
           else
               peer.ice.push(value);
       }


       beforeEach(function(done) {
          peer1= {ice:[]};
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
          pc1 = new app.PeerConnection(PEER_ID_1, session, true);
          pc1.on("change",onChange);
          pc2 = new app.PeerConnection(PEER_ID_2, session, false);

       });

      afterEach(function(){
            peer1=null;
            peer2=null;
      });


      xit("2 peers ", function(done) {
        var d =true;
        function verify() {
           expect(peer1.offer).toBeTruthy();
           expect(peer1.ice.length >0).toBeTruthy();
           expect(pc1.getIceConnectionState()).toEqual("none");
           expect(pc1.getSignalingState()).toEqual("stable");
           expect(pc1.getIceGatheringState()).toEqual("complete");
           expect(peer2.answer).toBeTruthy();
           expect(peer2.ice.length >0).toBeTruthy();
           expect(pc2.getIceConnectionState()).toEqual("none");
           expect(pc2.getSignalingState()).toEqual("stable");
           expect(pc2.getIceGatheringState()).toEqual("complete");
           done();
        }
        function h(obj){
              if ( d && peer2.answer ) {
                  console.log(peer1);
                  console.log(peer2);
                  pc1.dispatchMessage({msg : peer2.answer, type : "ANSWER"});
                  d=false;
              }
              if ( obj.getIceGatheringState() === 'complete')
                verify();
        };
        pc2.dispatchMessage({msg : peer1.offer, type : "OFFER"});
        pc2.on("change", h);
      });

      it("Set local description updates signaling status to have-local-offer", function(){
        pc2.get('remoteConnection').setLocalDescription(new RTCSessionDescription(o), function() {console.log("success");}, function fail(err) {console.log(err);});

      });
   });

});
