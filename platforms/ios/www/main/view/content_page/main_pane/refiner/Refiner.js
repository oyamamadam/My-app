if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["log", 'util/AppUtil',
        "css!mainPane/refiner/Refiner", 
        "mainPane/refiner/RefinerHelper",
        "mainPane/refiner/RefinerSearchHelper"],
        
function(log, AppUtil, RefinerCSS, RefinerHelper, RefinerSearchHelper)
{
	function addListeners()
	{
	    $(document).bind("searchComplete", onSearchComplete);
	    $(document).bind("defaultStateRequest2", onDefaultStateRequest);
	    $(document).bind("searchTextChanged", RefinerSearchHelper.onSearchTextChanged);
	    AppUtil.addTouchEvent('#refiner .refinerItem', RefinerHelper.onRefinerItem);
	    AppUtil.addTouchEvent('#refiner .setHeader', RefinerHelper.onHeaderClick);
	}
			
	function onSearchComplete()
	{
		RefinerHelper.setView();
		var $contentPage = $("#contentPage");
		if($contentPage.is(":hidden"))
			$.event.trigger("showContent");		
		RefinerHelper.setStaticView();
		RefinerHelper.selectSelected();
	}
	
	function onDefaultStateRequest()
	{
		var $contentPage = $("#contentPage");
		if($contentPage.is(":hidden"))
			$.event.trigger("showContent");	
		RefinerHelper.setDefaultView();
	}
	
	var comp = {
	init:function()
	{
		addListeners();
	}};
	return comp;
});