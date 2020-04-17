
require('global-define')({
    basePath: __dirname+'/client',
    paths: {
        'preact': 'core/preact-htm-umd',
    }
});
const requirejs = require('requirejs');


const rfr = require('rfr');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const credentials = rfr('/credentials.json');

const compress = require('compression');
const passport = require('passport');
const { argv } = require('yargs');

(async () => {

    // hold until all connections are loaded
    console.log("Initializing connections...")
    await rfr('/server/connections/loader.js');
    const redis_client = rfr('/server/connections').redis;


    let app = express();
    let http = require('http').Server(app);

    app.enable('trust proxy'); // for https stuff
    app.use(compress());
    app.use('/client', express.static(path.join(__dirname, './client')));
    app.use('/client.es5', express.static(path.join(__dirname, './client.es5')));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true,
        defer: true,
        limit: 1024*1024*100,
        parameterLimit: 100000,

    }));
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(require('cookie-parser')());

    const sessionMiddleware = session({
        store: new RedisStore({ client: redis_client }),
        secret: 'omgwtfbbq123',
        resave: false,
        saveUninitialized: true,
    });
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());
    
    const io = require('socket.io')(http);
    const redis_adapter = require('socket.io-redis');

    io.adapter(redis_adapter({
        host: credentials.socketio_redis.host,
        port: credentials.socketio_redis.port,
        key: credentials.socketio_redis.database,
    }));
        
    io.use(function(socket, next){
        // Wrap the express middleware
        sessionMiddleware(socket.request, {}, next);
    })

    const socketio_loader = rfr('/server/services/websockets');
    const websockets = await socketio_loader({io});

    const url_loader = rfr('/server/urls/cabbage');
    url_loader({app, io, websockets});


    // define port from terminal like: --port=2002 (example: node server.js --cron --port=2002)
    let port = parseInt(argv.port) || 8004;
    http.listen(port, function() {
        console.log(`Listening on *:${port}`);
    });

})();
