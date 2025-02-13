const os = require('os');
const WS = require('ws');
const JZZ = require('jzz');
require('.')(JZZ);

const port = 8888;
const server = new JZZ.WSServer(new WS.Server({ port: port }));
server.addMidiOut('Debug', JZZ.Widget({ _receive: function(msg) { console.log(msg.toString()); }}));
server.addMidiIn('Dummy', JZZ.Widget());

console.log(`Running at ws://${myIP()}:${port}\n^C to stop...`);

function myIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family == 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}