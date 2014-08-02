//app.js
var MAX_USER = 30;
var connection_count = 0;

var log4js = require('log4js');
var logger = log4js.getLogger();
//logger.setLevel('INFO');
logger.setLevel('DEBUG');
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
    if (MAX_USER <= connection_count) {
	ws.close();
	logger.info('Connection rejected. Room is full.');
	return;
    }
    connection_count += 1;
    logger.info('New websocket connection from %s:%d (%d)', ws._socket.remoteAddress, ws._socket.remotePort,connection_count);
    //配列にWebSocket接続を保存
    var conObj = {ws : ws};
    
    connections.push(conObj);
    // 切断時
    ws.on('close', function () {
        connection_count -=1;
        logger.info('Disconnected %s:%d (%d)', ws._socket.remoteAddress, ws._socket.remotePort,connection_count);
        connections = connections.filter(function (conn, i) {
            return (conn.ws === ws) ? false : true;
        });
    });
    //メッセージ送信時
    ws.on('message', function (message) {
        logger.debug('message:', message);
        var msgObj = JSON.parse(message);
        if (msgObj.type == 'login'){
            conObj.msgObj = msgObj;
            conObj.userId = 1;
        }
        broadcast(msgObj);
    });
});

//ブロードキャストを行う
function broadcast(msgObj) {
    var jsonmsg = JSON.stringify(msgObj);
    connections.forEach(function (con, i) {
        con.ws.send(jsonmsg);
    });
};
 
server.listen(3000);
