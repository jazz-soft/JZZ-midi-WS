var assert = require('assert');
var JZZ = require('jzz');

const Net = {};
function nop() {}
function schedule(fn) { setTimeout(fn, 1); }

function WS(url) {  // client
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) throw 'bad url';
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
    send: function(data) { self.onmessage({ data: data }); }
  };
  if (Net[url]) {
    schedule(function() { Net[url].client(refl); });
  }
}
WS.prototype.onerror = nop;
WS.prototype.onclose = nop;
WS.prototype.onmessage = nop;

function WSS(url) { // server
  this.url = url;
  this.handle = { connect: nop };
}
WSS.prototype.connect = function() { if (!Net[this.url]) Net[this.url] = this; };
WSS.prototype.onconnection = nop;
WSS.prototype.on = function(evt, fn) { if (evt == 'connection') this.onconnection = fn; };
WSS.prototype.client = function(ws) { this.onconnection(ws); };

global.WebSocket = WS;
require('..')(JZZ);

describe('WebSocket', function() {
  it('bad url', function(done) {
    JZZ.WS.connect('bad url').or(done);
  });
  it('no connection', function(done) {
    JZZ.WS.connect('ws://localhost:8888', 100).then(undefined, function() { done(); });
  });
  it('connected', function(done) {
    var url = 'ws://connected'; // by the test name
    var wss = new WSS(url);
    var server = new JZZ.WS.Server(wss);
    wss.connect();
    JZZ.WS.connect(url).and(done).or('Cannot connect');
  });
});
