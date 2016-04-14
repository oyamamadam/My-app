if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['log'],
function(log)
{
	var deviceAdaptor = {
		inBrowser : false,
		deviceId: "520c8f8449b6294b" // set by phonegap
	};
	return deviceAdaptor;
});