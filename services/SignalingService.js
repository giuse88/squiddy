/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 02/03/2014
 * Time: 08:50
 * To change this template use File | Settings | File Templates.
 */

var events = require("./../common/events/events");

exports.initialize = function(io, chatRoomService, messageService, logger) {
    return new SignalingService(io, chatRoomService, messageService, logger);
}

function SignalingService(io, chatRoomService, messageService, logger) {

    this.io = io;
    this.chatRoomService = chatRoomService;
    this.messageService = messageService;
    this.logger = logger; // can be null
    //
    this.onConnect();
    //
    this.logger && this.logger.trace("Signaling protocol initialized correctly");
}

SignalingService.prototype.onConnect = function()  {

    var self = this;

    this.io.sockets.on(events.CONNECTION,  function (socket) {
        self.logger && self.logger.trace("Peer %s is connected", socket.id);
        socket.emit(events.CONNECTED, {peerId : socket.id});
        socket.on(events.JOIN, function (data) {self.onJoin(socket, data)});
        socket.on(events.MESSAGE, function (data) {self.onMessage(socket, data)});
        socket.on(events.BYE,     function (data) {self.onBye(socket, data)});
        socket.on(events.DISCONNECT,   function ()  {self.onDisconnect(socket)});
    });

}
SignalingService.prototype.onJoin = function(socket, data) {
    this.logger && this.logger.trace("Received request from peer %s to join room %s.", data.peerId, data.roomId);
    try {
        //
        if ( this.chatRoomService.isRoomFull(data.roomId)) {
           var msg = "Room is full."
           this.rejectJoinRequest(socket, data.roomId, data.peerId, msg);
        }else  {
            this.chatRoomService.addPeerToRoom(data.roomId, data.peerId);
            socket.roomId = data.roomId;
            this.joinRoom(socket, data.peerId, data.roomId);
        }
        //
    } catch (e){
        socket.disconnect();
        this.logger && this.logger.error("NAME : " +e.name +  " MSG : " + e.message);
    }
}
SignalingService.prototype.rejectJoinRequest = function (socket, peer, room, mes) {
    socket.emit(events.REJECTED, {roomId : room, peerId : peer, reason: mes});
    this.logger && this.logger.trace("Peer %s request to join room %s has been rejected. Reason : ", peer, room, mes);
}

SignalingService.prototype.joinRoom = function (socket, peer, room) {
    socket.join(room);
    socket.emit(events.JOINED, {roomId : room});
    socket.broadcast.to(room).emit(events.NEW_PEER, {roomId : room, peerId : peer});
    this.logger && this.logger.trace("Peer %s has joined room %s.", peer, room);
}

/*
    Message Structure :
        to : receiver
        from : sender
        roomId : room

        if to is not specified, the message is broadcasted to the entire room
 */

SignalingService.prototype.onMessage = function (socket, data) {
    if(!data.to) {
        socket.broadcast.to(data.roomId).emit(events.MESSAGE, data);
        this.messageService.add(data);
        this.logger && this.logger.trace("[ Room %s] Received message from %s. Broadcasted to the room %s", data.from, data.roomId);
    } else {
        this.io.sockets.socket(data.to).emit(events.MESSAGE,data);
        this.messageService.add(data);
        this.logger && this.logger.trace("[ Room %s ] : Message from %s has been sent to peer %s. Room %s", data.from, data.to, data.roomId);
    }
}

SignalingService.prototype.onBye = function(socket, data) {
    socket.broadcast.to(data.roomId).emit(events.BYE, data);
    socket.leave(socket.roomId);

    var chatRoomService = this.chatRoomService;
    try {
        //
        chatRoomService.removePeerFromRoom(data.roomId, data.peerId);
        //
        if (chatRoomService.isRoomEmpty(data.roomId)) {
           // Timer to allow page refresh
           setTimeout(function() {
               if(chatRoomService.isRoomEmpty(data.roomId))
                   chatRoomService.removeRoom(data.roomId);
           }, 5000);
           //
           }
        //
    } catch (e){
        socket.disconnect();
        this.logger && this.logger.error("NAME : " +e.name +  " MSG : " + e.message);
    }
    this.logger && this.logger.trace("Received BYE message from %s. Broadcasted to the room %s", data.peerId, data.roomId);
}

SignalingService.prototype.onDisconnect = function (socket){
    this.onBye(socket, {peerId : socket.id, roomId : socket.roomId });
    this.logger && this.logger.trace("Peer %s has been disconnected", socket.id);
}

