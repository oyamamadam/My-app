if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['log', 'util/DateUtil', 'util/TextUtil', 'enum/AppEnum', 'adptr/DeviceAdaptor'],
function(log, DateUtil, TextUtil, AppEnum, DeviceAdaptor)
{	
	//var counter = 5;
	
	function setAlphabetically(item)
	{
		var n = (item.children) ? item.children.length : 0;
		var objs = {};
		for(var i = 0; i < n; i++)
		{
			var childNode = item.children[i];
			var char = childNode.term[0].toUpperCase();
			var objItem = objs[char];
			var c = childNode.count;
			if(objItem)
			{
				objItem.children.push(childNode);
				objItem.count += c;
			}
			else
			{
				objItem = {label: char, count: c, children: [childNode]};
				objs[char] = objItem;
			}
		}
		var list = [];
		for (var property in objs) 
		{
		    list.push(objs[property]);
		}
		list.sort(TextUtil.sortRefinerItems);
		item.nodes = list;
	}

	function setOnDate(item, results) // added by Alex on 9 Feb
	{
		var objs = {};
		var n = (item.children) ? item.children.length : 0;
		for(var i = 0; i < n; i++) // loop though each ['facets'][4]['events']['term'] as years
		{
			var j_years = item.children[i];
			var nn = (j_years.children) ? j_years.children.length : 0;
			for(var ii = 0; ii < nn; ii++) // loop though each ['facets'][4]['events']['children']['term'] as months
			{
				var j_months = j_years.children[ii]; // format is "2009_JUL"
				strMonth = j_months.term.split('_');
				var char = strMonth[1]+ ' '+ strMonth[0].substring(2,4); // reformat as "JUL 09"
				var objItem = objs[char];
				var c = j_months.count;

				if(objItem)
				{
					objItem.children.push(j_months);
					objItem.count += c;
				}
				else
				{
					//objItem = {label: char, count: c, children: [j_months]};
					objItem = {label: char, count: c, children: []}; // don't insert any children until actual events are counted
					objs[char] = objItem;
				}

				var nnn = (j_months.children) ? j_months.children.length : 0;
				for(var iii = 0; iii < nnn; iii++) // loop though each ['facets'][4]['events']['children']['children']['term'] as events
				{
					var j_events = j_months.children[iii];
					if(j_events.term.indexOf(j_months.term) === -1) // don't show every date in month view, only events
					{
						if(objItem)
						{
							objItem.children.push(j_events);
							objItem.count += c;
						}
						else
						{
							objItem = {label: char, count: c, children: [j_events]};
							objs[char] = objItem;
						}
					}
				}
			}	
		}
		
		var list = [];
		for (var property in objs) 
		{
		    list.push(objs[property]);
		}
		//list.sort(TextUtil.sortRefinerItems);
		list.reverse();
		item.nodes = list;
		
	}
	
	function getRootNode(key, keywords)
	{
		var n = keywords.length;
		var item = {term: key, children: [], count: 0};
		for(var i = 0; i < n; i++)
		{
			item = keywords[i];
			if(item.term.toUpperCase() == key.toUpperCase())
				break;
		}
		return item;
	}
	
	function getRefinerItem(key, item, results)
	{
		if(key == AppEnum.events)
			setOnDate(item, results);
		else
			setAlphabetically(item);
		return item;
	}
	
	var modelUtil = {
		getRefinerData:function(keywords, results)
		{
			var refinerData = {};
			var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities];
			
			for(var i = 0; i < sets.length; i++)
			{
				var key = sets[i];
				var rootNode = getRootNode(key, keywords);
				refinerData[key] = getRefinerItem(key, rootNode, results);
			}
			return refinerData;
		},
		getResultsByKeywords: function(rawResults, userToken)
		{
			var results = {};
			var n = (rawResults) ? rawResults.length : 0;
			var currnetUser = userToken.toUpperCase();
			for(var i = 0; i < n; i++)
			{
				var item = rawResults[i];
				var itemUserToken = item.user_token;
				
				if(!itemUserToken || itemUserToken.toUpperCase() != currnetUser)
					continue;
				
				var keywordPairs = item.keyword_pairs;
				var m = (keywordPairs) ? keywordPairs.length : 0;
				for(var j = 0; j < m; j++)
				{
					var keywordPair = keywordPairs[j].split(":");
					var kType = keywordPair[0].toLowerCase();
					var keyword = keywordPair[1];
					var typeObj = results[kType];
					if(typeObj == undefined)
					{
						typeObj = {type: kType, keywords: {}, count: 1};
						results[kType] = typeObj;
					}	
					else
					{
						typeObj.count++;
					}
					var keywordObj = typeObj.keywords[keyword];
					if(keywordObj == undefined)
					{
						keywordObj = {keyword: keyword, nodes: [item], count: 1, type:kType};
						typeObj.keywords[keyword] = keywordObj;
					}
					else
					{
						keywordObj.count++;
						keywordObj.nodes.push(item);
					}
				}	
			}
			return results;
		},
		getKeywords: function (rootCats)
		{
			var keywords = {};
			for (var property in rootCats) 
			{
			    var obj = rootCats[property];
			    var children = obj.children;
			    var n = children.length;
			    for(var i = 0; i < n; i++)
			    {
			    	var child = children[i];
			    	if(child)
			    	{
			    		var keyword = (child.term) ? child.term.toLowerCase() : null;
			    		if(keyword)
			    			keywords[keyword] = child;
			    	}
			    }
			}
			return keywords;
		},
		getTypedKeywords: function (rootCats)
		{
			var keywords = {};
			for (var property in rootCats) 
			{
				var obj = rootCats[property];
				var children = obj.children;
				var n = children.length;
				var keys = {};
				for(var i = 0; i < n; i++)
				{
					var child = children[i];
					if(child)
					{
						var keyword = (child.term) ? child.term.toLowerCase() : null;
						if(keyword)
							keys[keyword] = child;
					}
				}
				keywords[property] = keys;
			}
			return keywords;
		},
		getIndexObject: function(deviceId, email, allFilesAry)
		{
			var n = (allFilesAry) ? allFilesAry.length : 0;
			var documents = [];
			var file = {};
			
			for(var i = 0; i < n; i++)
			{			
				file = allFilesAry[i];
				if(file)
					documents.push(file.getJSONObj());
			}
			var nn = documents.length;
			//alert("NUMBER OF PICTURES TO BE INDEXED: " + nn);
			var iObj = {};
			iObj["UserToken"] = email;
			iObj["DeviceId"] = deviceId;
			iObj["Documents"] = documents;

			// test by 15
			console.log("ModelUtil::getIndexObject allFilesAry.length: " + allFilesAry.length);
			console.log("ModelUtil::getIndexObject documents.length: " + documents.length);
			return iObj;
		},
		getIndexObj : function(deviceId, email, allFilesAry)
		{
			var n = (allFilesAry) ? allFilesAry.length : 0;
			var documents = [];
			var item = {};
			
			for(var i = 0; i < n; i++)
			{			
				item = allFilesAry[i];
				if(item)
					documents.push(modelUtil.getJSONObj(item));
			}
			var iObj = {};
			iObj["UserToken"] = email;
			iObj["DeviceId"] = deviceId;
			iObj["Documents"] = documents;

			// test by 15
			console.log("ModelUtil::getIndexObject allFilesAry.length: " + allFilesAry.length);
			console.log("ModelUtil::getIndexObject documents.length: " + documents.length);
			return iObj;
		},
		getJSONObj : function(item)
		{
			//counter--;
			//if(counter > 0)
			//{
			//	log.i(item);
			//	console.log("________________________");
			//}	
			
			var kys = (item.iptc_Keywords) ? item.iptc_Keywords : [];
			var newKeys = [];
			if(!kys || kys.length == 0)
			{
				console.log("NO KEYWORDS for file: " + item.url);				
			}
			else// lets make sure its all TYPE:KEYWORD
			{
				var n = kys.length;
				for(var i = 0; i < n; i++)
				{
					var key = kys[i];
					if(key.indexOf(':') < 0)
					{
						continue; // discard
					}	
					else if(key.toUpperCase().indexOf('PLACES') > -1)
					{
						key = TextUtil.searchAndReplaceNoCase(key, 'places', 'locations');
					}	
					//Make sure it has correct casing:
					var pair = key.split(':');
					var typeStr = TextUtil.capitaliseFirstLetter(pair[0]);
					newKeys.push(typeStr + ':' + pair[1]);	
				}	
			}	
			
			newKeys.push("APPDATA:WIDTH|" + item.width);
			newKeys.push("APPDATA:HEIGHT|" + item.height);
							
			var exifDateTimeOriginal = DateUtil.getDateString2(item.exif_DateTimeOriginal);
			var xmpCreateDate = item.xmpCreateDate;
			var exifDateTimeDigitized = DateUtil.getDateString2(item.exif_DateTimeDigitized);
			var exifDateTime =  DateUtil.getDateString2(item.exifDateTime);
			
			//console.log("exifDateTimeOriginal: " + exifDateTimeOriginal);
			//console.log("xmpCreateDate: " + xmpCreateDate);
			//console.log("exifDateTimeDigitized: " + exifDateTimeDigitized);
			//console.log("exifDateTime: " + exifDateTime);
			//console.log("INDEXING KEYWORDS: " + newKeys);
			//console.log(this.path);
			//console.log('');
							
			var picIndexDateString = exifDateTimeOriginal;
			
			if(DateUtil.isValidCreationDate(picIndexDateString) == false)
				picIndexDateString = xmpCreateDate;
							
			if(DateUtil.isValidCreationDate(picIndexDateString) == false)
				picIndexDateString = exifDateTimeDigitized;

			if(DateUtil.isValidCreationDate(picIndexDateString) == false)
				picIndexDateString = exifDateTime;

			// ( add by 15 21.05.2015
			if(DateUtil.isValidCreationDate(picIndexDateString) == false) 
			{
				picIndexDateString = item.exif_DateTimeOriginal = 
					item.xmpCreateDate = item.exif_DateTimeDigitized = 
					item.exifDateTime = picIndexDateString = item.ctime.toISOString();
			}

			if(DateUtil.isValidCreationDate(picIndexDateString) == false) 
			{
				picIndexDateString = item.exif_DateTimeOriginal = 
					item.xmpCreateDate = item.exif_DateTimeDigitized = 
					item.exifDateTime = picIndexDateString = item.mtime.toISOString();
			}
			// add by 15 21.05.2015 )

			if(DateUtil.isValidCreationDate(picIndexDateString) == false) // default it to 
				picIndexDateString = DateUtil.getDateString(new Date());
										
            //console.log("picIndexDateString 3: " + picIndexDateString);

       
			var sObj = {"SourceFile" : item.url, 
						"CreateDate" : picIndexDateString,
						"Keywords" : newKeys};			
			
			if(item.gps_Latitude)
			{
				sObj["GPSPosition"] = modelUtil.getGPSValue(item);				
			}	
			return sObj;
		},
		
		getGPSValue: function(item)
		{
			var gps_Latitude = item.gps_Latitude; //"33.46175";
    		var gps_Longitude = item.gps_Longitude; //"-111.9454889";
    		var gps_LatitudeRef = item.gps_LatitudeRef; // LatitudeRef = S or N
    		var gps_LongitudeRef = item.gps_LongitudeRef; // LongitudeRef = W
    		
			// ( add by 15 21.05.2015
    		//var latitudeSign = (gps_LatitudeRef == 'S') ? "-" : "";
    		//var longitudeSign = (gps_LongitudeRef == 'W') ? "-" : "";
			
			var latitudeSign, longitudeSign;
			
			// node or NW
			if((typeof process !== 'undefined' && process.versions && !!process.versions.node))
			{
				latitudeSign = (gps_LatitudeRef == 'S' && (typeof gps_Latitude === 'number' && gps_Latitude > 0)) ? '-' : '';
				longitudeSign = (gps_LongitudeRef == 'W' && (typeof gps_Longitude === 'number' && gps_Longitude > 0)) ? '-' : '';
			}
			// android, ios and ets
			else
			{
				latitudeSign = (gps_LatitudeRef == 'S') ? '-' : '';
				longitudeSign = (gps_LongitudeRef == 'W') ? '-' : '';
			}
			// add by 15 21.05.2015 )
			
			var gpsTxt = latitudeSign + item.gps_Latitude + "," + longitudeSign + item.gps_Longitude;
			//console.log(gpsTxt);
			return gpsTxt;
		}
	};	
	return modelUtil;
});