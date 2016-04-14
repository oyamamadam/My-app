if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['log', 'enum/AppEnum'],
function(log, AppEnum)
{
	var textUtil = {
		searchAndReplaceNoCase: function (str, searchvalue, replace)
		{
			var re = new RegExp(searchvalue,"gi");
			return str.replace(re, replace);
		},
		getRandomNum: function (start, end)
		{
			return Math.floor((Math.random() * end) + start);
		},
		getReplaceTxt: function (str, searchvalue)
		{
			var re = new RegExp(searchvalue,"gi");
			return re.exec(str);
		},
		searchAndReplace: function (str, searchvalue, replace) //"2013:11:03 12:35:22-05:00"
		{
			var re = new RegExp(searchvalue,"g");
			while(str.indexOf(searchvalue) > -1)
			{
				str = str.replace(re, replace);
			}
			return str;
		},
		singleSearchAndReplace: function (str, searchvalue, replace)
		{
			var re = new RegExp(searchvalue,"g");
			str = str.replace(re, replace);
			return str;
		},
		stringHasValue : function(str)
		{
			return (str && str.length > 0);
		},
		hasString : function(searchInStr, searchForStr)
		{
			if(textUtil.stringHasValue(searchInStr) && textUtil.stringHasValue(searchForStr))
			{
				var lcSearchInStr = searchInStr.toLowerCase();
				var lcSearchForStr = searchForStr.toLowerCase();
				if(lcSearchInStr.indexOf(lcSearchForStr) > -1)
					return true;
			}
			return false;
		},
		sortRefinerItems: function(itemA, itemB)
		{
			var a = itemA.label;
			var b = itemB.label;

			return (a > b) ? -1 : 1;
		},
		sortByString: function(itemA, itemB)
		{
			// ( add by 15 21.05.2015
			// coomment, because it`s server errror (possible) and hendled at modelassist.js
			// code may be deleted
			//// label may be 'undefined' on mac or on unknown sets of photos
			////if(itemB.label == 'undefined')
			////{
			////	if(itemA.label == 'undefined') return 0;
			////	return -1;
			////}
			////if(itemA.label == 'undefined') return 1;
			// add by 15 21.05.2015 )

			var a = itemA.label.toLowerCase();
			var b = itemB.label.toLowerCase();

			return (a < b) ? -1 : 1;
		},
		sortStackByTime: function(itemStackA, itemStackB)
		{
			var a = itemStackA.time;
			var b = itemStackB.time;
			return (a > b) ? -1 : 1;
		},
		sortonPosition: function(vpItemA, vpItemB)
		{
			var a = parseInt(textUtil.searchAndReplaceNoCase(vpItemA.css("left"), 'px', ''));
			var b = parseInt(textUtil.searchAndReplaceNoCase(vpItemB.css("left"), 'px', ''));
			//console.log("a = " + a + ", b = " + b);
			return (a < b) ? -1 : 1;
		},
		sortStackByKeyword: function(itemStackA, itemStackB)
		{
			var a = itemStackA.keyword.toUpperCase();
			var b = itemStackB.keyword.toUpperCase();
			return (a < b) ? -1 : 1;
		},
		sortByLevel: function(itemA, itemB)
		{
			var a = itemA.level;
			var b = itemB.level;


			if(a == b)
		    {
				if(itemA.type == "events")
				{
					if(itemA.level != 3 && itemB.level != 3)
						return textUtil.sortByNumber(itemA, itemB);
					else if(itemA.level != 3 && itemB.level == 3)
						return 1;
					else
						return -1;
				}
				else
				{
					return textUtil.sortByString(itemA, itemB);
				}
		    }

			return (a < b) ? -1 : 1;
		},
		sortByNumber: function(itemA, itemB)
		{
			var a = itemA.dateTime;
			var b = itemB.dateTime;

			return (a > b) ? -1 : 1;
		},
		sortByCreationTime: function(itemA, itemB)
		{
			var a = itemA.creationTime;
			var b = itemB.creationTime;

			return (a > b) ? -1 : 1;
		},
		capitaliseFirstLetter: function(string)
		{
			if(string == undefined)
				return 'undefined';
			string = string.toLowerCase();
		    return string.charAt(0).toUpperCase() + string.slice(1);
		},
		stringsAreEqual : function(str1, str2)
		{
			if(str1 == undefined || str2 == undefined)
				return false;
			return (str1.toLowerCase() == str2.toLowerCase());
		},
		getKeywordType : function(keywordPair)
		{
			if(textUtil.stringHasValue(keywordPair))
			{
				var ary = keywordPair.split(':');
				return ary[0];
			}
			return undefined;
		},
		getSubKeywordType : function(keywordPair)
		{
			if(textUtil.stringHasValue(keywordPair))
			{
				var ary = keywordPair.split('|');
				return ary[0];
			}
			return undefined;
		},
		getKeywordVal : function(keywordPair)
		{
			if(textUtil.stringHasValue(keywordPair))
			{
				var ary = keywordPair.split(':');
				return ary[1];
			}
			return undefined;
		},
		getSubKeywordVal : function(keywordPair)
		{
			if(textUtil.stringHasValue(keywordPair))
			{
				var ary = keywordPair.split('|');
				return ary[1];
			}
			return undefined;
		},
		getStackDateLabel : function (time)
		{
			var d = new Date(time);
			var fullYear = d.getFullYear().toString().substr(2,2);
			var month = AppEnum.months[d.getMonth()];
			var dayOfMonth = d.getDate();
			return month + " " + dayOfMonth + ", " + fullYear;
		},
		getWizardFileDirName : function(path)
		{
			var n = path.lastIndexOf("/");
			if(n > -1)
				path = path.slice(0, n);
			n = path.indexOf("/Pictures/");
			if(n > -1)
				path = path.slice(n, path.length);
			else if(n < 0)
			{
				n = path.indexOf("/pictures/");
				if(n > -1)
					path = path.slice(n, path.length);
			}

			return path;
		},
		getWizardKeywordFromDirName : function(dirName)
		{
			var n = dirName.lastIndexOf("/");
			if(n > -1)
				dirName = dirName.slice((n + 1), dirName.length);
			return dirName;
		}
	};
	return textUtil;
});