const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');

const queries = require('./queries');

async function create_channel({title, slug, user_id, settings={}}) {    
    let existing = await db.return_one(`SELECT * FROM channels WHERE slug={slug}`, {slug});
    if(existing) {
        throw "A channel with this slug already exists";
    } else {

        let res = await db.execute(`
            INSERT INTO channels
            (title, slug, user_id, timestamp, settings)
            VALUES
            ({title}, {slug}, {user_id}, {timestamp}, {settings})
            RETURNING *
        `, {title, slug, user_id, timestamp: Date.now(), settings: {}});

        return res.rows[0];
    }
}


async function add_user_to_channel({user_id, slug }) {
    let channel = await queries.get_channel({slug});

    let res = await db.execute(`
        INSERT INTO channel_users
        (channel_id, user_id, timestamp)
        VALUES
        ({channel_id}, {user_id}, {timestamp})
        ON CONFLICT DO NOTHING
        RETURNING *
    `, {channel_id: channel.id, user_id, timestamp: Date.now()});

    return res.rows[0];


}

async function create_new_turn({round_id, user_id, previous_turn_id, type, contents }) {
    let res = await db.execute(`
        INSERT INTO turns
        (round_id, user_id, previous_turn_id, timestamp, type, contents)
        VALUES
        ({round_id}, {user_id}, {previous_turn_id}, {timestamp}, {type}, {contents})
        RETURNING *
    `, {round_id, user_id, previous_turn_id, timestamp: Date.now(), type, contents});

    return res.rows[0];
    // if all members submitted finish round

    return {round, turn};

}

async function start_new_round({channel_id, user_id, settings={} }) {
    let res = await db.execute(`
        INSERT INTO rounds
        (channel_id, user_id, timestamp, settings)
        VALUES
        ({channel_id}, {user_id}, {timestamp}, {settings})
        RETURNING *
    `, {channel_id, user_id, timestamp: Date.now(), settings});

    const round = res.rows[0];

    return round;
}

async function set_user_email({user_id, email}) {
    let res = await db.execute(`
        UPDATE users
        SET email={email}
        WHERE id={user_id}
    `, {email, user_id});
}

module.exports = {
    create_channel,
    add_user_to_channel,
    create_new_turn,
    start_new_round,
    set_user_email,
}
