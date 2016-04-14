define(['util/AppUtil',
        'util/IchUtil',
        'enum/AppEnum', 
        "m/ModelAssist",
        'util/TextUtil',
        "text!fav/FavItem.html"],
        
function(AppUtil, IchUtil, AppEnum, ModelAssist, TextUtil, favItemHTML)
{	
	
	var helper = {
		setView: function()
		{
			var favList = getFavObject();
			var n = (favList) ? favList.length : 0;
			var ownerDiv = $('#favOuter', "#fav");
			ownerDiv.empty();
			for(var i = 0; i < n; i++)
			{
				var favItem = favList[i];
				setFavView(favItem, ownerDiv);
			}	
		}};
	
	function setFavView(favItem, ownerDiv)
	{
		var count = favItem.count;
		var lb = favItem.label;
		var pics = favItem.pics;
		var n = (pics) ? pics.length : 0;
		
		for(var i = 0; i < n; i++)
		{
			var picInfo = pics[i];
			IchUtil.appendIchTemplate('noname', favItemHTML, ownerDiv, picInfo);	
		}	
	}
	
	function getFavObject()
	{
		var objectsById = ModelAssist.getObjectsById();
		var favHash = {};
		for(var id in objectsById)
		{
			var picInfo = objectsById[id];
			var pairs = picInfo.keyword_pairs;
			var n = (pairs) ? pairs.length : 0;
			for(var i = 0; i < n; i++)
			{
				var pair = pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				if(pairType == AppEnum.favorites)
				{
					var pairKeyword = TextUtil.getKeywordVal(pair);
					var favItem = favHash[pairKeyword];
					if(favItem == null)
					{
						favItem = {count: 0, pics: [], label: pairKeyword};
						favHash[pairKeyword] = favItem;
					}	
					favItem.count++;
					favItem.pics.push(picInfo);
				}	
			}				
		}
		return getFavList(favHash);
	}
	
	function getFavList(favHash)
	{
		var favList = [];
		for(var favName in favHash)
		{ 
			favList.push(favHash[favName]);
		}
		favList.sort(TextUtil.sortByString);
		return favList;
	}
	
	return helper;
});