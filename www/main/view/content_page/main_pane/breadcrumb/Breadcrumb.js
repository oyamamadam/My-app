define(['log', 
        "ich", 
        'util/AppUtil', 
        'util/TextUtil', 
        "text!mainPane/breadcrumb/Breadcrumb.html",        
        "css!mainPane/breadcrumb/Breadcrumb", 
        "mainPane/refiner/RefinerState",
        'enum/AppEnum',
        'cache'],
        
function(log, ich, AppUtil, TextUtil, breadcrumbHTML, breadcrumbCSS, RefinerState, AppEnum, cache)
{
	var rTerm = undefined;
	var rType = undefined;
	
	function addListeners()
	{
		$(document).on("stackChangeNotification", onStackChangeNotification); 
		$(document).on("refinerChange", onRefinerChange); 
	}
	
	function onRefinerChange(e, data)
	{
        //rTyep parameter defined
		rType = data.type;
		rTerm = data.term;
		if(rType == AppEnum.events)
		{
			var selectedRItem = $("#refiner .refinerItem.selected");
			var parentID = selectedRItem.attr("parentid");
			if(parentID != undefined)
			{
				var parentItem = $("#" + parentID, "#refiner");
				var parentTerm = parentItem.attr("label");
				rTerm = data.term + ", " + parentTerm;
			}			
		}
	}

    //add angular-moment.min. map file !
    //add angular-animation.min.map file add

	function onStackChangeNotification()
	{
		var selectedStack = $('#contentPage #contentBody #mainPane #rDiv #stackWrapper #stack .stacksItem.selected');
		var stackkeyword = selectedStack.attr("stackkeyword");
		var isAllPics = false;
		if(stackkeyword == "ALL PHOTOS")
			isAllPics = true;
		setBreadcrumb(stackkeyword, isAllPics);
	}
	
	function setBreadcrumb(term, isAllPics)
	{
		var bTerm = rTerm;
		if(rTerm == "*")
			bTerm = "All";

		var bcObj = {term: bTerm};
		var ty = TextUtil.capitaliseFirstLetter(rType);
		var openCount = 0;
		for (var property in RefinerState.open) 
		{
		    var isOpen = RefinerState.open[property];
		    if(isOpen)
		    {
		    	if(property == AppEnum.places)
		    		property = AppEnum.placesTxt;
		    	
		    	if(property == AppEnum.entities)
				{
					var entitiesCacheText = cache.getValue(AppEnum.ENTITY_NAME);
					if(entitiesCacheText)
						property = entitiesCacheText;
				}
		    	openCount++;
		    	bcObj["type" + openCount] = TextUtil.capitaliseFirstLetter(property);
		    }
		}	
		if(isAllPics)
			bcObj["comment"] = "Other tags in these photos";
		else
			bcObj["comment"] = term + " || Other tags in these photos";
		AppUtil.applyIchTemplate('breadcrumbHTML', breadcrumbHTML, $('#breadcrumb'), bcObj);
		setTypesVisibility(openCount);
	}
	
	function setTypesVisibility(openCount)
	{
		if(openCount == 1)
			$(".sep1, .type2, .sep2, .type3, .sep3, .type4", "#breadcrumb").hide();
		else if(openCount == 2)
			$(".sep2, .type3, .sep3, .type4", "#breadcrumb").hide();
		else if(openCount == 3)
			$(".sep3, .type4", "#breadcrumb").hide();			
	}
	
	var comp = {init:function()
	{			
		addListeners();
	}};
	return comp;
});