
jQuery(function($) {
  $.extend({
    serializeJSON: function(obj) {
      var t = typeof(obj);
      if(t != "object" || obj === null) {
        // simple data type
        if(t == "string") obj = '"' + obj + '"';
        return String(obj);
      } else {
        // array or object
        var json = [], arr = (obj && obj.constructor == Array);

        $.each(obj, function(k, v) {
          t = typeof(v);
          if(t == "string") v = '"' + v + '"';
          else if (t == "object" & v !== null) v = $.serializeJSON(v)
          json.push((arr ? "" : '"' + k + '":') + String(v));
        });

        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
      }
    }
  });
});

var LiveStat = function(){
  this.rate = 400;
  this.connection = null;
  this.commands = [];
  this.id = this.genID();
};

LiveStat.prototype.genID = function(){
  var n = (new Date()).getTime();
  var k = Math.floor(Math.random()* 1000000);
  return n+k;
}

LiveStat.prototype.run = function(callback){

  this.connection = new WebSocket('ws://0.0.0.0:8080');

  this.connection.onerror = function(error){console.log('WS Error:'+error);}

  var that = this;
  this.callback = callback;

  this.connection.onmessage = function(e){that.OnMessage(that,e);}

  this.connection.onopen = function(){

    if(that.connection){
      that.callback();
      
      setInterval(function(){
        that.Send({command:'get_visitors'});
      },that.rate);
    }
  };

  window.onbeforeunload = function(){
    that.Send({command:'byebye'});
  }
}



LiveStat.prototype.HandleRequest = function(data,command,callback){
  json = $.parseJSON(data);
  if(json.command==command){
    callback(json.data);
  }
};

LiveStat.prototype.OnCommand = function(command,callback){
  this.commands.push([command,callback]);
}

LiveStat.prototype.OnMessage = function(that,e){
  for(var x in that.commands){
    var command = that.commands[x][0];
    var callback = that.commands[x][1];

    that.HandleRequest(e.data,command,callback);
  }
}

LiveStat.prototype.Send = function(payload){
  payload.id = this.id;
  this.connection.send($.serializeJSON(payload));
}