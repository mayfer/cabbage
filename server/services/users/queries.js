const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');
//const { User } = require('./models');

async function get_user({public_id}) {

    let user = await db.return_one(`SELECT * FROM users WHERE public_id={public_id}`, {public_id});

    return user;
}

module.exports = {
    get_user,
}

