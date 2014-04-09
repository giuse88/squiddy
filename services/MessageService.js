(function(util, LOG){

    var TABLE = "messages";
    var BROADCAST = "BROADCAST";
    var INSERT_TEMPLATE = "insert into %s (sender, receiver, type, roomid, message) " +
                                        "values ('%s', '%s','%s','%s','%s');";


    function MessageService(dao){
        this.dao = dao;
    }

    MessageService.prototype.add = function (message, callback, errCallback){
      if (!this.dao) {
        throw {msg:"Invalid Dao", name:"InvalidDaoException"};
      }
      var to = message.to ? message.to : BROADCAST;
      var sqlInsert =  util.format(INSERT_TEMPLATE, TABLE, message.from,to, message.type, message.roomId, message.msg);
      this.dao.insert(sqlInsert, callback, errCallback);
      LOG.trace("Message Service dispatched query  : " + sqlInsert);
    }

    module.exports = MessageService;

})(util,LOGGER);