/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 02/03/2014
 * Time: 08:50
 * To change this template use File | Settings | File Templates.
 */

var msg = require("./messages");

exports.initialize = function(io, chatRoomService, logger) {
    return new SignalingService(io, chatRoomService, logger);
}

function SignalingService(io, chatRoomService, logger) {

    this.io = io;
    this.chatRoomService = chatRoomService;
    this.logger = logger; // can be null
    //
    this.onConnect();
    //
    this.logger && this.logger.trace("Signaling protocol initialized correctly");
}

SignalingService.prototype.onConnect = function()  {

    var self = this;

    this.io.sockets.on("connection",  function (socket) {
        socket.on(msg.REQUEST, function (data) {self.onRequest(socket, data)});
        socket.on(msg.MESSAGE, function (data) {onMessage(socket, data)});
        socket.on(msg.BYE, function(data){onBye(socket, data)});
        socket.on("disconnect", function() { onDisconnect(socket)});
    });

}

SignalingService.prototype.onRequest = function(socket, data) {
    try {
        //
        this.chatRoomService.addPeerToRoom(data.roomId, data.peerId);
        socket.roomId = data.roomId;
        socket.peerId = data.peerId;
        this.joinRoom(socket, data.peerId, data.roomId);
        //
    } catch (e){
        this.logger && this.logger.error("NAME : " +e.name +  "MSG : " + e.message);
    }
}

SignalingService.prototype.joinRoom = function (socket, peer, room) {
    socket.join(room);
    socket.emit(msg.JOINED, {roomId : room});
    socket.broadcast.to(room).emit(msg.JOIN, {roomId : room, peerId : peer});
    this.logger && this.logger.trace("Peer %s has joined room %s", peer, room);
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
    socket.broadcast.to(data.roomId).emit(msg.BYE, data);
    socket.leave(socket.roomId);
    removePeerClient(socket.peerId);
    LOGGER.trace("Received BYE message from %s. Brodcasted to the room %s", data.peerId, data.roomId);
}

function onDisconnect(socket){
    onBye(socket, {peerId : socket.peerId, roomId : socket.roomId });
    LOGGER.trace("Peer %s has been disconnected", this.peerId);
}

