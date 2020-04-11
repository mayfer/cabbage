const Joi = require('joi');

module.exports = class Base_Event {
    constructor({ event_name, version = 0, schema, default_responders = [], event_hub, persist = true}) {
        if (!event_hub || (!version && version !== 0) || !schema || !event_name) {
            throw new Error(`Cashorbit_Event ${this.event_name || ''} requires conns, vote_type, version, event_name.`);
        }

        this.version = version
        this.event_name = event_name
        this.schema = schema
        this.default_responders = default_responders
        this.event_hub = event_hub
        this.persist = persist
    }

    validate(payload) {
        const { error } = Joi.validate(payload, this.schema);
        if (error) {
            console.error(`${this.event_name} event validation error: `, error);
            throw error;
        }
    }

    async emit({payload, responders}) {
        this.validate(payload)

        return this.event_hub.add_event({
            type: this.event_name,
            version: this.version,
            payload,
            responders,
            timeout: 2000,
        });
    }

    // only use this if you need a response/confirmation back from the evet
    async emit_and_respond({ payload, responders }) {
        if(!responders || responders.length == 0) {
            // clone because responders are popped off
            responders = this.default_responders.slice(0);
        }

        return await this.emit({ payload, responders })
    }
}
