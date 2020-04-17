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

async function get_channel({user_id, slug}) {
    let channel = await db.return_one(`
        SELECT c.id, c.title, c.slug, c.timestamp, c.settings, cu.name AS username, array_agg(cux.name) as users 
        FROM channels c
        LEFT JOIN channel_users cu ON (cu.channel_id=c.id AND cu.user_id={user_id})
        LEFT JOIN channel_users cux ON (cux.channel_id=c.id)
        WHERE c.slug={slug}
        GROUP BY c.id, cu.name
    `, {slug, user_id});
    channel.rounds = await get_rounds({channel_id: channel.id});
    return channel;
}

async function get_rounds({channel_id}) {
    // available, pending and completed
    let result = await db.execute(`
        SELECT r.id, r.timestamp, r.status, r.settings, COUNT(r.id) as count, array_agg(u.handle) as users FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        JOIN users u on u.id = t.user_id
        WHERE r.channel_id={channel_id}
        GROUP BY r.id, r.timestamp
        ORDER BY r.timestamp DESC
    `, {channel_id});


    let last_posts = {};
    let last_posts_result = await db.execute(`
        SELECT DISTINCT ON(r.id) t.round_id, t.type, t.timestamp, cu.name AS username FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        LEFT JOIN channel_users cu ON (r.channel_id = cu.channel_id AND t.user_id = cu.user_id)
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

    result.rows.sort((a, b) => { 
        return a.last_turn && b.last_turn ? b.last_turn.timestamp - a.last_turn.timestamp : 0
    });
    return result.rows;
}

async function get_round({ round_id}) {
    // available, pending and completed
    // available, pending and completed
    let result = await db.execute(`
        SELECT r.id, r.timestamp, r.status, r.settings, COUNT(r.id) as count, array_agg(cu.name) as users FROM rounds r
        LEFT JOIN turns t ON r.id = t.round_id
        LEFT JOIN channel_users cu ON (r.channel_id = cu.channel_id AND t.user_id = cu.user_id)
        WHERE r.id={round_id}
        GROUP BY r.id, r.timestamp
        ORDER BY r.timestamp DESC
    `, {round_id});

    if(result.rows[0] && result.rows[0].status == "closed") {
        let all_posts_result = await db.execute(`
            SELECT t.round_id, t.type, t.contents, t.timestamp, cu.name AS username FROM rounds r
            LEFT JOIN turns t ON r.id = t.round_id
            LEFT JOIN channel_users cu ON (r.channel_id = cu.channel_id AND t.user_id = cu.user_id)
            WHERE r.id={round_id}
            ORDER BY r.id, t.timestamp ASC
        `, {round_id});

        let all_posts = all_posts_result.rows;
        result.rows.forEach((r) => {
            r.turns = all_posts;
        });
    } else {
        let last_posts = {};
        let last_posts_result = await db.execute(`
            SELECT DISTINCT ON(r.id) t.round_id, t.type, t.contents, t.timestamp, cu.name AS username FROM rounds r
            LEFT JOIN turns t ON r.id = t.round_id
            LEFT JOIN channel_users cu ON (r.channel_id = cu.channel_id AND t.user_id = cu.user_id)
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
