const os = require('os');
const ws = require('ws');
const JZZ = require('jzz');
require('.')(JZZ);

const port = 8888;
const server = new JZZ.WS.Server(new ws.Server({ port: port }));
JZZ().and(function() {
    var p;
    var info = JZZ().info();
    for (p of info.inputs) server.addMidiIn(p.id, JZZ().openMidiIn(p.id));
    for (p of info.outputs) server.addMidiOut(p.id, JZZ().openMidiOut(p.id));
    server.addMidiIn('Dummy', JZZ.Widget());
    server.addMidiOut('Debug', JZZ.Widget({ _receive: function(msg) { console.log(msg.toString()); }}));
}).or('Cannot start MIDI engine!');

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