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
  if (JZZ.connectWS) return;
  console.log(typeof WebSocket);
  var _WS = typeof WebSocket == 'undefined' ? require('ws') : WebSocket;

  function connectWS(url) {
    var ws = new _WS(url);
    //console.log('WS:', ws);

    ws.onerror = console.error;
    ws.onopen = function open() {
      //ws.send('hello from client!');
    };
    ws.onclose = function open() {
      console.log('connection closed:', url);
    };
    ws.onmessage = function message(evt) {
      console.log('received: %s', evt.data);
    };
  }

  JZZ.connectWS = connectWS;
});
