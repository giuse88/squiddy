(function(util, LOG){

    var TABLE = "messages";
    var BROADCAST = "BROADCAST";
    var INSERT_TEMPLATE = "insert into %s (sender, receiver, type, roomid, message) " +
                                        "values ('%s', '%s','%s','%s','%s');";

    function MessageService(dao){
        this.dao = dao;
    }

    MessageService.prototype.add = function (message){
      if (!this.dao) {
        throw {msg:"Invalid Dao", name:"InvalidDaoException"};
      }

      var to = message.to ? message.to : BROADCAST;
      var content = JSON.stringify(message.msg);
      var sqlInsert =  util.format(INSERT_TEMPLATE, TABLE, message.from,to, message.type, message.roomId, content);

      function queryError(err) {
          LOG.trace("QUERY : '" +sqlInsert +"'");
          LOG.error("Query not executed. Error : " + err);
      }

      function querySuccess(result) {
          LOG.trace("QUERY : '" +sqlInsert +"'");
          LOG.trace("Query success. Rows affected : " + result.rowCount);
      }
      this.dao.insert(sqlInsert, querySuccess, queryError);
      LOG.trace("Message Service dispatched query  : " + sqlInsert);
    }

    module.exports = MessageService;

})(util,LOGGER);