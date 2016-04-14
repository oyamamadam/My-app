define(['log',
        'util/TextUtil',
        'enum/AppEnum',
        "mainPane/refiner/RefinerHelper"],
        
function(log, TextUtil, AppEnum, RefinerHelper)
{
	var firstMatchItem = undefined;
	var firstMatchItemType = undefined;
	
	function searchTypes(type, term)
	{
		var typeId = "#" + type;
		var set = $(typeId, "#contentPage #contentBody #mainPane #refiner #lCol");
		var refinerItems = $(".iscrollWrapper .setBody .refinerItem", set); 
		var n = (refinerItems) ? refinerItems.length : 0;
		var searchCount = 0;
		
		for(var i = 0; i < n; i++)
		{
			var rItem = $(refinerItems[i]);			
			var lb = rItem.attr('label');
			var levelDiv = $(".level", rItem);
			
			if(TextUtil.hasString(lb, term))
			{
				var rplStr = '<mark>' + TextUtil.getReplaceTxt(lb, term) + '</mark>';
				var newInnerHtml = TextUtil.searchAndReplaceNoCase(lb, term, rplStr);
				levelDiv.html(newInnerHtml);
				searchCount++;
				if(firstMatchItem == undefined)
				{
					firstMatchItemType = type;
					firstMatchItem = rItem;
				}						
			}	
			else
			{
				if(rItem.attr('label') == AppEnum.stared)
					lb = "My Favorites";
				levelDiv.html(lb);
				if(term && term.length > 0)
					rItem.addClass("searched");
				else
					rItem.removeClass("searched");
			}	
		}	
		
		console.log("searchCount = " + searchCount + " ,n =" + n);

		var setHeader = $(".setHeader", "#contentPage #contentBody #mainPane #refiner #lCol " + typeId);
		var countDiv = $(".headerCount", setHeader);
		
		if(term && term.length > 0)
			countDiv.html("(" + searchCount + ")");			
		else
			countDiv.html("(" + countDiv.attr("count") + ")");			
		
		if(searchCount > 0)
		{
			setHeader.addClass('searched');
		}				
		else
		{
			setHeader.removeClass('searched');
		}	
	}
	
	var comp = 
	{
		onSearchTextChanged : function (e)
		{
			return;
			//THIS IS NO LONGER USED
			
			firstMatchItem = undefined;
			firstMatchItemType = undefined;
			var term = e.term;
			searchTypes(AppEnum.events, term);
			searchTypes(AppEnum.places, term);
			searchTypes(AppEnum.people, term);
			searchTypes(AppEnum.entities, term);
			searchTypes(AppEnum.favorites, term);
			if(firstMatchItem)
				RefinerHelper.externalSelection(firstMatchItem, firstMatchItemType);
		}
	};
	return comp;
});