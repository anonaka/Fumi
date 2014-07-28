//app.js
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info("Fumi server has started");

var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();
 
app.use(express.static(__dirname + '/fumi-client'));

var server = http.createServer(app);
var wss = new WebSocketServer({server:server});
 
//Websocket接続を保存しておく
var connections = [];
 
//接続時
wss.on('connection', function (ws) {
    logger.info('New websocket connection from %s:%d', ws._socket.remoteAddress, ws._socket.remotePort);
    //配列にWebSocket接続を保存
    connections.push(ws);
    //切断時
    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });
    //メッセージ送信時
    ws.on('message', function (message) {
	//console.log('message:', message);
        broadcast(JSON.stringify(message));
    });
});
 
//ブロードキャストを行う
function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};
 
server.listen(3000);
