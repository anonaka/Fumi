var io = require('socket.io-client')
var url = "truelogic.biz";
var options = {
    'force new connection':true,
    port:3000
};

var maxConnect = 5;
var socket;

for(var i = 0 ;i < maxConnect; i++) {
    socket = io.connect(url, options);
    socket.on('connect', function (data) {
	connectCounter += 1;
	console.log("connect. connectCounter=" + connectCounter);
    });

    socket.on('sendMsgFromServer', function (msg) {
	console.log("message:",msg);
    });
}

setTimeout(function(){
    socket.emit("sendMsgFromClient","send client msg");
},3000);
