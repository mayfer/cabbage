define(function(require) {
	const socketio = require('sockets/socket.io');

	function debug(...args) {
		// console.log(...args);
	}

    const socket = socketio(undefined, {
        'query': ""	,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 30000,
        'reconnectionAttempts': "Infinity",
        'transports': ['websocket',],
    });
	socket.on('reconnect_attempt', () => {
		socket.io.opts.transports = ['polling', 'websocket'];
		debug("reconnect attempt", {socket})
	})
    socket.on('disconnect', function() {
		debug("disconnected", {socket})
    });
    socket.on('reconnect', function(){
		debug("reconnected", {socket})
	});
    socket.connect();
    const get_connection = new Promise( (resolve, reject) => {
    	if(socket.connected) {
    		debug("already connected", {socket})
    		resolve(socketio, socket);
    	} else {

    		socket.on('connect', function() {
				debug("connected", {socket})
				resolve({socketio, socket});
		    });	
    	}
    })
	socket_channels = [];
	return { get_connection };
});