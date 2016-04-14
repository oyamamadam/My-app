define(['log',
        'util/DateUtil',
        'util/TextUtil',
        'enum/AppEnum',
        'adptr/DeviceAdaptor',
        'util/AppUtil',
        "cls",
        "m/ModelAssistHelper"],

function(log, DateUtil, TextUtil, AppEnum, DeviceAdaptor, AppUtil, cls, ModelAssistHelper)
{
	var keywords = {};
	var keywordArray = undefined;
	var typedKeywords = {};
	var objectsById = {};
	var refinerData = {};
	var _totalCount = undefined;

	function getDirtyObject(picInfo)
	{
		var obj = {};
		obj.SourceFile = picInfo.source_file;
		obj.CreateDate = picInfo.create_date;
		obj.GPSPosition = picInfo.gps_position;
		obj.Keywords = picInfo.keyword_pairs;
		obj.Keywords.push("APPDATA:WIDTH|" + picInfo.orgWidth);
		obj.Keywords.push("APPDATA:HEIGHT|" + picInfo.orgHeight);
		obj.id = picInfo.id;
        //console.log("picInfo.create_date: " + picInfo.create_date);
		return obj;
	}

	function buildKeywordArray()
	{
		var item = undefined;
		var items =[];
		for(var keyword in keywords)
		{
			item = keywords[keyword];
			items.push(item);
		}
		keywordArray = items.sort(TextUtil.sortByString);
	}

	function processRawItem(rawData)
	{
		var rawDataId = rawData.id;
		var picInfo = objectsById[rawDataId];
		if(picInfo == undefined)
		{
			picInfo = new cls.PicInfo(rawData);
			objectsById[picInfo.id] = picInfo;
		}
		picInfo.update(rawData);
		picInfo.isFav = helper.isFavorites(rawDataId);
		if(picInfo.isDeleted == false)
			_totalCount++;
	}

	function getTopLevelRefnerItem(type, order)
	{
		if(refinerData[type])
			return refinerData[type];
		refinerData[type] = new cls.RefinerItem(type.toUpperCase(), 0, order, type);
		return getTopLevelRefnerItem(type);
	}

	function buildDateBasedRefinerData()
	{
		var eventsItem = getTopLevelRefnerItem(AppEnum.events, 0);
		eventsItem.count = _totalCount;
		var itemsByDate = ModelAssistHelper.getItemsByDate(objectsById);
		eventsItem.children = itemsByDate;
	}

	function buildAlphabeticRefinerData(item)
	{
		var items = ModelAssistHelper.getAlphabeticItems(objectsById, item.type);
		item.children = items;
		item.count = ModelAssistHelper.getLastCount();
	}

	function buildRefinerData()
	{
		buildDateBasedRefinerData();
		buildAlphabeticRefinerData(getTopLevelRefnerItem(AppEnum.places, 1));
		buildAlphabeticRefinerData(getTopLevelRefnerItem(AppEnum.people, 2));
		buildAlphabeticRefinerData(getTopLevelRefnerItem(AppEnum.entities, 3));
		buildAlphabeticRefinerData(getTopLevelRefnerItem(AppEnum.favorites, 4));
	}

	function processKeywords(item)
	{
		if(item.isDeleted)
			return;
		var pairs = item.keyword_pairs;
		var n = (pairs) ? pairs.length : 0;
		for(var i = 0; i < n; i++)
		{
			var pairStr = pairs[i];
			var pair = (pairStr) ? pairStr.split(":") : undefined;
			if(pair == undefined)
				continue;

			var kType = pair[0].toLowerCase();
			if(kType && kType.toUpperCase() == "APPDATA")
				continue;

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
				keywordObj = {count: 0, tagId: uId, label: keyword, type: kType};
				typeObj[keyword] = keywordObj;
				keywords[keyword] = keywordObj;
			}
			keywordObj.count++;
		}
	}

	function extractPicInfoFromRefinerItems(refinerItems)
	{
		var picIdHash = {};
		var picInfos = [];
		var n = (refinerItems) ? refinerItems.length : 0;
		for(var i = 0; i < n; i++)
		{
			var picIds = refinerItems[i].picIds;
			var m = (picIds) ? picIds.length : 0;
			for(var j = 0; j < m; j++)
			{
				var picId = picIds[j];
				if(picIdHash[picId] == undefined)
				{
					picIdHash[picId] = picId;
					picInfos.push(objectsById[picId]);
				}
			}
		}

		return picInfos.sort(TextUtil.sortByCreationTime);
	}

	var helper = {
		isDirty : false,
		parseData: function(rawResults)
		{
			objectsById = {};
			_totalCount = 0;
			var n = (rawResults) ? rawResults.length : 0;
			var item = undefined;
			for(var i = 0; i < n; i++)
			{
				item = rawResults[i];

				// ( add by 15 21.05.2015
				if(item.source_file == null || item.device_id == null) continue;
				// add by 15 21.05.2015 )

				processRawItem(item);
				processKeywords(item);
			}
			//We now have all results in objectsBy ID. Lets build Refiner:
			buildRefinerData();
			buildKeywordArray();
		},
		getTypedCollection : function(type)
		{
			var topItem = getTopLevelRefnerItem(type, 0);
			return topItem;
		},
		getKeywords : function()
		{
			return keywords;
		},
		getObjectsById : function()
		{
			return objectsById;
		},
		getKeywordList : function()
		{
			return keywordArray;
		},
		getRefinerItems : function(type, uids)
		{
			var topItem = getTopLevelRefnerItem(type, 0);
			var refinerItems = ModelAssistHelper.getRefinerItems(topItem, uids);
			return refinerItems;
		},
		getPicInfoFor : function(uids)
		{
			var refinerItems = [];
			var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities, AppEnum.favorites];
			for(var i = 0; i < sets.length; i++)
			{
				var topItem = getTopLevelRefnerItem(sets[i], 0);
				var tempRefinerItems = ModelAssistHelper.getRefinerItems(topItem, uids);
				refinerItems = refinerItems.concat(tempRefinerItems);
			}
			return extractPicInfoFromRefinerItems(refinerItems);
		},
		getPicById : function (id)
		{
			return objectsById[id];
		},
		addKeywrod : function (keyword, type)
		{
			if(keywords[keyword] == undefined)
			{
				var keyObj = {count: 0, label: keyword, type: type, tagId: AppUtil.UIID(), newCls: "hl"};
				keywords[keyword] = keyObj;
				helper.isDirty = true;
				buildKeywordArray();
			}
		},
		removePicKeywordsFromFavorites: function (uid)
		{
			if(helper.hasFavorites(uid))
			{
				var picInfo = objectsById[uid];
				var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;

				for(var i = 0; i < n; i++)
				{
					var pair = picInfo.keyword_pairs[i];
					var pairType = TextUtil.getKeywordType(pair);
					var pairKeyword = TextUtil.getKeywordVal(pair);
					if(pairType && pairType.toLowerCase() == AppEnum.favorites)
						helper.removeKeywordFromPicInfo(uid, pairKeyword, pairType);
				}
			}
		},
		addPicKeywordsToFavorites: function (uid)
		{
			if(helper.hasFavorites(uid))
				return;

			var picInfo = objectsById[uid];
			var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;

			for(var i = 0; i < n; i++)
			{
				var pair = picInfo.keyword_pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				var pairKeyword = TextUtil.getKeywordVal(pair);
				if(pairType)
					helper.addKeywordToPicInfo(uid, pairKeyword, AppEnum.favorites);
			}
		},
		addPicToFavorites: function (uid)
		{
			if(helper.isFavorites(uid))
				return;

			helper.addKeywordToPicInfo(uid, AppEnum.stared, AppEnum.favorites);
		},
		removePicFromFavorites: function (uid)
		{
			if(helper.isFavorites(uid))
			{
				helper.removeKeywordFromPicInfo(uid, AppEnum.stared, AppEnum.favorites);
			}
		},
		addPicToTrash: function (uid)
		{
			helper.addKeywordToPicInfo(uid, AppEnum.TRASHED + "|true", AppEnum.APPDATA);
		},
		removePicFromTrash: function (uid)
		{
			if(helper.isTrash(uid))
			{
				helper.removeKeywordFromPicInfo(uid, AppEnum.TRASHED + "|true", AppEnum.APPDATA);
			}
		},
		hasFavorites : function(uid)
		{
			var picInfo = objectsById[uid];
			var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;
			for(var i = 0; i < n; i++)
			{
				var pair = picInfo.keyword_pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				if(pairType && pairType.toLowerCase() == AppEnum.favorites)
					return true;
			}
			return false;
		},
		isFavorites : function(uid)
		{
			var picInfo = objectsById[uid];
			var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;
			for(var i = 0; i < n; i++)
			{
				var pair = picInfo.keyword_pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				var pairKeyword = TextUtil.getKeywordVal(pair);
				if(pairType && pairType.toLowerCase() == AppEnum.favorites)
				{
					if(pairKeyword == AppEnum.stared)
						return true;
				}
			}
			return false;
		},
		isTrash : function(uid)
		{
			var picInfo = objectsById[uid];
			return picInfo.isDeleted;
		},
		addKeywordToPicInfo : function (uid, keyword, type)
		{
			var picInfo = objectsById[uid];
			var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;
			var keywordAlreadyExists = false;
			for(var i = 0; i < n; i++)
			{
				var pair = picInfo.keyword_pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				var pairKeyword = TextUtil.getKeywordVal(pair);
				if(pairType && pairType.toLowerCase() == type.toLowerCase())
				{
					if(pairKeyword && pairKeyword.toLowerCase() == keyword.toLowerCase())
					{
						keywordAlreadyExists = true;
						break;
					}
				}
			}

			if(keywordAlreadyExists == false)
			{
				picInfo.keyword_pairs.push(type + ':' + keyword);
				picInfo.keywords.push(keyword);
				picInfo.isDirty = true;
				helper.isDirty = true;
			}
		},
		removeKeywordFromPicInfo : function (uid, keyword, type)
		{
			var picInfo = objectsById[uid];
			picInfo.isDirty = true;
			var n = (picInfo.keyword_pairs) ? picInfo.keyword_pairs.length : 0;
			for(var i = 0; i < n; i++)
			{
				var pair = picInfo.keyword_pairs[i];
				var pairType = TextUtil.getKeywordType(pair);
				var pairKeyword = TextUtil.getKeywordVal(pair);
				if(pairType && pairType.toLowerCase() == type.toLowerCase())
				{
					if(pairKeyword && pairKeyword.toLowerCase() == keyword.toLowerCase())// DELETE
					{
						delete picInfo.keyword_pairs[i];
						break;
					}
				}
			}
			var n = (picInfo.keywords) ? picInfo.keywords.length : 0;
			for(i = 0; i < n; i++)
			{
				var key = picInfo.keywords[i];
				if(key && key.toLowerCase() == keyword.toLowerCase())// DELETE
				{
					delete picInfo.keywords[i];
					helper.isDirty = true;
					break;
				}
			}
		},

		removeKeywordFromAll : function(keyword, type)
		{
			helper.isDirty = true;
			delete keywords[keyword];
			for(var uid in objectsById)
			{
				helper.removeKeywordFromPicInfo(uid, keyword, type);
			}
			buildKeywordArray();
		},

		getDirtyObject : function()
		{
			var documents = [];
			for(var id in  objectsById)
			{
				var picInfo = objectsById[id];
				if(picInfo.isDirty)
					documents.push(getDirtyObject(picInfo));
			}
			var dirtyObject = {"Documents":documents};
			return dirtyObject;
 		},

 		getKeywordOnName : function(keyword)
 		{
 			return keywords[keyword];
 		},

 		getObjectsByPath : function()
 		{
 			var obj = {};
 			for(var id in objectsById)
 			{
 				var item = objectsById[id];
 				obj[item.source_file] = item;
 			}
 			return obj;
 		}
	};

	return helper;
});



//function validateDirtyState()
//{
//	validationTimerRunning = false;
//	var dirtyItems = ModelHelper.getDirtyItems();
//	var documents = [];
//	var n = (dirtyItems) ? dirtyItems.length : 0;
//
//	for(var i = 0; i < n; i++)
//	{
//		var item = dirtyItems[i];
//		documents.push(getDirtyObject(item));
//	}
//
//	if(n > 0)
//	{
//		var updateObj = {};
//		updateObj["UserToken"] = model.userEmail;
//		updateObj["DeviceId"] = DeviceAdaptor.deviceId;
//		updateObj["Documents"] = documents;
//		model.update(updateObj);
//		AppUtil.showLoader(true);
//	}
//}
//
//function getDirtyObject(item)
//{
//	var obj = {};
//	obj.SourceFile = item.source_file;
//	obj.CreateDate = item.create_date;
//	obj.GPSPosition = item.gps_position;
//	obj.Keywords = item.keyword_pairs;
//	obj.id = item.serverSideId;
//	return obj;
//}