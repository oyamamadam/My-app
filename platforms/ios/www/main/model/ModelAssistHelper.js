define(['log', 
        'util/DateUtil', 
        'util/TextUtil', 
        'enum/AppEnum', 
        'adptr/DeviceAdaptor',
        'util/AppUtil',
        "cls"],
        
function(log, DateUtil, TextUtil, AppEnum, DeviceAdaptor, AppUtil, cls)
{		
	var helperObj = {};
	var lastCount = 0;
	function proccessPicInfoOnDate(picInfo) // this is all just one ITEM
	{		
		var yyyy = picInfo.creationDate.getFullYear(); // YEAR SECTION
		var yyyyObj = helperObj[yyyy];
		if(yyyyObj == undefined)
		{
			yyyyObj = new cls.RefinerItem(yyyy, 1, yyyy, AppEnum.events);
			helperObj[yyyy] = yyyyObj;
		}	
		yyyyObj.picIds.push(picInfo.id);
		yyyyObj.setTime(picInfo.creationTime);
		yyyyObj.count++;
		addStackToParentObject(yyyyObj, picInfo);
		
		var mm = picInfo.creationDate.getMonth(); // MONTH SECTION
		var mmObj = yyyyObj.children[mm];
		if(mmObj == undefined)
		{
			mmObj = new cls.RefinerItem(mm, 2, mm, AppEnum.events);
			yyyyObj.children[mm] = mmObj;
		}	
		mmObj.picIds.push(picInfo.id);
		mmObj.setTime(picInfo.creationTime);
		mmObj.count++;
		addStackToParentObject(mmObj, picInfo);
		
		var keyPairs = picInfo.keyword_pairs; // KEYWORDS TO MONTHS SECTIONS
		var n = (keyPairs) ? keyPairs.length : 0;
		for(var i = 0; i < n; i++)
		{
			var pair = keyPairs[i];
			if(pair == null)
				continue;
			var keyType = TextUtil.getKeywordType(pair);
			var keyword = TextUtil.getKeywordVal(pair);									
			var keywordObj = mmObj.children[keyword]; // Keyword SECTION
			if(keywordObj == undefined)
			{
				keywordObj = new cls.RefinerItem(keyword, 3, keyword, keyType.toLowerCase());
				mmObj.children[keyword] = keywordObj;
			}	
			keywordObj.picIds.push(picInfo.id);
			keywordObj.count++;
			addStackToParentObject(keywordObj, picInfo);
		}
	}
	
	function addStackToParentObject(parentObj, picInfo)
	{
		var parentStackObj = parentObj.stacks;
		var pairs = picInfo.keyword_pairs;
		var n = (pairs) ? pairs.length : 0;
		for(var i = 0 ; i < n; i++)
		{
			var pair = pairs[i];
			if(pair && pair.indexOf(":") > -1)
			{
				var pairType = TextUtil.getKeywordType(pair);
				var pairVal = TextUtil.getKeywordVal(pair);
				var tempStack = parentStackObj[pairVal];
				if(tempStack == undefined)
				{
					tempStack = new cls.RefinerItemStack(pairVal, pairType);
					parentStackObj[pairVal] = tempStack;
				}	
				if(pairType == AppEnum.places)
					pairType = AppEnum.placesTxt;
				tempStack[pairType.toLowerCase() + "Count"]++;
				tempStack["count"]++;
				tempStack.picIds.push(picInfo.id);
			}	
		}	
	}
	
	function getSortedYearValues(yyyyrefinerDateItem)
	{
		var items = [];
		var item;
		for(var prop in yyyyrefinerDateItem.children)
		{
			item = yyyyrefinerDateItem.children[prop];
			item = getSortedStacks(item);
			item = getSortedYearValues(item);
			items.push(item);
		}	
		
		if(item && item.level == 3)
			items.sort(TextUtil.sortByString);
		else
			items.sort(TextUtil.sortByNumber);
		yyyyrefinerDateItem.children = items;
		yyyyrefinerDateItem = getSortedStacks(yyyyrefinerDateItem);
		return yyyyrefinerDateItem;
	}

	function getSortedStacks(refinerDateItem)
	{
		var items = [];
		var item;
		for(var prop in refinerDateItem.stacks)
		{
			item = refinerDateItem.stacks[prop];
			var eventsCount = item.eventsCount;
			if(eventsCount > 0 || 1==1)
				items.push(item);
		}		
		items.sort(TextUtil.sortByString);
		refinerDateItem.stacks = items;	
		return refinerDateItem;
	}

	var helper = 
	{
		getItemsByDate: function(itemsById)
		{		
			helperObj = {};
			for(var id in itemsById)
			{
				var picInfo = itemsById[id];
				if(picInfo.isDeleted)
					continue;
				proccessPicInfoOnDate(picInfo);
			}	
			// change into array:
			var dateList = [];
			for(var yyyy in helperObj)
			{
				var refinerDateItem = helperObj[yyyy];
				refinerDateItem = getSortedYearValues(refinerDateItem);// this sorts every item
				dateList.push(refinerDateItem);
			}	
			helperObj = {};
			dateList.sort(TextUtil.sortByNumber); //months			
			return dateList;
		},
		getAlphabeticItems : function (itemsById, type)
		{
			helperObj = {};
			if(type == AppEnum.placesTxt)
				type = AppEnum.places;
			for(var id in itemsById)
			{
				var picInfo = itemsById[id];
				if(picInfo.isDeleted)
					continue;
				var roots = picInfo.root_categories;
				var n = (roots) ? roots.length : 0;
				for(var i = 0; i < n; i++)
				{
					var rootCat = roots[i];
					if(TextUtil.stringsAreEqual(type, rootCat))//can be processed
					{
						proccessPicInfoOnKeyword(picInfo, type);
						break;
					}							
				}		
			}	
			
			// change into array and sort:
			var dateList = [];
			lastCount = 0;
			for(var char in helperObj)
			{
				var refinerDateItem = helperObj[char];
				lastCount = refinerDateItem.count + lastCount;
				refinerDateItem = getSortedYearValues(refinerDateItem);// this sorts every item
				dateList.push(refinerDateItem);
			}	
			helperObj = {};
			dateList.sort(TextUtil.sortByString); //chars			
			return dateList;
		},
		getLastCount : function()
		{
			return lastCount;
		},
		getRefinerItems : function (item, uids)
		{
			var refinerItems = getRItems(item, uids);
			return refinerItems;//.sort(TextUtil.sortByLevel);			
		}
	};
	
	function getRItems(item, uids)
	{
		if(uids && uids[0] == undefined)
			uids = undefined;
		var refinerItems = [];
		var children = item.children;
		var n = (children) ? children.length : 0;
		for(var i = 0; i < n; i++)
		{
			var child = children[i];
			if(uids == undefined) // all Stacks
			{
				var tmpStacks = getRefinerItemsFromItem(child);
				refinerItems = refinerItems.concat(tmpStacks);
			}	
			else
			{
				var m = (uids) ? uids.length : 0;
				var parentAdded = false;
				for(var j = 0; j < m; j++)
				{
					var uid = uids[j];
					if(child.uid == uid)
					{
						var tmpStacks = getRefinerItemsFromItem(child);	
						refinerItems = refinerItems.concat(tmpStacks);
						parentAdded = true;
						break;
					}									
				}	
				if(parentAdded == false) //check Children
				{
					var tmpStacks = getRItems(child, uids);
					refinerItems = refinerItems.concat(tmpStacks);
				}
			}				
		}	
		return refinerItems;
	}
	
	function getRefinerItemsFromItem(refinerItem)
	{
		var refinerItems = [refinerItem];
		var n = (refinerItem.children) ? refinerItem.children.length : 0;
		for(var i = 0; i < n; i++)
		{
			var child = refinerItem.children[i];
			refinerItems.push(child);
			var m = (child.children) ? child.children.length : 0;
			for(var j = 0; j < m; j++)
			{
				var subChild = child.children[j];
				refinerItems.push(subChild);
			}
		}	
		
		return refinerItems;
	}
	
	function proccessPicInfoOnKeyword(picInfo, type) // this is all just one ITEM
	{		
		var keyPairs = picInfo.keyword_pairs;
		var n = (keyPairs) ? keyPairs.length : 0;
		for(var i = 0; i < n; i++)
		{
			var pair = keyPairs[i];
			var keyType = TextUtil.getKeywordType(pair);
			if(TextUtil.stringsAreEqual(type, keyType))//can be processed
			{
				var keyword = TextUtil.getKeywordVal(pair);	
				var char = keyword.slice(0,1).toUpperCase(); // Letter SECTION
				var charObj = helperObj[char];
				if(charObj == undefined)
				{
					charObj = new cls.RefinerItem(char, 1, char, type);
					helperObj[char] = charObj;
				}	
				charObj.picIds.push(picInfo.id);
				charObj.count++;
								
				var keywordObj = charObj.children[keyword]; // Keyword SECTION
				if(keywordObj == undefined)
				{
					keywordObj = new cls.RefinerItem(keyword, 2, keyword, type);
					charObj.children[keyword] = keywordObj;
				}	
				keywordObj.picIds.push(picInfo.id);
				keywordObj.count++;
				addStackToParentObject(keywordObj, picInfo);
			}
		}
	}
	
	return helper;		
});