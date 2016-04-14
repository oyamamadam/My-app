// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log',
        'util/ParseUtil',
        'util/DateUtil',
        'enum/AppEnum',
		'adptr/DeviceAdaptor'],

function(log, ParseUtil, DateUtil, AppEnum, DeviceAdaptor)
{
	function logPost(type, payload)
	{
		var LogPost = Parse.Object.extend("LogPost");
		var logPost = new LogPost();

		logPost.set("type", type);
		logPost.set("payload", payload);
		logPost.save();
	}

	var so = {
		//SEARCH_URL: "search?query={1}&page={2}&per_page={3}",
		SEARCH_URL: "search?query={1}&page={2}&per_page={3}&filter=user_token:{4}",
		INDEX_URL: "index",

		search: function(keyword, page, pageSize, deviceID, userEmail, result, fault)
		{
			var url = AppEnum.API_URL + this.SEARCH_URL.replace("{1}",keyword).replace("{2}",page).replace("{3}",pageSize).replace("{4}",userEmail).replace("{5}",deviceID).replace("{6}",DateUtil.getTime());

			if(DeviceAdaptor.inBrowser)
				this.callXMLHTTP(url, result, fault);
			else
				this.callJsonp(url, result, fault);
		},

	    postJson: function(payload, result)
	    {
	    	var xmlhttp = new XMLHttpRequest();
			var url = AppEnum.API_URL + "index";
			xmlhttp.open("POST", url, true);
			xmlhttp.setRequestHeader("Content-type", "application/json");
			xmlhttp.onreadystatechange = function ()
			{
				if (xmlhttp.readyState == 4)
				{
					result(xmlhttp.responseText);
				}
			};

			payload = JSON.stringify(payload);
			// ( add by 15 21.05.2015
			logPost('postJson', payload);
			// add by 15 21.05.2015 )
			xmlhttp.send(payload);
	    },

            callXMLHTTP : function(url, result, fault)
            {
                console.log("IN BROWSER: searching using => callXMLHTTP");
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", url, true);
                xmlhttp.setRequestHeader("Content-type", "application/json");
                xmlhttp.onreadystatechange = function ()
                {
                    if (xmlhttp.readyState == 4)
                    {
						// ( add by 15 21.05.2015
						logPost('search', xmlhttp.responseText);
						// add by 15 21.05.2015 )
                        result(xmlhttp.responseText);
                    }
                };
                xmlhttp.send();
            },

		callJsonp: function (url, result, fault)
		{
			console.log("ServiceAdaptor::callJsonp > " + url);
			//logPost("Search", url);
			// Assign handlers immediately after making the request,
			// and remember the jqXHR object for this request
			$.ajax( url,
			{
				type: "GET",
                       		contentType: 'application/json',
				contentType: 'application/json',
				dataType: "jsonp",
				async: true,
	        	jsonpCallback: 'jsonpHandler',
	    		//jsonp: false,
	    		//cache: true,
	    		success: function (data) {
					console.log( "ServiceAdaptor::callJsonp > success");
					result(data);
		        },
	    		error: function (jqXHR, textStatus, error) {
		    		console.log( "ServiceAdaptor::callJsonp > error: " + error);
		    		fault(error);
		        }
			});
		}
	};
	return so;
});