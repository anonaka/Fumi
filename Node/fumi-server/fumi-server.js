// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
var MAX_USER = 30;
var connection_count = 0;

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('INFO');
//logger.setLevel('DEBUG');
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
var ERR_MAX_CONNECTION = 4000;
 
//接続時
wss.on('connection', function (ws) {
    if (MAX_USER <= connection_count) {
        ws.close(ERR_MAX_CONNECTION,"Max Connection");
        logger.info('Connection rejected. Room is full.');
        return;
    }
    connection_count += 1;
    logger.info('Connected    %s:%d (%d)', ws._socket.remoteAddress, ws._socket.remotePort,connection_count);
    
    ws.socketCache = {
        remoteAddress : ws._socket.remoteAddress,
        remotePort : ws._socket.remotePort
    }
    ws.fumiUserId = getUserId();

    //配列にWebSocket接続を保存
    connections.push(ws);
    // 切断時
    ws.on('close', function () {
        connection_count -=1;
        logger.info('Disconnected %s:%d (%d)', ws.socketCache.remoteAddress, ws.socketCache.remotePort,connection_count);
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
        // broadcast close message
        var msgObj = {
            type : 'close',
            clientIp : ws.socketCache.remoteAddress,
            clientPort : ws.socketCache.remoteAddress,
            fumiUserId : ws.fumiUserId
        }
        broadcast(msgObj);
    });
    
    //メッセージ送信時
    ws.on('message', function (message) {
        logger.debug('rcv message:', message);
        var msgObj = JSON.parse(message);
        if (msgObj.type == 'login'){
            // record user info in ws object
            ws.fumiLoginInfo = msgObj;
        }
        // put originator user id on broadcast message
        msgObj.fumiUserId = ws.fumiUserId;
        msgObj.clientIp = ws.socketCache.remoteAddress;
        msgObj.clientPort = ws.socketCache.remoteAddress;
        broadcast(msgObj);
    });
});

var userId = 0;

var getUserId = function(){
    //TODO assign uniq user id
    userId += 1;
    logger.debug('issue userId:', userId);
    return userId;
}
	
//ブロードキャストを行う
function broadcast(msgObj) {
    var msgstr = JSON.stringify(msgObj);
    connections.forEach(function (conn, i) {
        logger.debug('send message:',msgstr );
        conn.send(msgstr);
    });
};
 
server.listen(3000);
// @license-end
