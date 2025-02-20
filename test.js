var JZZ = require('jzz');
require('.')(JZZ);

JZZ.WS.connect('ws://localhost:8888');
JZZ({engine:'none'}).and(function() {
  var info = JZZ().info();
  var w;
  for (w of info.inputs) addedIn(w.name);
  for (w of info.outputs) addedOut(w.name);
}).or('Cannot start MIDI engine');
JZZ().onChange(function(x) {
  var w;
  for (w of x.inputs.added) addedIn(w.name);
  for (w of x.outputs.added) addedOut(w.name);
  for (w of x.inputs.removed) removedIn(w.name);
  for (w of x.outputs.removed) removedOut(w.name);
});

function addedIn(name) {
  JZZ().openMidiIn(name).connect(function(msg) { console.log(name + ': ' + msg); });
  console.log('Added MIDI In:', name);
}
function addedOut(name) {
  JZZ().openMidiOut(name);
  console.log('Added MIDI Out:', name);
}
function removedIn(name) {
  console.log('Removed MIDI In:', name);
}
function removedOut(name) {
  console.log('Removed MIDI Out:', name);
}
