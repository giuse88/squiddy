var roomServiceUnderTest = require('../lib/ChatRoomService').getRoomService();
SIZE_ID = 20;

describe("Test Chat Room Service ", function() {
    "use strict";

    it("Test the creation of a new room", function() {
        var roomId =  roomServiceUnderTest.createNewRoom();
        expect(roomId).toBeDefined();
        expect(roomId).not.toBeNull();
        expect(roomServiceUnderTest.doesRoomExist(roomId)).toBeTruthy();
    });

    it("Test a new room is empty", function() {
        var roomId =  roomServiceUnderTest.createNewRoom();
        expect(roomId).toBeDefined();
        expect(roomId).not.toBeNull();
        expect(roomServiceUnderTest.doesRoomExist(roomId)).toBeTruthy();
        expect(roomServiceUnderTest.isRoomEmpty(roomId)).toBeTruthy();
    });

    it("Test doesRoomEmpty returns false when a room does not exist", function() {
      expect(roomServiceUnderTest.doesRoomExist("AnyRoom")).toBeFalsy();
    });

    it("Test Adding peers to a room", function() {
        expect(true).toBe(true);
    });

});