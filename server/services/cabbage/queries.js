const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');
//const { User } = require('./models');


async function get_channel({slug}) {
    let channel = await db.return_one(`SELECT * FROM channels WHERE slug={slug}`, {slug});
    return channel;
}

async function get_rounds({user, slug}) {
    // available, pending and completed
    let result = await db.execute(`SELECT * FROM rounds r JOIN channels c WHERE r.channel_id=c.id AND c.slug={slug}`, {slug});
    return result.rows;
}

async function get_round({user, round_id}) {
    // available, pending and completed
    //let result = await db.execute(`SELECT * FROM rounds r JOIN channels c WHERE r.channel_id=c.id AND c.slug={slug}`, {slug});
    return result.rows;
}

module.exports = {
    get_channel,
    get_rounds,
    get_round,
}
