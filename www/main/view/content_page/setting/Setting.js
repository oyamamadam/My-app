define(['log', "ich", 'util/AppUtil', "text!setting/Setting.html", "css!setting/Setting"],
function(log, ich, AppUtil, settingHTML, settingCSS)
{
	function addListeners()
	{
	}
		
	var comp = {init:function()
	{
		AppUtil.applyIchTemplate('settingHTML', settingHTML, $('#setting'));
				
		addListeners();	
	}};
	return comp;
});