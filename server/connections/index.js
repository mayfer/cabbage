const rfr = require('rfr');
const credentials = rfr('/credentials.json');

const Events = require('events')
//const Event_hub = rfr('/server/events/hub')

const Redis = require('ioredis');

class Connections extends Events {
    async init () {

        let start = Date.now();

        let credentials = {};
        credentials = rfr("/credentials.json");

        const db = require('./db');

        this.db = db;

        /*
        this.event_hub = new Event_hub({ db });
        this.event_hub.on('event_hub_init_success', () => {
            const redis = require('./redis');

            this.redis = redis;

            this.emit('ready', this)
        })

        this.event_hub.init()
        */

        this.elasticsearch = rfr('./server/connections/elasticsearch');

        this.redis = new Redis({
            port: credentials.redis.port,
            host: credentials.redis.host,
            db: credentials.redis.database,
        });


        /*
        const typeorm = require("typeorm");
        const {UserSchema} = rfr("/server/services/users/models")

        this.orm = await typeorm.createConnection({
            type: "postgres",
            host: credentials.postgres.host,
            port: credentials.postgres.port,
            username: credentials.postgres.user,
            password: credentials.postgres.password,
            database: credentials.postgres.database,
            synchronize: true,
            entitySchemas: [
                new EntitySchema(Object.assign({ target: User }, UserSchema))
            ]
        })
        */

        this.emit('ready', this)


        console.log(`Connections ready in ${(Date.now() - start)/1000} seconds`);

        return this;
    }
}

module.exports = new Connections()
module.exports.class = Connections;
