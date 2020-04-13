
define(function(require, exports) {

	async function request({method='get', url, body=undefined}) {
		const rawResponse = await fetch(url, {
	        method: method.toUpperCase(),
	        headers: {
	            'Accept': 'application/json',
	            'Content-Type': 'application/json'
	        },
	        body: body ? JSON.stringify(body) : undefined,
	    });
	    const response = await rawResponse.json();
	    return response;
	}

	return {request};
});