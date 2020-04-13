
define(function(require, exports) {

    const Navigo = require("core/navigo.min");
	const baseurl = (typeof location === 'undefined') ? '' : location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
	const Router = new Navigo(baseurl);

	Router.hijack = function(e) {
		const href = e.target.closest('a').getAttribute("href");
		if(href) {
			e.preventDefault();
			Router.navigate(href);
		}
	}

	return Router;
});