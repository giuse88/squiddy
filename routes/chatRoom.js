
exports.chatRoom = function(req, res, roomService){
    "use strict";

    var roomId = req.path.replace('/','');

    if (roomService.doesRoomExist(roomId))
        // TODO remove the option from here
        res.render("chatRoomView", { "roomId" : roomId, "videoDefinitions" : ["None", "QVGA", "VGA", "HD"]} );
    else
        res.render("chatRoomErrorView", { "roomId" : roomId});
};