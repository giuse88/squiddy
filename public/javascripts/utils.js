/* utils.js */

function setStatus(status) {
  $('#status').html(status);
}

function get_room_id_from_url() {
  return get_url_values()["roomid"]; 
}

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

function get_time() {
    var d = new Date();
    return d.getTime();
}
