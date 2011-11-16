
var Benji = function(host){
  this.commands = [];
  this.id = this.genID();
  this.host = 'ws://'+host;
};

// Generate ID for visitor
Benji.prototype.genID = function(){
  var n = (new Date()).getTime();
  var k = Math.floor(Math.random()* 1000000);
  return n+k;
}

Benji.prototype.run = function(callback){

  if($.GetBrowserName()=='mozilla'){
    this.connection = new MozWebSocket(this.host);
  }else{
    this.connection = new WebSocket(this.host);
  }

  var that = this;

  this.connection.onerror = function(error){console.log('WS Error:'+error);}
  this.connection.onmessage = function(e){that.OnMessage(that,e);}
  this.connection.onopen = callback;

  window.onbeforeunload = function(){
    that.Send({command:'byebye'});
  }
}

// Push a command into the queue
Benji.prototype.OnCommand = function(command,callback){
  this.commands.push([command,callback]);
}

// On a message, read the message and call 
// the correct call back
Benji.prototype.OnMessage = function(that,e){
  for(var x in that.commands){
    var command = that.commands[x][0];
    var callback = that.commands[x][1];

    json = $.parseJSON(e.data);
    if(json.command==command){
      callback(json.data);
    }
  }
}

Benji.prototype.Send = function(payload){
  payload.id = this.id;
  this.connection.send($.serializeJSON(payload));
}


// BenjiClient
var BenjiClient = function(host){
  this.host = host; 
}

BenjiClient.prototype = new Benji(this.host);

BenjiClient.prototype.imhere = function(){
  console.log('I am here');
};
BenjiClient.prototype.imleaving = function(){
  console.log('I am leaving');
}
BenjiClient.prototype.im = function(command,data){
  // Im - entering data on a input
}