/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 02/03/2014
 * Time: 08:51
 * To change this template use File | Settings | File Templates.
 */
"use strict";

var _         = require('underscore');

exports.getRoomService = function(logger) {
    return new RoomService(logger);
}

function RoomService(logger) {
    this.logger = logger;
    this.rooms = {};
}

RoomService.prototype.doesRoomExist = function (roomId) {
    console.log(this.rooms);
    console.log(this.rooms[roomId]);
    if(!roomId || !this.rooms[roomId])
        return false;
    return true;
}

RoomService.prototype.createNewRoom = function (){

    function makeRoomId(length){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    var roomId = makeRoomId(SIZE_ID);

    while(this.doesRoomExist(roomId))
       roomId = makeRoomId(20);


    this.rooms[roomId] = [];
    console.log(this.rooms[roomId]);
    this.logger.trace("Created new room Id : %s", roomId);

    return roomId;
}

RoomService.prototype.addPeerToRoom = function ( roomId , peerId) {
    console.log(this.rooms);
    console.log(this.rooms[roomId]);
    if(this.rooms[roomId] !== null && this.rooms[roomId] !== undefined ){
        this.rooms[roomId].push(peerId);
        this.logger.trace("Added peer '' %s '' to room '' %s ''.", peerId, roomId);
        return true;
    }
    return false;
}

RoomService.prototype.removePeerFromRoom = function ( roomId, peerId) {
    if(this.rooms[roomId]){
        this.rooms[roomId] = _.filter(this.rooms[roomId], function (value) {
                return value !== peerId;
        });
        this.logger.trace("Removed peer '' %s '' from room '' %s ''.", peerId, roomId);
        return true;
    }
    console.log(this.rooms);
    return false;
}

RoomService.prototype.isRoomEmpty = function (roomId) {
    console.log(this.rooms);
    if(this.rooms[roomId] && this.rooms[roomId].length == 0 )
        return true;
    return false;
}
