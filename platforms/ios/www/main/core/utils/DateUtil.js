if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['log', 'util/TextUtil'],
function(log, TextUtil)
{
	var dateUtil = {	
		mmms: ["Jan", "Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
		dateTimeFormat: "yyyy-mm-ddThh:mm:ss",
		dateFormat: "yyyy-mm-dd",
		anyDayTimeFormat: "ddThh",
		
		parse: function (dateStr)//2013-11-30T14:56:51.177
		{
			var timeNum = Date.parse(dateStr);
			var d = new Date(timeNum);					
			return d;
		},
		getDateString: function (temp)//2013-11-30T14:56:51.177 
		{          
			var dateStr = undefined;
			if(temp)
			{
				dateStr= dateUtil.padStr(temp.getFullYear()) + "-" +
						  dateUtil.padStr(1 + temp.getMonth()) +  "-" +
						  dateUtil.padStr(temp.getDate()) + "T" +
						  dateUtil.padStr(temp.getHours()) + ":" +
						  dateUtil.padStr(temp.getMinutes()) + ":" +
						  dateUtil.padStr(temp.getSeconds());		
			}	
				
			return dateStr;			
		},

		getDateString2: function (tempDateString)// "2014:03:16 10:26:48" is String
		{   
			var returnDateString = undefined;
			if(tempDateString)
			{
				var tempAry = tempDateString.split(" ");
				var dateStr = tempAry[0];
				var timeStr = tempAry[1];
				returnDateString = TextUtil.searchAndReplace(dateStr, ":", "-");
				if(timeStr)
					returnDateString += "T" + timeStr;
			}	
			
			return returnDateString;
		},
		
		validateDateFormat: function (dStr)
		{
			var d = dateUtil.parse(dStr);
			var parsedStr = dateUtil.getDateString(d);
			return parsedStr;
		},
		
		isValidCreationDate: function (str)
		{
			var l = (str) ? str.length : 0;
			//console.log('dateStr: = ' + str + ", length: " + l);
			return (l > 8);
		},
		padStr : function(i) 
		{
		    return (i < 10) ? "0" + i : "" + i;
		},
		sortByDate : function(itemA, itemB)
		{
			var numA = itemA.creationDate.getTime();
			var numB = itemB.creationDate.getTime();
			return numB - numA;
		},
		getNewDate:function(date)
		{
			return new Date(date.getFullYear(), date.getMonth(), date.getDate());
		},
		getTime:function()
		{
			return new Date().getTime();
		},
		sortOnDates: function(itemA, itemB)
		{
			var a = itemA.date.getTime();
			var b = itemB.date.getTime();
			return (a > b) ? -1 : 1;
		}
	};
	return dateUtil;
});