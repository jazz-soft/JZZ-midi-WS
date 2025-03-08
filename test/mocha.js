var assert = require('assert');
var JZZ = require('jzz');

function WS() {
}
global.WebSocket = WS;
require('..')(JZZ);

describe('WebSocket', function() {
  it('dummy', function() {
    JZZ.WS.connect('ws://localhost:8888');
  });
});
