// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(["ich",
        'util/AppUtil',
        'util/ParseUtil',
        'content/ContentPage',
        'wizard/Wizard',
        'model'],

function(ich, AppUtil, ParseUtil, ContentPage, wizard, model)
{
	var loginHelper = {};

	function addListeners()
	{
		$(".inptCls").focus(onInputFocusIn);
		AppUtil.addTouchEvent('#loginPage .checkBox', onCheckClick);
		AppUtil.addTouchEvent('#loginPage .toggleReset', onToggleReset);
		AppUtil.addTouchEvent('#loginPage .toggleCreate', onToggleCreate);
		AppUtil.addTouchEvent('#loginPage .toggleTerms', onToggleTerms);
		AppUtil.addTouchEvent('#loginPage #loginBtn', onLoginClick);
		AppUtil.addTouchEvent('#loginPage #createBtn', onSignUpClick);
		AppUtil.addSubmitEvent('#loginPage form#loginForm', onLoginClick);
		AppUtil.addSubmitEvent('#loginPage form#signupForm', onSignUpClick);

	}

	function onInputFocusIn(evt)
	{
		$('.inptDiv').removeClass("inputDivFocused");
		$(this.parentNode).addClass("inputDivFocused");
	}

	function onCheckClick()
	{
		var $check = $(".checkIcon", this);
		var checkV = $check.css('visibility');

		if(checkV == 'visible') $check.css('visibility', 'hidden'); else $check.css('visibility', 'visible');
	}

	function onToggleReset()
	{
		$('#loginBody').slideToggle();
		$('#resetBody').slideToggle();
	}

	function onToggleCreate()
	{
		$('#loginBody').slideToggle();
		$('#newBody').slideToggle();
	}

	function onToggleTerms()
	{
		$('#termsBody').slideToggle();
		$('#newBody').slideToggle();
	}

	function isChecked(checkId)
	{
		var parentDesc = "#loginPage #" + checkId;
		var $check = $(".checkIcon", parentDesc);
		var checkV = $check.css('visibility');

		return(checkV == 'visible');
	}

	// BW added 140926
	function validateEmail(email)
	{
		//var re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/;
		var re = /\S+@\S+\.\S+/;
		return re.test(email);

		/* save in case
		var lastAtPos = str.lastIndexOf('@');
		var lastDotPos = str.lastIndexOf('.');
		return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
		*/
	}

	function onLoginClick()
	{
		var email = $("#emailInpt", "#loginPage").val();
		var password = $("#passInpt", "#loginPage").val();
		var rememberMe = isChecked("rmbrCheck");

		// BW added 140926
		var emailValid = validateEmail(email);
		//console.log("emailValid: " + emailValid);

		if(emailValid == false)
		{
			alert("Please make sure you he a valid email address.");
			return;
		}
		hideKeyboard();
		loginHelper.invokeLogin(email, password, rememberMe);
	}

	// ( add by 15 21.05.2015
	/*
	function loginSuccessHandler(user)
	{
		ContentPage.init();
	}
	*/

	function loginSuccessHandler(user)
	{
		$('#loginPage').hide();
		// for debug wizard
		//AppUtil.showLoader(false);
		//wizard.init();
		//wizard.showPage(invokeContentPageInit);
		ContentPage.init();
	}

	function invokeContentPageInit()
	{
		//AppUtil.showLoader(true);
		ContentPage.init();
	}
	// add by 15 21.05.2015 )

	function loginErrorHandler(user, error)
	{
		alert("loginErrorHandler");
        //navigator.notification.alert('loginErrorHandler',null,'Gurardar éxito','Ok');
	}

	function onSignUpComplete()
	{
		var email = $("#newEmailInpt", "#loginPage").val();
		var password = $("#newPassInpt", "#loginPage").val();
		//console.log("SIGNING IN WITH: email: " + email + ", password: " + password);

		model.indexingNeeded = true;
		loginHelper.invokeLogin(email, password, false);
	}

	function hideKeyboard()
	{
		document.activeElement.blur();
		$("input", "#loginBody").blur();
	}

	function onSignUpClick()
	{
		var email = $("#newEmailInpt", "#loginPage").val();
		//var reEmail = $("#reEmailInpt", "#loginPage").val();
		var password = $("#newPassInpt", "#loginPage").val();
		var repassword = $("#rePassInpt", "#loginPage").val();
		var agreed = isChecked("termsCheck");

		hideKeyboard();

		if(email.length < 5 || password.length < 5)
		{
			alert("Please make sure that your user name or password is at least 5 characters long.");
			return;
		}

		/*
		if(email != reEmail)
		{
			alert("Please make sure that user name matches.");
			return;
		}
		*/

		// BW added 140926
		if(email.length >= 5)
		{
			var emailValid = validateEmail(email);
			//console.log("emailValid: " + emailValid);

			if(emailValid == false)
			{
				alert("Please make sure you he a valid email address.");
				return;
			}
		}

		if(password.length > 5 && password != repassword)
		{
			alert("Please make sure that your password matches.");
			return;
		}

		if(agreed)
		{
			AppUtil.showLoader(true);
			ParseUtil.signUp(email, password, onSignUpComplete, loginErrorHandler);
		}
		else
		{
			alert("Agree to terms first! Make sure that password is at least 5 characters long.");
		}
	}

	loginHelper =
	{
		init: function()
		{
			addListeners();
			$('#loginPage').show();
		},

		invokeLogin: function(email, pass, rememberMe)
		{
			console.log("test message in loginhelper.js");
			AppUtil.showLoader(true);
			ParseUtil.login(email, pass, rememberMe, loginSuccessHandler, loginErrorHandler);
		}
	};
	return loginHelper;
});