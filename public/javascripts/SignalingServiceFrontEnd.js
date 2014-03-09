/**
 * Created with JetBrains WebStorm.
 * User: giuseppe
 * Date: 06/03/2014
 * Time: 18:43
 * To change this template use File | Settings | File Templates.
 */

/**
 * interface implemented
 *  Connect  return peer Id from the server
 * @type {*}
 */

//======================
//      EXCEPTIONS
//======================

function InvalidValueException(msg) {
    this.name = "InvalidValueException";
    this.message = msg;
}

// ========================
//    PUBLIC INTERFACE
// ========================

function SignalingService (){
    this._checkEventConstants();
}

SignalingService.prototype.connect = function(callBackOnConnected){
    //
    if (!io)
        throw new InvalidValueException("The module io has not been initialized.");
    //
    this.socket = io.connect();
    this._checkSocket();
    this.socket.on(events.CONNECTED, callBackOnConnected);
}

SignalingService.prototype.getSocket = function() {
    return this.socket;
}

SignalingService.prototype.send = function (eventType, payload) {
    if (!eventType || !payload)
        throw InvalidValueException("Specified an incorrect argument");
    this._checkEventType(eventType);
    this._checkSocket();
    this.socket.emit(eventType, payload);

}

SignalingService.prototype.setHandlerForByeEvent = function(handler){
    this._setHandlerFor(events.BYE, handler);
}
SignalingService.prototype.setHandlerForMessageEvent = function(handler){
    this._setHandlerFor(events.MESSAGE, handler);
}
SignalingService.prototype.setHandlerForJoinEvent = function(handler){
    this._setHandlerFor(events.JOIN, handler);
}
SignalingService.prototype.setHandlerForJoinedEvent = function(handler){
    this._setHandlerFor(events.JOINED, handler);
}

//============================================//
//              PRIVATE METHODS
//============================================//

SignalingService.prototype._checkSocket = function(){
    if (!this.socket)
        throw new InvalidValueException("Invalid socket.io .");
}

SignalingService.prototype._checkEventType = function (new_event) {
    if ( new_event !== events.REQUEST  &&
         new_event !== events.MESSAGE)
    throw new InvalidValueException("The event " + new_event + " specified is unknown.");
}

SignalingService.prototype._setHandlerFor= function (new_event, handler) {
    if (!handler)
        throw new InvalidValueException("The handler :  " + handler + "is invalid.");
    this._checkSocket();
    this.socket.on(new_event, hanlder);
}

SignalingService.prototype._checkEventConstants= function(){
    "use strict";
    if(!events.REQUEST)
        console.log("Error");
}
