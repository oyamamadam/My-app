define(['log', "ich", 'util/AppUtil', "text!bin/Bin.html", "css!bin/Bin", "text!bin/BinItem.html"],
function(log, ich, AppUtil, binHTML, binCSS, binItemHTML)
{
	function addListeners()
	{
	}
		
	function setPOCView()
	{
		var binObj = {src:"assets/icon/stack2.png",
					  title: "Bin Title",
					  count: "12"};
		AppUtil.appendIchTemplate('binItemHTML', binItemHTML, $('#binOuter', "#bin"), binObj);	
	}
		
	var comp = {init:function()
	{
		AppUtil.applyIchTemplate('binHTML', binHTML, $('#bin'));
				
		addListeners();
		
		for(var i = 0; i < 10; i++)
		{
			setPOCView();
		}
		
	}};
	return comp;
});