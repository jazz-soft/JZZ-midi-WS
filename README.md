# JZZ-midi-WS
## MIDI via WebSockets for browser and Node.js
and, YES, it's visible from the Web MIDI API!

[![npm](https://img.shields.io/npm/v/jzz-midi-ws.svg)](https://www.npmjs.com/package/jzz-midi-ws)

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
