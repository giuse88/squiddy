describe("Create Peer connection when the session is not ready", function() {
    var PEER_ID = "mockId";
    var session;
    var connection;
    var initiator;

    beforeEach(function() {
       session = jasmine.createSpyObj('session', [ 'isSessionReady', 'on' ]);
       session.isSessionReady.and.callFake(function () {return false;});
       session.on.and.callFake(function() {});
       initiator =true;
       // Object under test
       connection = new app.PeerConnection(PEER_ID, session, initiator);
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