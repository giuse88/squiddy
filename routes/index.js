/*
 * GET home page.
 */

exports.index = function(req, res, roomService){
    res.redirect('/' + roomService.createNewRoom());
};