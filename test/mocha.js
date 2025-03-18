var assert = require('assert');
var JZZ = require('jzz');

function WS(url) {
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) throw 'bad url';
}
global.WebSocket = WS;
require('..')(JZZ);

describe('WebSocket', function() {
  it('bad url', function(done) {
    JZZ.WS.connect('bad url').or(done);
  });
  it('no connection', function(done) {
    JZZ.WS.connect('ws://localhost:8888', 100).then(undefined, function() { done(); });
  });
});
