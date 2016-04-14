define(['log','util/AppUtil','enum/AppEnum', "m/ModelAssist", "text!header/SuggestItem.html", 'util/TextUtil'],
function(log, AppUtil, AppEnum, ModelAssist, SuggestItem, TextUtil)
{	
	function setupSuggestions(searchTerm)
	{
		var sBox = $("#keywordsBox > #suggestionBox", "#header");
		sBox.empty();
		var keywords = ModelAssist.getKeywords();
		var sortedKeywords = [];
		for (var property in keywords) 
		{
			var startChar = property.search(new RegExp(searchTerm, "i"));	
			if(startChar > -1)
			{			
				var item = keywords[property];				
				item.term = property;
				item.startChar = startChar;
				sortedKeywords.push(item);				
			}
		}
		sortedKeywords.sort(TextUtil.sortByString);
		var n = (sortedKeywords) ? sortedKeywords.length : 0;
		for(var i = 0; i < n && i < 8; i++)
		{
			var item = sortedKeywords[i];	
			var startChar = item.startChar;
			var endChar = startChar + searchTerm.length;
			var orgStr = item.term.slice(startChar, endChar);				
			var suggestion =  TextUtil.singleSearchAndReplace(item.term, orgStr, "<mark>" + orgStr + "</mark>");
			var tempSuggestItem = TextUtil.searchAndReplace(SuggestItem, "@MARKTXT@", suggestion);				
			AppUtil.appendIchTemplate('suggestItem', tempSuggestItem, sBox, item);
		}	
	}
	
	function setScroll()
	{
		
	};
	
	var comp = {
	onSearchTextChange: function(searchTerm)
	{
		var kBox = $("#keywordsBox", "#header");
		if(searchTerm) // not null
		{
			kBox.css("visibility", "visible");
			kBox.slideDown();
			setupSuggestions(searchTerm);
		}
		else
		{
			kBox.slideUp(function()
			{
				kBox.css("visibility", "hidden");
			});
		}
		setScroll();
	}};
	return comp;
});