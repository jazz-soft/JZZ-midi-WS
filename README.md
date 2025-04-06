# JZZ-midi-WS
## MIDI via WebSockets for browser and Node.js
and, YES, it's visible from the Web MIDI API!

[![npm](https://img.shields.io/npm/v/jzz-midi-ws.svg)](https://www.npmjs.com/package/jzz-midi-ws)
[![npm](https://img.shields.io/npm/dt/jzz-midi-ws.svg)](https://www.npmjs.com/package/jzz-midi-ws)
[![build](https://github.com/jazz-soft/JZZ-midi-WS/actions/workflows/build.yml/badge.svg)](https://github.com/jazz-soft/JZZ-midi-WS/actions)
[![Coverage Status](https://coveralls.io/repos/github/jazz-soft/JZZ-midi-WS/badge.svg)](https://coveralls.io/github/jazz-soft/JZZ-midi-WS)

## Usage
##### Plain HTML
```html
<script src="JZZ.js"></script>
<script src="JZZ.midi.WS.js"></script>
//...
```
##### CDN (jsdelivr)
```html
<script src="https://cdn.jsdelivr.net/npm/jzz"></script>
<script src="https://cdn.jsdelivr.net/npm/jzz-midi-ws"></script>
//...
```
##### CDN (unpkg)
```html
<script src="https://unpkg.com/jzz"></script>
<script src="https://unpkg.com/jzz-midi-ws"></script>
//...
```
##### CommonJS
```js
var JZZ = require('jzz');
require('jzz-midi-ws')(JZZ);
//...
```

## Client
##### (Browser or Node.js)
```js
JZZ.WS.connect('ws://localhost:8888'); // not necessarily local :)
// ... 
var port = JZZ().openMidiOut('ws://localhost:8888 - Microsoft GS Wavetable Synth');
// ... 
port.noteOn(0, 'C5', 127);
```
See another example at https://github.com/jazz-soft/JZZ-midi-WS/blob/main/test.html ...

### Client API
```js
var connection = JZZ.WS.connect(url, timeout);
```
Constructor. `url` - websocket address/port;
`timeout` (optional) - time in `ms` before fail if the connection cannot be established; default: `5000`.  
Upon successful connection, remote MIDI ports are added and tracked automatically.  
If the connection is lost, client tries to reconnect.

```js
connection.close();
```
Disconnect and close all related MIDI ports.

### Asynchronous calls
```js
function good() { console.log('Connected!'); }
function bad() { console.log('Cannot connect!'); }
var url = 'ws://localhost:8888';
var connection;
// method 1 (and/or):
connection = JZZ.WS.connect(url).and(good).or(bad);
// method 2 (then):
connection = JZZ.WS.connect(url).then(good, bad);
// method 3 (within an async function):
connection = await JZZ.WS.connect(url);
```

## Server
##### (Node.js only)
```js
const ws = require('ws');
const JZZ = require('jzz');
require('jzz-midi-ws')(JZZ);

// start a WebSocket server (see more ways of doing that at https://github.com/websockets/ws)
const wss = new ws.Server({ port: 8888 });

// start a MIDI via WebSockets server
const server = new JZZ.WS.Server(wss);

// add actual MIDI ports
JZZ().and(function() {
    var info = JZZ().info();
    for (var p of info.inputs) server.addMidiIn(p.id, JZZ().openMidiIn(p.id));
    for (var p of info.outputs) server.addMidiOut(p.id, JZZ().openMidiOut(p.id));
});

// and/or virtual ports
server.addMidiIn('Dummy', JZZ.Widget());
server.addMidiOut('Debug', JZZ.Widget({ _receive: function(msg) { console.log(msg.toString()); }}));
```
A more advanced example is available at https://github.com/jazz-soft/WS-MIDI-Server ...

### Server API
```js
var server = new JZZ.WS.Server(wss);
```
Constructor. `wss` - websocket server.

```js
server.addMidiIn(name, port);
server.addMidiOut(name, port);
```
Add MIDI port. `name` - name to bee seen by the client; `port` - MIDI port (real or virtual).

```js
server.removeMidiIn(name);
server.removeMidiOut(name);
```
Remove MIDI port.

## See also
- [WS Client](https://jazz-soft.github.io/JZZ-midi-WS) - a live demo at github.io
- [JZZ](https://github.com/jazz-soft/JZZ) - MIDI library for Node.js and web-browsers