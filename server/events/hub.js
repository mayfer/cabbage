// dependencies
const Event_Emitter = require('events');
const cp = require('child_process');
const Joi = require('joi')
const uuid_generator = require('uuid/v1');
const Base_Event = require('./base_event.js')

const default_query = `
    INSERT INTO events (type, version, payload)
    VALUES ({type}, {version}, {payload});
`;

const init_query = `
    select payload->>'timestamp' as ts
    from events
    where
        type = {type}
      and
        payload->>'commit' = {commit}
      and
        (payload->>'timestamp')::bigint = {timestamp}
      and
        payload->>'branch' = {branch};
`

// exports
module.exports = class Event_hub extends Event_Emitter {
    constructor ({db}) {
        super();

        this.db = db;
    }

    async add_event ({type, version, payload, responders, timeout, query = default_query, inserts, persist = true}) {
        inserts = inserts || { type, version, payload };

        // write to event_stream
        let results
        if (persist) {
            results = await this.db.execute(query, inserts);
        }

        const emit_obj = { type, version, payload };

        if (responders) {
            const {uuid, promise} = this.setup_response_channel({responders, timeout});

            results = promise;

            emit_obj.respond = {
                responders,
                uuid,
            };
        }

        // emit to listeners/translators
        this.emit(type, emit_obj);

        // returns result from the db call or a promise that will fulfill when responders respond
        return results;
    }

    setup_response_channel ({responders, timeout}) {
        const uuid = uuid_generator();

        let promise = new Promise((resolve, reject) => {
            // 
            this.on(uuid, this.new_response_listener({uuid, responders, timeout, resolve, reject}));
        });

        return {uuid, promise};
    }

    new_response_listener ({uuid, responders, timeout, resolve, reject}) {
        // TODO implement setTimeout that calls rej after timeout default
        const timeout_handler = setTimeout(() => {
            this.removeListener(uuid, listener);
            reject(new Error(`Responders ${responders.toString()} have timed out.`));
        }, timeout || 5000);

        // collect transform responses
        const responses = {};

        // listen for responses coming in
        const listener = ({responder_name, result}) => {
            responses[responder_name] = result;

            // once responded, remove from responders list
            var index = responders.indexOf(responder_name);
            if (index >= 0) responders.splice( index, 1 );

            if (!responders.length) {
                // clean up
                clearTimeout(timeout_handler);
                this.removeListener(uuid, listener);

                // return responses
                return resolve(responses);
            }
        };

        return listener;
    }

    create_responder ({uuid, responder_name}) {
        return (result) => {
            const response = { responder_name, result };
            this.emit(uuid, response);
        };
    }

    subscribe ({responder_name, event, handler}) {
        if (!event) {
            throw new Error('Event listener has been added without event: ', handler)
        }

        this.on(event, async (data) => {
            let frozen_data = Object.freeze(data);
            // if no response expected or if no responders specified or
            // if responders specified don't include the subscriber,
            // just send the data to the handler
            if (!data.respond || !data.respond.responders || !data.respond.responders.includes(responder_name)) {
                return await handler(frozen_data);
            }

            // if a response has been requested, pass the handler a function
            // to respond with
            const {uuid} = data.respond;
            let responder = this.create_responder({uuid, responder_name});

            try {
                return await handler(frozen_data, responder);
            } catch(e) {
                return responder({error: e});
            }
        });
    }

    async init () {
        const type = 'event_hub_init';
        const init_event = new Base_Event({
            version: 0,
            event_hub: this,
            event_name: type,
            schema: Joi.object().keys({
                branch: Joi.string().required(),
                commit: Joi.string().required(),
                timestamp: Joi.number().required(),
            })
        })

        let commit;
        let branch;

        try {
            commit = cp.execSync('git rev-parse HEAD').toString().trim()
            branch = cp.execSync(`git rev-parse --abbrev-ref HEAD`).toString().trim()
        } catch (err) {
            console.error("Error: not a git repository. Try running the app from the project root as working directory")
            commit = 'UNKNOWN';
            branch = 'UNKNOWN';
        }
        const timestamp = +new Date()

        const payload = { branch, commit, timestamp }

        await init_event.emit({ payload })

        payload.type = type

        let results = await this.db.execute(init_query, payload);

        if (+results.rows[0].ts === timestamp) {
            this.emit('event_hub_init_success')
        } else {
            this.emit('event_hub_init_failed')
        }
    }
};
