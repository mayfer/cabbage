
var argv = require('yargs').argv;

var env_path = argv.env ? argv.env : './.env';
if(argv.env) console.log("Using ENV file:", env_path);


var deployment = argv.deployment ? argv.deployment : 'DEV';

var ENV = require(env_path)[deployment];


module.exports = ENV;
