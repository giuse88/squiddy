/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 02/03/2014
 * Time: 08:50
 * To change this template use File | Settings | File Templates.
 */


module.exports = function() {

    return {
        start: function(io, chatRoomService, logger) {
            "use strict";

            if ( !io || !chatRoomService || logger)
                throw "Illegal Argument";


            logger.trace("Test");

        }
    };
}

/*
io.sockets.on('connection', function (socket) {

    socket.on(REQUEST, function (data) {
        socket.peerId = data.peerId;
        socket.roomId = data.roomId;
        addPeerClient(socket);
        var isInitiator = !doesRoomExist(socket.roomId);

        if (isInitiator)
            createNewRoom(socket);
        else
            joinRoom(socket);
    });

    socket.on("disconnect", onDisconnect);
    socket.on(MESSAGE, function (data) {onMessage(socket, data)});
    socket.on(BYE, function(data){onBye(socket, data)});
});


function joinRoom(socket) {
    var peer = socket.peerId;
    var room = socket.roomId;
    socket.join(room);
    socket.emit(JOINED, {roomId : room});
    socket.broadcast.to(room).emit(JOIN, {roomId : room, peerId : peer});
    LOGGER.trace("Peer %s has joined room %s", peer, room);
}

function createNewRoom(socket){
    var newRoomId = createNewRoomID();
    socket.roomId = newRoomId;
    socket.join(newRoomId);
    socket.emit(CREATED, {roomId : socket.roomId});
    LOGGER.trace("Peer %s has created room %s", socket.peerId, socket.roomId);
}

function onMessage(socket, data) {
    if(!data.to) {
        socket.broadcast.to(data.roomId).emit(MESSAGE, data);
        LOGGER.trace("Received message from %s. Brodcasted to the room %s", data.from, data.roomId);
    } else {
        peers[data.to].emit(MESSAGE,data);
        LOGGER.trace("Received message from %s. Brodcasted to peer %s. Room %s", data.from, data.to,
            data.roomId);
    }
}

function onBye(socket, data) {
    console.log(data);
    socket.broadcast.to(data.roomId).emit(BYE, data);
    socket.leave(socket.roomId);
    removePeerClient(socket.peerId);
    LOGGER.trace("Received BYE message from %s. Brodcasted to the room %s", data.peerId, data.roomId);
}

function onDisconnect(){
    onBye(this, {peerId : this.peerId, roomId : this.roomId });
    LOGGER.trace("Peer %s has been disconnected", this.peerId);
}

*/
