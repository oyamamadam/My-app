if (typeof define !== 'function') { var define = require('amdefine')(module) }

define({
	addValue: function(key, value)
	{
		$.cookie(key, value);
	},
	getValue: function(key)
	{
		return $.cookie(key);
	},
	removeUser: function()
	{
		$.removeCookie("email");
		$.removeCookie("password");
	},
	addUser: function(email, password)
	{
		$.cookie("email", email);
		$.cookie("password", password);
	},
	addKeyValue:function(key, value)
	{
		$.cookie(key, value);
	}	
});