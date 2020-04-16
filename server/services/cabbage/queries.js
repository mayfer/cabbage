const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');
//const { User } = require('./models');


async function get_user_channels({user_id}) {
    let {rows} = await db.execute(`
        SELECT c.* FROM channel_users cu
        JOIN channels c ON c.id=cu.channel_id
        WHERE cu.user_id={user_id}
    `, {user_id});
    return rows;
}

async function get_channel({slug}) {
    let channel = await db.return_one(`SELECT * FROM channels WHERE slug={slug}`, {slug});
    channel.rounds = await get_rounds({channel_id: channel.id});
    return channel;
}

async function get_rounds({channel_id}) {
    // available, pending and completed
    let result = await db.execute(`
        SELECT r.id, r.timestamp, r.status, COUNT(r.id) as count, array_agg(u.handle) as users FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        JOIN users u on u.id = t.user_id
        WHERE r.channel_id={channel_id}
        GROUP BY r.id, r.timestamp
        ORDER BY r.timestamp DESC
    `, {channel_id});

    let last_posts = {};
    let last_posts_result = await db.execute(`
        SELECT DISTINCT ON(r.id) t.round_id, t.type, t.timestamp, u.handle FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        JOIN users u on u.id = t.user_id
        WHERE r.channel_id={channel_id}
        ORDER BY r.id, t.timestamp DESC
    `, {channel_id});

    last_posts_result.rows.forEach((t) => {
        last_posts[t.round_id] = t;
    });
    result.rows.forEach((r) => {
        if(last_posts[r.id]) {
            r.last_turn = last_posts[r.id];
        }
    });
    return result.rows;
}

async function get_round({ round_id}) {
    // available, pending and completed
    // available, pending and completed
    let result = await db.execute(`
        SELECT r.id, r.timestamp, r.status, COUNT(r.id) as count, array_agg(u.handle) as users FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        JOIN users u on u.id = t.user_id
        WHERE r.id={round_id}
        GROUP BY r.id, r.timestamp
        ORDER BY r.timestamp DESC
    `, {round_id});

    if(result.rows[0] && result.rows[0].status == "closed") {
        let all_posts = {};
        let all_posts_result = await db.execute(`
            SELECT t.round_id, t.type, t.contents, t.timestamp, u.handle FROM rounds r
            LEFT JOIN turns t ON r.id = t.round_id
            JOIN users u on u.id = t.user_id
            WHERE r.id={round_id}
            ORDER BY r.id, t.timestamp DESC
        `, {round_id});

        all_posts_result.rows.forEach((t) => {
            all_posts[t.round_id] = t;
        });
        result.rows.forEach((r) => {
            if(all_posts[r.id]) {
                r.turns = all_posts[r.id];
            }
        });
    } else {
        let last_posts = {};
        let last_posts_result = await db.execute(`
            SELECT DISTINCT ON(r.id) t.round_id, t.type, t.contents, t.timestamp, u.handle FROM rounds r
            LEFT JOIN turns t ON r.id = t.round_id
            JOIN users u on u.id = t.user_id
            WHERE r.id={round_id}
            ORDER BY r.id, t.timestamp DESC
        `, {round_id});

        last_posts_result.rows.forEach((t) => {
            last_posts[t.round_id] = t;
        });
        result.rows.forEach((r) => {
            if(last_posts[r.id]) {
                r.last_turn = last_posts[r.id];
            }
        });

    }

    return result.rows[0];
}

module.exports = {
    get_channel,
    get_rounds,
    get_round,
    get_user_channels,
}
