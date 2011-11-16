
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

Benji.prototype.ready = function(callback){

  if($.GetBrowserName()=='mozilla'){
    this.connection = new MozWebSocket(this.host);
  }else{
    this.connection = new WebSocket(this.host);
  }
  var that = this;
  this.connection.onerror = function(error){console.log('WS Error:'+error);}
  this.connection.onmessage = function(e){that.process(e);}

  this.connection.onopen = callback;
}

// Push a command into the queue
Benji.prototype.on = function(command,callback){
  this.commands.push([command,callback]);
}

// On a message, read the message and call 
// the correct call back
Benji.prototype.process = function(e){
  for(var x in this.commands){
    var command = this.commands[x][0];
    var callback = this.commands[x][1];

    json = $.parseJSON(e.data);
    if(json.command==command){
      callback(json.data);
    }
  }
}

Benji.prototype.send = function(payload){
  payload.id = this.id;
  this.connection && this.connection.send($.serializeJSON(payload));
}


// BenjiClient
var BenjiClient = function(host,ready_callback){
  this.host = 'ws://'+host; 
  this.ready_callback = ready_callback;
  this.imhere();
  this.imleaving();
}

BenjiClient.prototype = new Benji(this.host);

BenjiClient.prototype.imhere = function(){
  var that = this;
  this.ready(function(){ 
    that.send({
      command:'set_browser',
      browser:$.GetBrowserName(),
      time:(new Date()).getTime()
    });

    that.ready_callback();
  });
};

BenjiClient.prototype.imleaving = function(){
  var that = this;
  window.onbeforeunload = function(){
    that.send({command:'byebye'});
  }
}

BenjiClient.prototype.im = function(command,data){
  this.send({
    command:command,
    data:data,
    time:(new Date()).getTime()
  });
}