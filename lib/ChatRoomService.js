/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 02/03/2014
 * Time: 08:51
 * To change this template use File | Settings | File Templates.
 */
"use strict";

//======================
//      GLOBALS
//======================

var _         = require('underscore');
var ROOM_SIZE_ID = 20;

//======================
//      EXCEPTIONS
//======================

function RoomNotFoundException(roomId) {
    this.name = "RoomNotFoundException";
    this.message = "Room '" + roomId + "' not found";
}

function EmptyRoomException(roomId) {
    this.name = "EmptyRoomException";
    this.message = "Room '" + roomId + "' is empty";
}

function RoomNotEmptyException(roomId) {
    this.name = "RoomNotEmptyException";
    this.message = "Room '" + roomId + "' is not empty";
}

//======================
//      EXPORTS
//======================

// CONCERN : this must be a singleton

exports.getRoomService = function(logger, roomSize) {
    return new RoomService(logger, roomSize);
}

/*
    Constructor :
        logger : optional logger used to trace actions in the chat service
 */
function RoomService(logger, roomIdSize) {
    this.logger = logger;
    this.rooms = {};
    this.roomIdSize = roomIdSize ? roomIdSize : ROOM_SIZE_ID;
}

/*
    Verify that 'roomId' exists.
    Return : true if the room exists,
             false otherwise
*/
RoomService.prototype.doesRoomExist = function (roomId) {
    if(!roomId || !this.rooms[roomId])
        return false;
    return true;
}

/*
    Create a new room
 */
RoomService.prototype.createNewRoom = function (){

    function makeRoomId(length){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    var roomId = makeRoomId(this.roomIdSize);

    while(this.doesRoomExist(roomId))
       roomId = makeRoomId(this.roomIdSize);

    this.rooms[roomId] = [];

    this.logger && this.logger.trace("Created new room Id : %s", roomId);

    return roomId;
}

RoomService.prototype.removeRoom = function( roomId) {

    if(!this.doesRoomExist(roomId))
        throw new RoomNotFoundException(roomId);

    if(!this.isRoomEmpty(roomId))
        throw new RoomNotEmptyException(roomId);

    delete this.rooms[roomId];

    this.logger && this.logger.trace("Deleted room Id : %s", roomId);
}

RoomService.prototype.addPeerToRoom = function ( roomId , peerId) {

    if(!this.doesRoomExist(roomId))
        throw new RoomNotFoundException(roomId);

    if(this.rooms[roomId] !== null && this.rooms[roomId] !== undefined ){
        this.rooms[roomId].push(peerId);
        this.logger && this.logger.trace("Added peer '' %s '' to room '' %s ''.", peerId, roomId);
    }
}

RoomService.prototype.removePeerFromRoom = function ( roomId, peerId) {
    if(this.rooms[roomId]){
        this.rooms[roomId] = _.filter(this.rooms[roomId], function (value) {
                return value !== peerId;
        });
        this.logger && this.logger.trace("Removed peer '' %s '' from room '' %s ''.", peerId, roomId);
    }
}

RoomService.prototype.isRoomEmpty = function (roomId) {
    if(this.rooms[roomId] && this.rooms[roomId].length == 0 )
        return true;
    return false;
}
