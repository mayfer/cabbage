
define(function(require, exports) {

    const Navigo = require("core/navigo.min");
	const baseurl = (typeof location === 'undefined') ? '' : location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
	const Router = new Navigo(baseurl);


	return Router;
});