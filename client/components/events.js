
define(function(require, exports) {

	const events = {
		on: function(eventname, callback) {
			return window.addEventListener(eventname, callback);
		},
		emit: function(eventname, eventdata) {
			let e = new CustomEvent(eventname, { detail: eventdata });
			window.dispatchEvent(e);
			console.log("event", eventname, eventdata);
		},
	}


	return events;
});
