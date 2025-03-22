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

  function connect(url, timeout) {
    var self = new JZZ.lib.R();
    var ws;
    var ins = {};
    var outs = {};
    var inputs = [];
    var outputs = [];
    var start = true;
    var dead = false;
    var error = false;
    timeout = timeout == parseInt(timeout) && timeout > 0 ? timeout : 5000;
    timeout = setTimeout(function() { if (start) { self._crash(); dead = true; } }, timeout);
    self._close = function() {
      dead = true;
      JZZ.lib.unplug(self);
      if (ws) ws.close();
    };
    var reconnect = function() {
      try {
        ws = new _WS(url);
        ws.onerror = function(e) {
          if (!error) console.error(e);
          error = true;
        };
        ws.onclose = function() {
          var i;
          for (i = 0; i < inputs.length; i++) {
            ins[inputs[i]].disconnect();
            JZZ.removeMidiIn(url + ' - ' + inputs[i]);
          }
          for (i = 0; i < outputs.length; i++) {
            outs[outputs[i]].disconnect();
            JZZ.removeMidiOut(url + ' - ' + outputs[i]);
          }
          ins = {}; outs = {};
          inputs = []; outputs = [];
          if (!dead) setTimeout(reconnect, 1000);
        };
        ws.onmessage = function(evt) {
          if (timeout) {
            JZZ.lib.plug(self);
            clearTimeout(timeout);
            timeout = undefined;
          }
          error = false;
          try {
            var x = JSON.parse(evt.data);
            if (x.info) {
              var i, d, w;
              d = _diff(x.info.inputs, inputs);
              for (i = 0; i < d[0].length; i++) {
                w = new JZZ.Widget();
                ins[d[0][i]] = w;
                JZZ.addMidiIn(url + ' - ' + d[0][i], w);
              }
              for (i = 0; i < d[1].length; i++) {
                ins[d[1][i]].disconnect();
                delete ins[d[1][i]];
                JZZ.removeMidiIn(url + ' - ' + d[1][i]);
              }
              d = _diff(x.info.outputs, outputs);
              for (i = 0; i < d[0].length; i++) {
                w = new JZZ.Widget({ _receive: _onmsg(ws, d[0][i]) });
                outs[d[0][i]] = w;
                JZZ.addMidiOut(url + ' - ' + d[0][i], w);
              }
              for (i = 0; i < d[1].length; i++) {
                outs[d[1][i]].disconnect();
                delete outs[d[1][i]];
                JZZ.removeMidiOut(url + ' - ' + d[1][i]);
              }
              inputs = x.info.inputs;
              outputs = x.info.outputs;
              if (start) {
                start = false;
                self._resume();
              }
            }
            else if (x.midi) {
              if (ins[x.id]) ins[x.id].send(_decode(x.midi));
            }
          }
          catch(e) {
            console.error(e.message);
          }
        };
      }
      catch (e) {
        console.error(e.message);
        self._crash();
      }
    };
    reconnect();
    return self._thenable();
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
    wss.on('connection', function(ws) {
      _add(self.cli, ws);
      ws.on('error', console.error);
      ws.on('message', function(data) {
        try {
          var x = JSON.parse(data);
          if (x.midi) {
            if (self.outs[x.id]) self.outs[x.id].send(_decode(x.midi));
          }
        }
        catch(e) {/**/}
      });
      ws.on('close', function() { self.cli = _remove(self.cli, ws); });
      ws.send(_info(self));
    });
  }
  Server.prototype.addMidiIn = function(name, widget) {
    if (this.ins[name]) return;
    this.ins[name] = widget;
    this.inputs.push(name);
    var self = this;
    widget.connect(function(msg) {
      _send(self, JSON.stringify({ id: name, midi: _encode(msg) }));
    });
    _send(this, _info(this));
  };
  Server.prototype.addMidiOut = function(name, widget) {
    if (this.outs[name]) return;
    this.outs[name] = widget;
    this.outputs.push(name);
    _send(this, _info(this));
  };
  Server.prototype.removeMidiIn = function(name) {
    var n = this.inputs.indexOf(name);
    if (n != -1) {
      this.inputs.splice(n, 1);
      this.ins[name].disconnect();
      delete this.ins[name];
      _send(this, _info(this));
    }
  };
  Server.prototype.removeMidiOut = function(name) {
    var n = this.outputs.indexOf(name);
    if (n != -1) {
      this.outputs.splice(n, 1);
      this.outs[name].disconnect();
      delete this.outs[name];
      _send(this, _info(this));
    }
  };
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
  function _encode(m) {
    var x = { midi: m.splice(0, m.length) };
    var k = Object.keys(m);
    for (var n = 0; n < k.length; n++) if (k[n] != 'length' && k[n] != '_from') x[k[n]] = m[k[n]];
    return x;
  }
  function _decode(x) {
    var m = new JZZ.MIDI(x.midi);
    var k = Object.keys(x);
    for (var n = 0; n < k.length; n++) if (k[n] != 'midi') m[k[n]] = k[k[n]];
    return m;
  }
  function _diff(a, b) {
    var i, aa = [], bb = [];
    for (i = 0; i < a.length; i++) if (!b.includes(a[i])) aa.push(a[i]);
    for (i = 0; i < b.length; i++) if (!a.includes(b[i])) bb.push(b[i]);
    return [aa, bb];
  }
  function _onmsg(ws, name) {
    return function(msg) {
      ws.send(JSON.stringify({ id: name, midi: _encode(msg) }));
    };
  }

  JZZ.WS = {
    connect: connect,
    decode: _decode,
    encode: _encode,
    Server: Server
  };
});
