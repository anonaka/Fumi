var WebSocket = require('ws');

var ws = new WebSocket('ws://truelogic.biz:3000/fumi');

ws.on('open', function open() {
    ws.send('something');
    console.log("open");
});

ws.on('message', function(data, flags) {
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    console.log("got message");
});



