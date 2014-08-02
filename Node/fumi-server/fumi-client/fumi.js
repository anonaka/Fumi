"use strict";

//TODO set canvas size on window size change
$(window).bind("resize", function(){
               var w = $(window).width();
               var h = $(window).height();
               
               //$(".fumi_canvas").css("width", w + "px");
               //$(".fumi_canvas").css("height", h + "px");
               //$(".fumi_evt_canvas").css("width", w + "px");
               //$(".fumi_evt_canvas").css("height", h + "px");
               console.log('window width:'+ w + ' height:' + h);
               });

var fumiUsers = [];

function FumiCanvasFactory(){
    this.current = 0;

    this.canvasPool = [
        'fumi_canvas01',
        'fumi_canvas02',
        'fumi_canvas03',
        'fumi_canvas04',
        'fumi_canvas05',
        'fumi_canvas06',
        'fumi_canvas07',
        'fumi_canvas08'
    ];
    this.getNextCanvas = function (){
        if(this.canvasPool <= this.current)
            this.current = 0;
        this.current += 1;
        return this.canvasPool[this.current - 1];
    }
}

function FumiStyleFactory(){
    this.stylePool = [
        {
        initColor : 'blue',
        inColor : 'darkBlue',
        extColor : 'lightBlue'
        }, 
        {
        initColor : 'green',
        inColor : 'darkGreen',
        extColor : 'lightGreen'
        },
        {
        initColor: 'red',
        inColor: 'darkRed',
        extColor : 'lightPink'
        }];
 
    this.getFumiStyle = function(gender,age){
        return this.stylePool[0];
    }
}

function FumiWhiteBoard(fumiUser) {
    this.fumiUser = fumiUser;
    this.drawMode = false;
    this.lines = new Array();
    this.splines = new Array();
    this.pointList = new Array;
    this.setStyle();
    // must get canvas before creating the stage
    this.canvasId = fumiCanvasFactory.getNextCanvas();
    this.createDrawingStage();

}

FumiWhiteBoard.prototype.setStyle = function () {
    this.initWidth = '5';
    this.splineTention = 0.3;
    this.extWidth = 30;
    this.ratio = 0.6;
    this.inWidth = this.extWidth * this.ratio;
    this.opacity = 0.5;
    
    //TODO this is ugry
    var style = fumiStyleFactory.getFumiStyle(this.fumiUser.gender,this.age);
    
	this.initColor = style.initColor;	
    this.internalLineColor = style.inColor;
    this.externalLineColor = style.extColor;
}

FumiWhiteBoard.prototype.createDrawingStage = function () {
    var screen = getScreenSize();

    var stage = new Kinetic.Stage({
        container: this.canvasId,
        width: screen.width,
        height: screen.height,
        listening: false
    });

    if (!stage) {
        console.log('cannot initialize stage.')
    }
    this.layer_base = new Kinetic.Layer({listening: false});
    stage.add(this.layer_base);
    stage.listening = false;
    this.layer_base.istening = false;
    //$D(this.canvasId).style.visibility = "hidden";
    //$D(this.canvasId).style.zIndex = "200";
}


FumiWhiteBoard.prototype.addPoint = function (x, y) {
    this.pointList.push(x);
    this.pointList.push(y);
    if (this.pointList.length == 2) {
        return;
    }
    this.drawLine();
};

FumiWhiteBoard.prototype.drawLine = function () {
    var last = this.pointList.length;
    var x1 = this.pointList[last - 4];
    var y1 = this.pointList[last - 3];
    var x2 = this.pointList[last - 2];
    var y2 = this.pointList[last - 1];

    var line = new Kinetic.Line({
        points: [x1, y1, x2, y2],
        stroke: this.initColor,
        strokeWidth: this.initWidth,
        lineCap: 'round',
        lineJoin: 'round',
        listening: false
    });
    this.layer_base.add(line);
    this.layer_base.draw();
    this.lines.push(line);
}


FumiWhiteBoard.prototype.deleteAll = function (arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i].remove();
    }
    arr.length = 0;
    this.layer_base.draw();
}

FumiWhiteBoard.prototype.drawDoubleSpline = function () {
   var splineExt = new Kinetic.Line({
   		points: this.pointList,
        stroke: this.externalLineColor,
        opacity: this.opacity,
        strokeWidth: this.extWidth,
        lineCap: 'round',
        tension: this.splineTention,
        listening: false
    });
    var splineInt = new Kinetic.Line({
        points: this.pointList,
        stroke: this.internalLineColor,
        opacity: this.opacity,
        strokeWidth: this.inWidth,
        lineCap: 'round',
        tension: this.splineTention,
        listening: false
    });

    this.layer_base.add(splineExt);
    this.layer_base.add(splineInt);
    this.layer_base.draw();
    this.splines.push(splineExt);
    this.splines.push(splineInt);
};

FumiWhiteBoard.prototype.handleMouseDown = function (x, y, button) {
    this.drawMode = true;
    this.pointList = new Array();
    this.addPoint(x, y);
}

FumiWhiteBoard.prototype.handleMouseMove = function (x, y) {
    if (this.drawMode) {
        this.addPoint(x, y);
    }
}

FumiWhiteBoard.prototype.handleMouseUp = function (x, y) {
    if (this.drawMode == false) {
        return;
    }
    this.deleteAll(this.lines);
    this.drawDoubleSpline();
    this.drawMode = false;
};

FumiWhiteBoard.prototype.handleMouseEnter = function (x, y) {}

FumiWhiteBoard.prototype.handleMouseLeave = function (x, y) {
    this.handleMouseUp(x, y);
}

FumiWhiteBoard.prototype.handleDblClick = function (x, y) {
    this.deleteAll(this.splines);
}

FumiWhiteBoard.prototype.handleMessage = function (msgObj) {
    var command = msgObj.type;
    var x = msgObj.x;
    var y = msgObj.y;
    var button = msgObj.button;
    var buttons = msgObj.buttons;
    
	//console.log('handle commnad:' + command　+ ':' + x + ':' + y );
    switch (command) {
    case 'mousedown':
        this.handleMouseDown(x, y, button);
        break;
    case 'mouseup':
        this.handleMouseUp(x, y);
        break;
    case 'mousemove':
        this.handleMouseMove(x, y);
        break;
    case 'mouseleave':
        this.handleMouseLeave(x, y);
        break;
    case 'mouseenter':
        this.handleMouseEnter(x, y);
        break;
    case 'dblclick':
        this.handleDblClick(x, y);
        break;
    default:
        console.log('unknown message:' + command);
        break;
    }
}

/* main program starts here */

function broadcastCommunicator() {

    //TODO get port number form URL
    //var location = window.location.toString();
    //console.log(location);
    
    var port = '3000';
    var host = window.document.location.host.replace(/:.*/, '')
	var url = 'ws://' + host + ':' + port;
	console.log('connect fumi server:' + url);
    // assign socket to the global variable
	_bcsocket = new WebSocket(url);

    // When the connection is open, send login data to the server
    _bcsocket.onopen = function () {
        //TODO 8/2/2014 anonaka,seem like need some delay here
        // sometimes socket is not ready
        sendLogin();
    };

    // Log errors
    _bcsocket.onerror = function (error) {
        console.log('WebSocket Error ' + error);
        alert('Cannot connect the Broadcast server');
    };

    // Log messages from the server
    _bcsocket.onmessage = function (e) {
    	//console.log('receved msg:' + e.data);
        processReceivedMsg(e.data);
    };

    _bcsocket.onclose = function (e) {
    	cleanupCanvas();
        console.log('Connection closed.');
    }

    function processReceivedMsg(msg) {
        console.log('Rcvedmsg:' + msg);
        var msgObj = JSON.parse(msg);
        var uidString = String(msgObj.userId);

        if (msgObj.type == 'login'){
            msgObj.wb = new FumiWhiteBoard(msgObj);
            // record in hash
            fumiUsers[uidString] = msgObj;
            return;
        }
        // dispatch 
        var wb = fumiUsers[uidString].wb;
        wb.handleMessage(msgObj);
    }
}

var sendMouseEvent = function (command, evt) {
	if (evt.clientX == null) {
		// for the mobile device, iPad
		var touchPos = mouseEventStage.getPointerPosition();
        var x = touchPos.x;
        var y = touchPos.y;
	}
	else {
		// this path is for PCs
		var x = evt.clientX;
		var y = evt.clientY;
	
		if (evt.target != null){
			var brect = evt.target.getBoundingClientRect();
			x -= brect.left;
			y -= brect.top;
		}
	}	
	
	// compose message
	var msg = {
		type : command,
		x : x,
        y : y,
        button : evt.button,
		buttons : evt.buttons
    };
	sendToFumiServer(msg);
	//console.log('Send:' + msg);
}

var sendLogin = function(){
    // send my login info
    var loginMsg = {
        type : "login",
        name : "akira",
        age : 56,
        gender : "m"
    };
    sendToFumiServer(loginMsg);
}

// send msg to Fumi server in JSON format
var sendToFumiServer = function(msg){
    _bcsocket.send(JSON.stringify(msg));
}

// These values must be set by the portal sever
var whiteBoardMouseCnvasId = 'fumi_mouseevent_canvas';
var userId = '0';
var styleIndex = '0';
var mouseEventStage;

function getScreenSize() {
    //TODO must get screen size dynamically
    return {
    width: $(window).width(),
    height: $(window).height()
    }
}

function createMouseEventStage() {
    var screen = getScreenSize();
    var draw_mode = false;

    mouseEventStage = new Kinetic.Stage({
        container: whiteBoardMouseCnvasId,
        width: screen.width,
        height: screen.height
    });
    if(mouseEventStage == null) {
    	console.log('Failed to  create Kinetic.Stag');
    }

    var layer_mouse_event = new Kinetic.Layer();

    var rect = new Kinetic.Rect({
        width: screen.width,
        height: screen.height
    });

    if (!rect) {
        console.log('rect initialize error.')
    };

    layer_mouse_event.add(rect);

    if (!layer_mouse_event) {
        console.log('cannot initialize layer.')
    }

    layer_mouse_event.on("mousemove touchmove", function (evt) {
	    if (draw_mode) sendMouseEvent('mousemove', evt);
    });

    layer_mouse_event.on("mouseup touchend", function (evt) {
        sendMouseEvent('mouseup', evt);
	draw_mode = false;
    });

    layer_mouse_event.on("mousedown touchstart", function (evt) {
	sendMouseEvent('mousedown', evt);
	draw_mode = true;
    });

    layer_mouse_event.on('mouseleave', function (evt) {
        sendMouseEvent('mouseleave', evt);
	draw_mode = false;
    });

    layer_mouse_event.on('mouseenter', function (evt) {
        sendMouseEvent('mouseenter', evt);
    });

    layer_mouse_event.on('dblclick dbltap', function (evt) {
        sendMouseEvent('dblclick', evt);
	draw_mode = false;
    });

    layer_mouse_event.on('click tap', function (evt) {});
    mouseEventStage.add(layer_mouse_event);
}

// global variable, so that event handler can see this variable
var _bcsocket;

//TODO may need some consideration here
var fumiCanvasFactory = new FumiCanvasFactory();
var fumiStyleFactory = new FumiStyleFactory();

// Global onload handler

window.onload = function () {
    // set canvas size
    $(window).trigger("resize");
    broadcastCommunicator();
    createMouseEventStage();
}
        
// prepare for unload

function cleanupCanvas (){
	// create dummy mouse event
	var evt = document.createEvent("MouseEvent");
	// initialize mouse event
	evt.initMouseEvent("myCustomEvent",false,false,document.defaultView,0,0,0,0,0,false,false,false,false,0,null);
	sendMouseEvent('dblclick', evt);
	console.log('Clear the canvas on unload.');
}

window.onunload = cleanupCanvas;

