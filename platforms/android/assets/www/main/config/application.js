// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log',
        'enum/AppEnum',
        'util/AppUtil',
        'util/ParseUtil',
        'util/LayoutUtil',
        'cache',
        'login/LoginPage',
        'content/ContentPage',
        'test/TestPage',
        'wizard/Wizard',
        "m/AppModel"],

function(log, AppEnum, AppUtil, ParseUtil, LayoutUtil, cache, LoginPage, ContentPage, testPage, wizard, AppModel)
{
    console.debug("app.js");

	function addListeners()
	{
		$(document).bind("deviceInfoChange",onDeviceInfoChange);
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged);
	}

	function initUtils()
	{
		ParseUtil.init();
		LayoutUtil.init();
	}

	function invokeStartup()
	{
		if(false)// TestPage
		{
			testPage.init();
			testPage.showPage();
		}
		else if(false)// WIZARD Page
		{
			wizard.init();
			// ( add by 15 21.05.2015
			//wizard.showPage();
			wizard.showPage(invokeLogin);
			// add by 15 21.05.2015 )
		}
		else
		{
			var email = cache.getValue(AppEnum.emailTxt);
			var password = cache.getValue(AppEnum.passwordTxt);


//            if(AppUtil.stringHasValue(email) && AppUtil.stringHasValue(password) && 1 == 2)  /*Login Everytime */

			// ( add by 15 21.05.2015
			//if(AppUtil.stringHasValue(email) && AppUtil.stringHasValue(password))  /*Only Login Once */
            //    LoginPage.invokeLogin(email, password, true);
			//else
			//	LoginPage.init();

			// node or NW
			if((typeof process !== "undefined" && process.versions && !!process.versions.node))
			{
				LoginPage.init((email != "undefined" ? email : ''), (password != "undefined" ? password : ''));
			}
			// android, ios and ets
			else
			{
				if(AppUtil.stringHasValue(email) && AppUtil.stringHasValue(password))  /*Only Login Once */
	                LoginPage.invokeLogin(email, password, true);
				else
					LoginPage.init();
			}
			// add by 15 21.05.2015 )
		}
	}

	// ( add by 15 21.05.2015
	function invokeLogin()
	{
		var email = cache.getValue(AppEnum.emailTxt);
		var password = cache.getValue(AppEnum.passwordTxt);

		// Only Login Once
		if(AppUtil.stringHasValue(email) && AppUtil.stringHasValue(password))
		{
			LoginPage.invokeLogin(email, password, true);
		}
		else
		{
			LoginPage.init();
		}
	}
	// add by 15 21.05.2015 )

	function onHeaderSelectionChanged()
	{
		if(AppModel.isLogout)
		{
			AppUtil.showLoader(true);
			ParseUtil.logout();
			setTimeout(function()
			{
				// ( add by 15 21.05.2015
				//location.reload();

				// node or NW
				if((typeof process !== "undefined" && process.versions && !!process.versions.node))
				{
					window.close();
				}
				// android, ios and ets
				else
				{
					location.reload();
				}
				// add by 15 21.05.2015 )
			}, 1000);
		}
	}

	function onDeviceInfoChange(e, info, infoText)
	{
		//alert(infoText);
	}

	var app =
	{
		initializeApplication : function()
		{
			addListeners();
			initUtils();
			invokeStartup();
		}
	};

	return app;
});