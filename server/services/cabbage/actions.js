const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');

const queries = require('./queries');

async function create_channel({title, slug, settings={}}) {
    let props = {anon_score, ip, request_headers}
    
    let existing = await db.return_one(`SELECT * FROM channels WHERE slug={slug}`, {slug});
    if(existing) {
        throw "A channel with this slug already exists";
    } else {

        let res = await db.execute(`
            INSERT INTO channels
            (title, slug, timestamp, settings)
            VALUES
            ({title}, {slug}, {timestamp}, {settings})
            RETURNING *
        `, {title, slug, timestamp: Date.now(), settings});

        return res.rows[0];
    }
}


async function add_user_to_channel({user, slug }) {
    let res = await db.execute(`
        INSERT INTO channel_users
        (channel_id, user_id, timestamp)
        VALUES
        ({channel_id}, {user_id}, {timestamp})
        RETURNING *
    `, {channel_id, user_id, timestamp: Date.now()});

    return res.rows[0];


}

async function create_new_turn({user, slug, round_id, previous_turn_id, }) {

    let res = await db.execute(`
        INSERT INTO turns
        (round_id, user_id, previous_turn_id, timestamp)
        VALUES
        ({round_id}, {user_id}, {previous_turn_id}, {timestamp})
        RETURNING *
    `, {round_id, user_id, previous_turn_id, timestamp: Date.now()});

    return res.rows[0];
    // if all members submitted finish round

    return {round, turn};

}

async function start_new_round({user, slug, settings={} }) {
    let res = await db.execute(`
        INSERT INTO rounds
        (channel_id, user_id, timestamp, settings, status)
        VALUES
        ({title}, {slug}, {timestamp}, {settings})
        RETURNING *
    `, {title, slug, timestamp: Date.now(), settings});

    const round = res.rows[0];

    return round;
}

module.exports = {
    create_channel,
    add_user_to_channel,
    create_new_turn,
    start_new_round,
}
