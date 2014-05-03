/* utils.js */

function setStatus(status) {
  $('#status').html(status);
}

function get_room_id_from_url() {
  return window.location.pathname.replace('/', '');
}
navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\bOPR\/(\d+)/)
        if(tem!= null) return 'Opera '+tem[1];
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();


function get_url_values(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?')
                   + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function make_peer_id(length){
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   return text;
}
function isHidden(element) {
    return $(element).css('display') === 'none' ? true : false;
}
function get_time() {
    var d = new Date();
    return d.getTime();
}

 function removeAllCryptoLines (sdp) {

    function removeSingleLine(sdp) {
        var start = sdp.indexOf("a=crypto");
        if ( start == -1)
            return false;
        var end= sdp.indexOf("\n", start);
        var line = sdp.substring(start, end+1);
        return sdp.replace(line, "");
    }
    //
     while(true){
         var result = removeSingleLine(sdp);
         if(!result)
            break;
         sdp=result;
     }
    //
    return sdp;
}

function renderError(error) {
    return _.template($('#error-template').html(), error);
}