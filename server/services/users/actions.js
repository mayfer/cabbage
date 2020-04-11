const rfr = require('rfr');

const { db } = rfr('/server/connections');
const common = rfr('/client/lib/common');
//const { User } = require('./models');

async function create_anon_user({anon_score, ip, request_headers}) {
    let props = {anon_score, ip, request_headers}
    let uuid = function(length){
        var d = common.now();
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.slice(0,length).replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    let public_id = uuid(8);

    while(await db.return_one(`SELECT * FROM users WHERE public_id={public_id}`, {public_id})) {
        public_id = uuid(8);
    }

    let res = await db.execute(`
        INSERT INTO users
        (public_id, props)
        VALUES
        ({public_id}, {props})
        RETURNING *
    `, {public_id, props});

    return res.rows[0];
}

module.exports = {
    create_anon_user,
}
