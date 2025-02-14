(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory.WS = factory;
    module.exports = factory;
  }
  else if (typeof define === 'function' && define.amd) {
    define('JZZ.midi.WS', ['JZZ'], factory);
  }
  else {
    factory(JZZ);
  }
})(this, function(JZZ) {

  /* istanbul ignore next */
  if (JZZ.WS) return;
  var _WS = typeof WebSocket == 'undefined' ? require('ws') : WebSocket;

  function connect(url) {
    var ws = new _WS(url);
    //console.log('WS:', ws);

    ws.onerror = console.error;
    ws.onopen = function open() {
      //ws.send('hello from client!');
    };
    ws.onclose = function open() {
      console.log('connection closed:', url);
    };
    ws.onmessage = function message(evt) {
      console.log('received: %s', evt.data);
    };
  }

  function Server(wss) {
    if (!(this instanceof Server)) return new Server(wss);
    self = this;
    this.wss = wss;
    this.cli = [];
    this.ins = {};
    this.outs = {};
    this.inputs = [];
    this.outputs = [];
    wss.on('connection', function connection(ws) {
      _add(self.cli, ws);
      ws.on('error', console.error);
      ws.on('message', function message(data) {
        console.log('received: %s', data);
      });
      ws.on('close', function() { self.cli = _remove(self.cli, ws); });
      ws.send(_info(self));
    });
  }
  Server.prototype.addMidiIn = function(name, widget) {
    if (this.ins[name]) return;
    this.ins[name] = widget;
    this.inputs.push(name);
    _send(this, _info(this));
  }
  Server.prototype.addMidiOut = function(name, widget) {
    if (this.outs[name]) return;
    this.outs[name] = widget;
    this.outputs.push(name);
    _send(this, _info(this));
  }
  function _add(a, x) {
    for (var n = 0; n < a.length; n++) if (a[n] == x) return a;
    a.push(x);
    return a;
  }
  function _remove(a, x) {
    var v = [];
    for (var n = 0; n < a.length; n++) if (a[n] != x) v.push(x);
    return v;
  }
  function _info(self) {
    return JSON.stringify({ info: { inputs: self.inputs, outputs: self.outputs }});
  }
  function _send(self, msg) { for (var n = 0; n < self.cli.length; n++) self.cli[n].send(msg); }

  JZZ.WS = { connect: connect, Server: Server };
});
