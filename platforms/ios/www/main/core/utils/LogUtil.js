// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

console.debug('LogUtil.js');

define({
	traceArgs: function ()
	{
		var n = (arguments) ? arguments.length : 0;
		var outputTxt = '';
		for(var i = 0; i < n; i++)
		{
			if(outputTxt.length > 0)
				outputTxt += ', ';
			outputTxt += ("arg " + i + ": " + arguments[i]);
		}
		console.log(outputTxt);
	},

	t: function (value)
	{
		console.log(value);
	},

	a:function (value)
	{
		 alert(value);
	},

	i: function(obj)
	{
		console.log("Log > Inspect:");
		for (var property in obj)
		{
			var val = obj[property];
			// ( add by 15 21.05.2015
			//console.log(property + ': ' + val);
			console.log(property + ': ' + (typeof val == 'function' ? 'function' : val));
			// add by 15 21.05.2015 )
		}
	},

	i2: function(obj)
	{
		console.log("Log > DEEP INSPECT:");
		for (var property in obj)
		{
			var val = obj[property];
			if(val != null && typeof val === 'object')
			{
				for (var property2 in val)
				{
					var val2 = val[property2];
					console.log("____2nd____  " + property2 + ': ' + val2);
				}
			}
			console.log(property + ': ' + val);
		}
	},

	a: function (ary)
	{
		var n = ary.length;
		for(var i = 0; i < n; i++)
		{
			var item = ary[i];
			console.log(item.create_date);
		}
	}
});