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
        logger.debug('rcv message:', message);
        var msgObj = JSON.parse(message);
        if (msgObj.type == 'login'){
            // record user if in connection object
            conObj.loginInfo = msgObj;
            conObj.loginInfo.userId = getUserId();
            //add server assigned uniq user id
            msgObj.userId = conObj.loginInfo.userId;
        }
        broadcast(msgObj);
    });
});

var userId = 0;

var getUserId = function(){
    //TODO assign uniq user id
    userId += 1;
    return userId;
}
	
//ブロードキャストを行う
function broadcast(msgObj) {
    connections.forEach(function (con, i) {
        // add login info
        //TODO need optimization here
        msgObj.userId = con.loginInfo.userId;
        con.ws.send(JSON.stringify(msgObj));
    });
};
 
server.listen(3000);
