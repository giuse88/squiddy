
exports.chatRoom = function(req, res, roomService){
    "use strict";

    var roomId = req.path.replace('/','');

    if (roomService.doesRoomExist(roomId))
        res.render("chatRoomView", { "roomId" : roomId} );
    else
        res.render("chatRoomErrorView", { "roomId" : roomId});
};