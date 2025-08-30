var assert = require('assert');
var JZZ = require('jzz');

const Net = {};
function nop() {}
function schedule(fn) { setTimeout(fn, 1); }

function WS(url) {  // client
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) throw { message: 'bad url' };
  var self = this;
  var refl = {
    onerror: nop,
    onclose: nop,
    onmessage: nop,
    on: function(evt, fn) {
      if (evt == 'error') this.onerror = fn;
      if (evt == 'close') this.onclose = fn;
      if (evt == 'message') this.onmessage = fn;
    },
    close: function() { schedule(function() { self.onclose(); }) },
    send: function(data) { self.onmessage({ data: data }); }
  };
  this.send = function(data) { refl.onmessage(data); }
  if (Net[url]) {
    schedule(function() { Net[url].client(refl); });
  }
}
WS.prototype.onerror = nop;
WS.prototype.onclose = nop;
WS.prototype.onmessage = nop;
WS.prototype.close = function() { this.onclose(); }

function WSS(url) { // server
  this.url = url;
  this.clients = [];
  this.handle = { connect: nop };
}
WSS.prototype.connect = function() { if (!Net[this.url]) Net[this.url] = this; };
WSS.prototype.onconnection = nop;
WSS.prototype.on = function(evt, fn) { if (evt == 'connection') this.onconnection = fn; };
WSS.prototype.client = function(ws) {
  this.clients.push(ws);
  this.onconnection(ws);
};
WSS.prototype.disconnect = function() {
  if (Net[this.url]) delete Net[this.url];
  for (var ws of this.clients) ws.close();
};

global.WebSocket = WS;
require('..')(JZZ);

function sleep(t) {
  return new Promise(function(res) { setTimeout(res, t); });
}

describe('WebSocket', function() {
  it('bad url', function(done) {
    JZZ.WS.connect('bad url').or(done);
  });
  it('no connection', function(done) {
    JZZ.WS.connect('ws://localhost:8888', 20).then(undefined, function() { done(); });
  });
  it('connected', function(done) {
    var url = 'ws://connected'; // by the test name
    var wss = new WSS(url);
    /* eslint-disable no-unused-vars */
    var server = new JZZ.WS.Server(wss);
    wss.connect();
    JZZ.WS.connect(url).and(done).or('Cannot connect');
  });
  it('send midi', function(done) {
    var url = 'ws://send_midi';
    var wss = new WSS(url);
    var server = new JZZ.WS.Server(wss);
    server.addMidiOut('midi_out', new JZZ.Widget({
      _receive: function() { done(); }
    }));
    wss.connect();
    JZZ.WS.connect(url).and(function() {
      JZZ({ engine: 'none' }).openMidiOut('ws://send_midi - midi_out').noteOn(0, 'C5');
    }).or('Cannot connect');
  });
  it('receive midi', function(done) {
    var url = 'ws://receive_midi';
    var wss = new WSS(url);
    var server = new JZZ.WS.Server(wss);
    var server_midi_in = new JZZ.Widget();
    server.addMidiIn('midi_in', server_midi_in);
    wss.connect();
    var client = JZZ.WS.connect(url).and(function() {
      var port = JZZ({ engine: 'none' }).openMidiIn('ws://receive_midi - midi_in');
      port.connect(function() { client.close(); done(); });
      server_midi_in.noteOn(0, 'C6');
    }).or('Cannot connect');
  });
  it('reconnect', async function() {
    this.timeout(6000);
    var url = 'ws://reconnect';
    var wss = new WSS(url);
    var server = new JZZ.WS.Server(wss);
    var widget = new JZZ.Widget();
    wss.connect();
    server.addMidiIn('w1', widget);
    server.addMidiOut('w1', widget);
    server.removeMidiIn('w2');
    server.removeMidiOut('w2');
    await JZZ.WS.connect(url);
    var info = await JZZ({ engine: 'none' }).info();
    assert.equal(info.inputs[0].name, 'ws://reconnect - w1');
    wss.disconnect();
    await sleep(100);
    server.addMidiIn('w2', widget);
    server.addMidiOut('w2', widget);
    server.removeMidiIn('w1');
    server.removeMidiOut('w1');
    wss.connect();
    await sleep(5000);
    info = await JZZ().info();
    assert.equal(info.inputs[0].name, 'ws://reconnect - w2');
  });
});
