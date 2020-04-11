
const rfr = require('rfr');
const credentials = rfr('/credentials.json');
const { argv } = require('yargs');
const Wrapper = require('./Wrapper');
const pg = require('pg');

// set global pg defaults
const { Pool } = pg;

pg.defaults.parseInt8 = true;
pg.defaults.poolSize = 15;


const master_pool = new Pool(credentials.postgres);
module.exports = new Wrapper(master_pool);

