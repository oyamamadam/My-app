// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log', 
        'util/DateUtil', 
        'util/TextUtil', 
        'enum/AppEnum', 
        'adptr/DeviceAdaptor',
        'util/AppUtil'],
        
function(log, DateUtil, TextUtil, AppEnum, DeviceAdaptor, AppUtil)
{
	var itemArray = [];
	var itemsById = {};
	var itemsByType = {};
	var itemsByKeywordPair = {};	
	var itemsByDate = {};	
	var typedKeywords = {};
	var keywords = {};
		
	function isItemOfType(item, type, includeUndefined)
	{
		var root_cats = item.root_categories;
		var n = (root_cats) ? root_cats.length : 0;
		
		for(var i = 0; i < n; i++)
		{
			var iType = root_cats[i];
			if(includeUndefined && iType == 'NONE')
				return true;
			if(iType && type)
			{
				if(iType.toLowerCase() == type.toLowerCase())
					return true;
			}	
		}	
		return false;
	}
	
	function processKeywords(item)
	{
		var pairs = item.keyword_pairs;
		var n = (pairs) ? pairs.length : 0;
		for(var i = 0; i < n; i++)
		{
			var pairStr = pairs[i];
			var pair = (pairStr) ? pairStr.split(":") : undefined;
			if(pair == undefined)
				continue;
			var kType = pair[0].toLowerCase();
			var keyword = pair[1];
			
			var typeObj = typedKeywords[kType];
			if(typeObj == undefined)
			{
				typeObj = {};
				typedKeywords[kType] = typeObj;
			}
			
			var keywordObj = typeObj[keyword];
			if(keywordObj == undefined)
			{
				var uId = AppUtil.UIID();
				keywordObj = {count: 0, tagId: uId, label: keyword};
				typeObj[keyword] = keywordObj;
				keywords[keyword] = keywordObj;
			}	
			keywordObj.count++;	
		}
	}
	
	function processItemByDate(item)
	{
		var yyyy = item.creationDate.getFullYear();
		var time = item.creationDate.getTime();
		item.time = time;
		var yObj = itemsByDate[yyyy];
		var yCount = itemsByDate['count'];
		if(yCount == undefined)
			itemsByDate['count'] = 0;
		
		itemsByDate.count++; // TOTAL EVENT Picture Count
		
		if(yObj == undefined)
		{
			yObj = {count : 0, time: 0};
			itemsByDate[yyyy] = yObj;			
		}	
		yObj.count++; // TOTAL YEAR Picture Count
		yObj.time = (yObj.time > time) ? yObj.time : time;
		
		var m = item.creationDate.getMonth();
		var mObj = yObj[m];
		if(mObj == undefined)
		{
			mObj = {count: 0, items: {}, keywords: {}};
			yObj[m] = mObj;
		}	
		
		mObj.count++; // TOTAL Month Picture Count
		mObj.time = (mObj.time > time) ? mObj.time : time;
		
		setDateKeywordObject(item.keyword_pairs, mObj, item, AppEnum.events);
	}	
	
	function setDateKeywordObject(pairs, mObj, item, type)
	{
		var n = (pairs) ? pairs.length : 0;
		var pairsGlobalStr = pairs.toString();
		var keywordObj = undefined;
		var isHidden = undefined;
		for(var i = 0; i < n; i++)
		{
			var pairStr = pairs[i];
			var kType = undefined;
			var keyword = undefined;
			if(pairStr == undefined)
			{
				keyword = "undefined";
				kType = "undefined";
				pairStr = "undefined";
				pairsGlobalStr = "undefined";
			}
			else
			{
				var pair = pairStr.split(":");
				kType = pair[0].toLowerCase();
				keyword = pair[1];
				isHidden = (kType != type.toLowerCase());
				keywordObj = mObj.keywords[keyword];
				if(keywordObj == undefined)
				{
					keywordObj = {count: 0};
					mObj.keywords[keyword] = keywordObj;
				}	
				keywordObj[item.id] = item;		
				keywordObj.count++;
				keywordObj.isHidden = isHidden;
			}	
		}
		
		keywordObj = mObj.items[pairsGlobalStr];
		if(keywordObj == undefined)
		{
			keywordObj = {items: {}, count: 0};
			mObj.items[pairsGlobalStr] = keywordObj;
		}	
		keywordObj.items[item.id] = item;		
		keywordObj.count++;
		keywordObj.isHidden = isHidden;
	}
	
	function processItemByKeywordPair(item)
	{
		var pairs = item.keyword_pairs;
		
		var n = (pairs) ? pairs.length : 0;
		for(var i = 0; i < n; i++)
		{
			var pairStr = pairs[i];
			var pair = (pairStr) ? pairStr.split(":") : undefined;
			if(pair == undefined)
				continue;
			var kType = pair[0].toLowerCase();
			var keyword = pair[1];
			var typeObj = itemsByKeywordPair[kType];
			var letter = keyword.slice(0, 1).toUpperCase();
			if(typeObj == undefined)
			{
				typeObj = {count: 0};
				itemsByKeywordPair[kType] = typeObj;
			}
			
			var letterObj = typeObj[letter];
			if(letterObj == undefined)
			{
				letterObj = {count: 0, items: {}};
				typeObj[letter] = letterObj;
			}		
			
			var keywordObj = letterObj.items[keyword];
			if(keywordObj == undefined)
			{
				keywordObj = {items: {}, count: 0};
				letterObj.items[keyword] = keywordObj;
			}	
			typeObj.count++;
			letterObj.count++;
			keywordObj.count++;	
			keywordObj.items[item.id] = item;			
		}
	}

	function processItemByType(item)
	{
		var types = item.root_categories;
		var n = (types) ? types.length : 0;
		for(var i = 0; i < n; i++)
		{
			var type = types[i].toLowerCase();
			var typeObj = itemsByType[type];
			if(typeObj == undefined)
			{
				typeObj = {};
				itemsByType[type] = typeObj;
			}	
			typeObj[item.id] = item;
		}
	}
	
	function processRawItem(item)
	{		
		item.creationDate = DateUtil.parse(item.create_date);
		item.serverSideId = item.id;
		item.id = TextUtil.searchAndReplace(item.id, "=", '');
		item.isDirty = false;
		itemsById[item.id] = item;
		//itemArray.push(item);
		processItemByType(item);
		processItemByKeywordPair(item);
		processItemByDate(item);
		processKeywords(item);
	}

	function updateRawItem(item)
	{	
		item.id = TextUtil.searchAndReplace(item.id, "=", '');
		var existingItem = itemsById[item.id];
		updateData(existingItem, item);
		processRawItem(item);
	}
	
	function updateNewData(existingItem, updatedItem)
	{
		for (var property in existingItem) 
		{
			if(updatedItem[property] == undefined)
				updatedItem[property] = existingItem[property];
		}
	}
	
	function getEventStack(dataId, isTopLevel, selectedTerm)
	{		
		return undefined;
		if(selectedTerm == "*")
			dataId = undefined;
		var result = [];
		var n = itemsByDate.sortedItems.length;
		for(var i = 0; i < n; i++)
		{
			var yyyyObj = itemsByDate.sortedItems[i];
			var m = yyyyObj.sortedItems.length;
			for(var j = 0; j < m; j++)
			{
				var mmObj = yyyyObj.sortedItems[j];
				mmObj.isMainStack = false;
				if(mmObj.dataId == dataId || dataId == undefined)
				{
					if(isTopLevel || dataId == undefined) // add one Stack of everything
					{				
						mmObj.isMainStack = true;
						mmObj.keyword = mmObj.label;						
						result.push(mmObj);	
					}	
					var o = mmObj.keywords.sortedItems.length;
					for(var k = 0; k < o; k++)
					{
						var kwObj = mmObj.keywords.sortedItems[k];
						if(kwObj && kwObj.isHidden)
							continue;
						if((isTopLevel && mmObj.label == selectedTerm) || dataId == undefined)
						    result.push(kwObj);
						if(kwObj.dataId == dataId && kwObj.keyword == selectedTerm)
							result.push(kwObj);
					}
				}
			}
		}
		result.sort(stackKeywordSort);
		return result;
	}
	
	function stackKeywordSort(a, b)
	{
		if (!a.isEvent && a.isMainStack && !b.isMainStack) return -1;
		if (!b.isEvent && b.isMainStack && !a.isMainStack) return 1;
		if (a.isMainStack && !b.isMainStack) return -1;
		if (a.isEvent && a.isMainStack && b.isEvent && b.isMainStack) return sortByTime(a.time, b.time);
		if (a.isEvent && a.isMainStack && !b.isEvent && b.isMainStack) return -1;
		if (!a.isEvent && a.isMainStack && !b.isEvent && b.isMainStack) return sortByName(a.keyword, b.keyword);
		if (a.sortLabel.toUpperCase() < b.sortLabel.toUpperCase()) return -1;
	    if (a.sortLabel.toUpperCase() > b.sortLabel.toUpperCase()) return 1;
	    return 0;
	}

	function getStack(type, dataId, isTopLevel, selectedTerm)
	{		
		if(selectedTerm == "*")
			dataId = undefined;
		var result = [];
		var letters = itemsByKeywordPair[type];
		var n = letters.sortedItems.length;
		for(var i = 0; i < n; i++)
		{
			var letterObj = letters.sortedItems[i]; 
			var letter = letterObj.sortLabel;
			var m = letterObj.items.sortedItems.length;
			
			if(letterObj.dataId == dataId || dataId == undefined)
			{
				if(isTopLevel || dataId == undefined) // add one Stack of everything
				{				
					letterObj.isMainStack = true;
					letterObj.keyword = letterObj.label;						
					result.push(letterObj);	
				}	
				
				for(var j = 0; j < m; j++)
				{
					var kwObj = letterObj.items.sortedItems[j]; 
					if((isTopLevel && letter == selectedTerm) || dataId == undefined)//is top level add all under
					    result.push(kwObj);
					else if(kwObj.keyword == selectedTerm)
						result.push(kwObj);
				}
			}
		}
		
		result.sort(stackKeywordSort);
		return result;
	}
	
	function getSortedList(type)
	{
		var items = itemsByKeywordPair[type];		
		var returnObj = sortByPropName(items, false, type);
		itemsByKeywordPair[type] = returnObj;
		return returnObj;
	}
	
	function sortByPropName(obj, isSubItem, type)
	{
		var list = [];
		var propName = undefined;
		var returnObj = {count: 0, sortedItems: []};
		var item = undefined;
		for (propName in obj) 
		{
			item = obj[propName];
			if(propName == "count")
				returnObj[propName] = obj[propName];
			else
				list.push(propName);
	    }
		
		list.sort(sortByName);
		
		var n = list.length;
		for(var i = 0; i < n; i++)
		{
			propName = list[i];
			item = obj[propName];
			if(item['items'] && isSubItem == false)
			{	
				item.items = sortByPropName(item.items, true);
			}
			else if(type == AppEnum.events && isSubItem == false) // for EVENTS
			{
				item = sortByPropName(item, false, type);
			}	
			
			item.sortLabel = propName;
			returnObj.sortedItems.push(item);
		}	
		return returnObj;
	}
	
	function sortByTime(timeA, timeB)
	{
	    if (timeA > timeB) return -1;
	    if (timeA < timeB) return 1;
	    return 0;
	}

	function sortByName(nameA, nameB)
	{
		if (nameA.toLowerCase() < nameB.toLowerCase()) return -1;
	    if (nameA.toLowerCase() > nameB.toLowerCase()) return 1;
		return 0;
	}
	
	function sortDateByTime(obj, isSubItem)
	{
		var list = [];
		var propName = undefined;
		var returnObj = {count: 0, sortedItems: []};
		var item = undefined;
		for (propName in obj) 
		{
			item = obj[propName];
			if(propName == "count")
				returnObj[propName] = obj[propName];
			else if(item.time != undefined)
				list.push(item.time);
			else if(isSubItem)
				list.push(propName);
	    }
		
		if(isSubItem)
			list.sort(sortByName);
		else
			list.sort(sortByTime);
		
		
		var n = list.length;
		for(var i = 0; i < n; i++)
		{			
			if(isSubItem)
			{
				propName = list[i];
				item = obj[propName];
			}	
			else
			{
				var time = list[i];
				var found = false;
				for (propName in obj) 
				{
					item = obj[propName];
					if(item.time == time)
					{
						found = true;
						break;
					}
				}
				if(found == false)
				{
					//console.log("Items was not found, BREAKING....");
					break;
				}
			}	
			if(item['keywords'] && isSubItem == false)
			{	
				item.keywords = sortDateByTime(item.keywords, true);
			}
						
			if(item['items'] && isSubItem == false)
			{	
				item.items = sortDateByTime(item.items, true);
			}
			else if(isSubItem == false) // for EVENTS
			{
				item = sortDateByTime(item, false);
			}	
				
			item.sortLabel = propName;
			returnObj.sortedItems.push(item);
		}	
		return returnObj;
	}
	
	var helper = 
	{
		extractData: function(rawResults, userToken)
		{						
			var n = (rawResults) ? rawResults.length : 0;
			var currnetUser = userToken.toUpperCase();
			var item = undefined;
			for(var i = 0; i < n; i++)
			{
				item = rawResults[i];
				var itemUserToken = item.user_token;
				if(!itemUserToken || itemUserToken.toUpperCase() != currnetUser)
					continue;	
				processRawItem(item);
			}	
			//console.log('END OF PARSING RESULTS');
		},
		updateData: function(rawResults, userToken)
		{		
			//RESET DATA
			itemArray = [];
			itemsByType = {};
			itemsByKeywordPair = {};	
			itemsByDate = {};	
			typedKeywords = {};
			itemsById = {};
			keywords = {};
			helper.extractData(rawResults, userToken);				
			//console.log('END OF PARSING RESULTS');
		},
		getKeywordStacks:function(type, dataId, isTopLevel, selectedTerm)
		{
			var result = undefined;
			if(AppEnum.events == type)
				result = getEventStack(dataId, isTopLevel, selectedTerm);
			else
				result = getStack(type, dataId, isTopLevel, selectedTerm);
			return result;
		},
		getItemsByDate:function()
		{
			itemsByDate = sortDateByTime(itemsByDate, false);
			return itemsByDate;
		},
		getItemsByKeywordPairByType:function(type)
		{
			var returnObj = getSortedList(type);
			return returnObj;
		},
		getTypedKeywords:function(type)
		{
			return typedKeywords[type];
		},
		getKeywords:function()
		{
			return keywords;
		},
		getDirtyItems: function()
		{
			var derties = [];
			for (var id in itemsById) 
			{
				var item = itemsById[id];
				if(item.isDirty)
				{
					derties.push(item);
					item.isDirty = false;
				}
		    }
			return derties;
		},
		validateItem:function(item, type)
		{
			var returnVal = isItemOfType(item, type, true);
			return returnVal;
		}
	};
	
	return helper;
		
});