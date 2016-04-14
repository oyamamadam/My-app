define(['log', 
        'util/AppUtil', 
        "css!mainPane/stacks/Stacks",
        "mainPane/stacks/StacksHelper"],
        
function(log, AppUtil, stackCSS, StacksHelper)
{
	function addListeners()
	{
		$(document).on("refinerChange", StacksHelper.setView);
		AppUtil.addTouchEvent('#stack .stacksItem', StacksHelper.onStackTab);
	}
		
	var comp = {init:function()
	{		
		addListeners();
	}};
	return comp;
});