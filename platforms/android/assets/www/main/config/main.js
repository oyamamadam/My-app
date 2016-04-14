// ( add by 15 21.05.2015
var requirejs = (typeof global === 'undefined' ? require : require('requirejs'));
//if(typeof global === 'undefined') requirejs = require;
//var requirejs = require('requirejs');

if(typeof global !== 'undefined')
{
	global.$ = window.$;
	global.alert = window.alert;
	global.document = window.document;
	//global.exports = module.exports;
	global.jQuery = window.jQuery;
	global.navigator = window.navigator;
	global.XMLHttpRequest = window.XMLHttpRequest;
}
// add by 15 21.05.2015 )

requirejs.config({
	nodeRequire: require,
	baseUrl: '',
	paths: {
	    "jquery"		: "external/jquery-2.0.3.min",
        "hammerTime"    : "external/hammer.min",
		"mEvents"		: "external/jquery.mobile-events.min",	
		"jGestures"		: "external/jGestures",	
		"Parse"			: "external/parse-1.2.13",	
		"iScroll5"		: "external/iscroll",	
		"ich"			: "external/ICanHaz",	
		"text"			: "external/text",
		"css"			: "external/css",
		"exif"			: "external/exif",
		"appCSS"		: "assets/css",					
		"app"			: "main/config/application",
		"cls"			: "main/config/cls",
		"model"			: "main/model/Model",
		"m"				: "main/model",
		"util"			: "main/core/utils",
		"enum"			: "main/core/enums",
		"phonegap"		: "main/core/phonegap/phonegap2",
		"photodb"		: "main/core/phonegap/photo-db",
		"scanDroid"		: "main/core/phonegap/scan-droid",  // scan-droid, scan-ios
		"scanIOS"		: "main/core/phonegap/scan-ios2",    // scan-droid, scan-ios
		"exif"			: "main/core/phonegap/exif-reader",
		"log"			: "main/core/utils/LogUtil",
		"adptr"			: "main/core/adaptors",
		"cache"			: "main/core/adaptors/CacheAdaptor-db",  // CacheAdaptor-cookies, CacheAdaptor-db
		"login"			: "main/view/login_page",
		"fs"			: "main/view/full_screen",
		"sync"			: "main/view/sync",
		"wizard"		: "main/view/wizard",
		"typeselection"	: "main/view/type_selection",
		"share"			: "main/view/share_popup",
		"test"			: "main/view/test",
		"content"		: "main/view/content_page",
		"header"		: "main/view/content_page/header",
		"mainPane"		: "main/view/content_page/main_pane",
		"fav"			: "main/view/content_page/fav",
		"bin"			: "main/view/content_page/bin",
		"tile"			: "main/view/content_page/tile",
		"setting"		: "main/view/content_page/setting"
	},
	shim:  {
		"app"   			: ["jquery", "Parse"],	
		"mEvents"			: ["jquery"],
		"jGestures"			: ["jquery"],
		//"iScroll5" 			: {exports: "IScroll"},
        "hammerTime" 		: {exports: "Hammer"},
		"ich" 				: {exports: "ich"},
		"Parse" 			: {exports: "Parse"},
		"main/model/Class"	: {exports: "Class"}
	}//,
	//urlArgs: "bust=" +  (new Date()).getTime()
});

requirejs(['text','css','css!appCSS/normalize','css!appCSS/global','css!appCSS/scrollbar', 'css!appCSS/font-awesome',
         'app','phonegap', 'iScroll5', 'adptr/DeviceAdaptor', 'util/AppUtil', 'hammerTime', "mEvents", "jGestures"],
         
function (txt,css,norm,glbl, scrollbarCSS, fa, app, phonegap, iScroll5, DeviceAdaptor, AppUtil, hammerTime, mEvents, jGestures)
{	
	console.log("phonegap Start");
	var retryCount = 6;
	phonegap.initialize();
	$(document).ready(onReady);
	$.support.cors = true;	
	AppUtil.showLoader(true);
	
	function onReady()
	{
		//START APP
        //alert("This is in dev. ");
		if(DeviceAdaptor.inBrowser)	
		{
			console.log("APPLICATION IS RUNNING IN A BROWSER!");
			setTimeout(function()
			{
                AppUtil.showLoader(false);
				app.initializeApplication();
			}, 1000);
		}	
		else if(phonegap.deviceInfo == undefined)
		{
			retry();
		}	
		else // device is ready
		{
			if(phonegap.isAndroid())
			{
				console.log("Application is READY, running on Android.");
			}	
			else if(phonegap.isIOS())
			{
				console.log("Application is READY, running on IOS.");
			}	
			else
			{
				//retry();
				//return;
				console.log("Application is READY, running on X.Z.");

			}
			console.log("initializeApplication");
			setTimeout(function()
			{
				console.log("STARTING APPLICATION........................");
				AppUtil.showLoader(false);
				app.initializeApplication();
			}, 500);
		}			
	}
	
	function retry()
	{
		console.log("APPLICATION Not READY YET. WAITING FOR DEVICE READY");
		if(retryCount > 0)
		{
			setTimeout(function()
			{
				retryCount--;
				onReady();
			}, 500);
		}	
	}
});