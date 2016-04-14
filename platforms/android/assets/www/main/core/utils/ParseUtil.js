if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['log', 
        'Parse', 
        'adptr/DeviceAdaptor',
        'cache',
        'enum/AppEnum', 
        "model", 
        "phonegap",
        'util/AppUtil'],
        
function(log, Parse, DeviceAdaptor, cache, AppEnum, model, phonegap, AppUtil)
{
	var parseUtil = {
	init: function() 
	{
		Parse.initialize(AppEnum.appId,AppEnum.jsId);//Parse.Initialize("applicationId","javascriptKey")
	},
	logout: function ()
	{
		cache.removeUser();
		Parse.User.logOut();		
	},
	login: function (email, pass, rememberMe, successHandler, errorHandler)
	{
		model.user_token = email;
		Parse.User.logIn(email, pass, 
		{
			success: function(user) 
			{				
				if(rememberMe)
					cache.addUser(email, pass);
								
				model.userEmail = email;
				if(phonegap && phonegap.deviceInfo)
					model.deviceId = phonegap.deviceInfo.uuid;
				successHandler(user);
			},
			error: function(user, error) 
			{				
				AppUtil.showLoader(false);
				errorHandler(user, error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
	},
	signUp: function (email, pass, successHandler, errorHandler)
	{
		var user = new Parse.User();
		user.set("username", email);
		user.set("password", pass);
		user.signUp(null, 
		{
		    success: function(user)
		    {
		    	successHandler(user);
		    	cache.addUser(user[AppEnum.emailTxt],user[AppEnum.passwordTxt]);
		    },
		    error: function(user, error)
		    {
		    	AppUtil.showLoader(false);
		    	errorHandler(user, error);
		    	alert("Error: " + error.code + " " + error.message);
		    }
	    });
	}};
	return parseUtil;
});