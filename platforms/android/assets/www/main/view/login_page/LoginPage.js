// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(["ich", 
        "text!login/LoginPage.html", 
        "css!login/LoginPage",
        'util/IchUtil',
        'login/LoginHelper'],
        
function(ich, loginHTML, loginCSS, IchUtil, LoginHelper)
{
       
	var loginPage = 
	{
       
		// ( add by 15 21.05.2015
		//init:function()
		//{
		//	IchUtil.applyIchTemplate('loginHTML', loginHTML, $('#loginPage'));
		//	LoginHelper.init();
		//},
		init:function(email, pass)
		{
			IchUtil.applyIchTemplate('loginHTML', loginHTML, $('#loginPage'));
			LoginHelper.init();

			if((typeof process !== "undefined" && process.versions && !!process.versions.node))
			{
				if(email) $('#emailInpt').val(email);
				if(pass) $('#passInpt').val(pass);
				$('#rmbrCheck').hide();
			}
		},
		// add by 15 21.05.2015 )
		invokeLogin: function(email, pass, rememberMe)
		{
			LoginHelper.invokeLogin(email, pass, rememberMe);
		}
	};
	return loginPage;
});