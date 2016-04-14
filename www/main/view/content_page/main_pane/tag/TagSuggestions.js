// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(["text!mainPane/tag/tag_suggestion.txt",
        'enum/AppEnum',
        'util/DateUtil',
        'cls',
        'util/AppUtil',
        'util/TextUtil'],
        
function(tag_suggestion, AppEnum, DateUtil, cls, AppUtil,TextUtil)
{
	var suggestions = {};
	function getTags(suggestions, type)
	{
		var n = (suggestions) ? suggestions.length : 0;
		var ary = [];
		for(var i = 0; i < n; i++)
		{
			var s = suggestions[i];
			var dateFormat = s.dateFormat; 
			var startDate = s.startDate; 
			var endDate = s.endDate; 
			switch(dateFormat)
			{
				case DateUtil.dateFormat: 
					startDate = new Date(Date.parse(startDate));	
					endDate = new Date(Date.parse(endDate));
					break;
				case DateUtil.anyDayTimeFormat: 
					//do nothing
					break;
			}
			
			ary.push(new cls.TagSuggestion(startDate, endDate, dateFormat, s.keywords, type, AppUtil.UIID()));
		}	
		return ary;
	}
	
	function filterSugestionsByActiveItems(type, activeItems)
	{
		var s = suggestions[type];
		var n = (s) ? s.length : 0; 
		var okTags = {};
		for(var i = 0; i < n; i++)
		{
			var sTag = s[i];
			switch(sTag.dateFormat)
			{
				case DateUtil.dateFormat: setTagsInRange(sTag, activeItems, okTags); break;
				case DateUtil.anyDayTimeFormat: setTagsForAnyDay(sTag, activeItems, okTags); break;
			}
		}
		
		var items = [];
		for(var tagName in okTags)
		{
			var item = okTags[tagName];
			items.push(item);
		}	
		return items.sort(TextUtil.sortByString);
	}
	
	function setTagsInRange(sTag, activeItems, okTags)
	{
		var n = (activeItems) ? activeItems.length : 0;
		for(var i = 0; i < n; i++)
		{
			var item = activeItems[i];
			var itemCreationDateNum = item.creationTime;
			var sTagStartDateNum = sTag.startDate.getTime();
			var sTagEndDateNum = sTag.endDate.getTime();
						
			if(itemCreationDateNum > sTagStartDateNum && itemCreationDateNum < sTagEndDateNum)//add suggestive tag
			{
				addSuggestedTag(sTag, okTags);
			}
		}	
	}
	
	function addSuggestedTag(sTag, okTags)
	{
		var m = (sTag.keywords) ? sTag.keywords.length : 0;
		for(var j = 0; j < m; j++)
		{
			var tagStr = sTag.keywords[j];
			okTags[tagStr] = {label: tagStr, tagId: AppUtil.UIID(), count : 0, type : sTag.type};
		}	
	}
	
	function setTagsForAnyDay(sTag, activeItems, okTags)
	{
		for (var id in activeItems) 
		{
			var item = activeItems[id];
			var dayIdx = item.creationDate.getDay();
			var dayHours = parseInt(item.creationDate.getHours());
			var startDayIdx = parseInt((sTag.startDate.split('T'))[0]);
			var startDayHours = parseInt((sTag.startDate.split('T'))[1]);
			var endDayIdx = parseInt((sTag.endDate.split('T'))[0]);
			var endDayHours = parseInt((sTag.endDate.split('T'))[1]);
			
			if(startDayIdx > endDayIdx)
			{
				var endDayIdx = endDayIdx + 7;
				var dayIdx = dayIdx + 7;				
			}	
			
			if(startDayHours > endDayHours)
			{
				endDayHours = endDayHours + 24;
				dayHours = dayHours + 24;
			}
			
			if(dayIdx >= startDayIdx && dayIdx <= endDayIdx)
			{
				if(dayHours >= startDayHours && dayHours <= endDayHours)
				{
					addSuggestedTag(sTag, okTags);	
				}						
			}
		}
	}
	
	var comp = 
	{			
		visiblePicInfos : undefined,
		parseSuggestions:function()
		{
			var str = DateUtil.getDateString(new Date());
			console.log(str);
			var jsonObj =  JSON.parse(tag_suggestion);
			suggestions[AppEnum.events] = getTags(jsonObj[AppEnum.events], AppEnum.events);
		},
		getTypedSuggestions : function(type)
		{
			var s = filterSugestionsByActiveItems(type, comp.visiblePicInfos)
			return s;
		}
		
	};
	return comp;
});