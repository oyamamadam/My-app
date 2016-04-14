// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log','util/AppUtil','util/IchUtil', "text!mainPane/refiner/RefinerItem.html",
        "text!mainPane/refiner/RefinerItem1Child.html", "text!mainPane/refiner/RefinerItem2Child.html",
        "text!mainPane/refiner/RefinerSet.html", 'util/LayoutUtil',"mainPane/refiner/RefinerState",'enum/AppEnum',
        "m/ModelHelper", 'util/DateUtil', "m/ModelAssist", "iScroll5", 'cache'],
        
function(log, AppUtil, IchUtil, RefinerItem, RefinerItem1Child, RefinerItem2Child, RefinerSet, LayoutUtil, RefinerState, AppEnum, 
		ModelHelper, DateUtil, ModelAssist, iScroll, cache)
{
	var selectedRefinerItem3 = undefined;
	var selectedRefinerItem2 = undefined;
	var selectedRefinerItem1 = undefined;
	var preserveState = false;

	// ( add by 15 21.05.2015
	if(typeof iScroll === 'undefined') iScroll = window.IScroll;
	// add by 15 21.05.2015 )
	
	function setHashValues(tempItem)
	{
		if(tempItem == undefined)
		{
			alert("You Have No Photos.");
			return;
		}	
			
		var level = tempItem.attr("level"); // 1.2.3

        //rType parameter add !
        //add angular-moment.min. map file !
        //add angular-animation.min.map file add
		var rType = tempItem.attr("type"); // 1.2.3
		if(level == 3)
		{
			selectedRefinerItem3 = tempItem;
			selectedRefinerItem2 = $('#' + selectedRefinerItem3.attr('parentId'), "#contentPage #contentBody #mainPane #refiner #lCol #" + rType);
			selectedRefinerItem1 = $('#' + selectedRefinerItem2.attr('parentId'), "#contentPage #contentBody #mainPane #refiner #lCol #" + rType);								
		}	
		else if(level == 2)
		{
			selectedRefinerItem3 = undefined;
			selectedRefinerItem2 = tempItem;
			selectedRefinerItem1 = $('#' + selectedRefinerItem2.attr('parentId'), "#contentPage #contentBody #mainPane #refiner #lCol #" + rType);
		}	
		else
		{
			selectedRefinerItem3 = undefined;
			selectedRefinerItem2 = undefined;
			selectedRefinerItem1 = tempItem;
		}
	}
	
	var helper = {		
		setView: function()
		{
			setEvents();
			setSetData(AppEnum.places, ModelAssist.getTypedCollection(AppEnum.places));
			setSetData(AppEnum.people, ModelAssist.getTypedCollection(AppEnum.people));
			setSetData(AppEnum.entities, ModelAssist.getTypedCollection(AppEnum.entities));
			setSetData(AppEnum.favorites, ModelAssist.getTypedCollection(AppEnum.favorites));
			updateAllScrolls();
			helper.externalSelection();
			AppUtil.showLoader(false);
		},
		setDefaultView:function()
		{
			RefinerState.selectedUID = 0;
			selectedRefinerItem3 = undefined;
			selectedRefinerItem2 = undefined;
			selectedRefinerItem1 = undefined;
			var eventsHeader = $('.setHeader', "#contentPage #contentBody #mainPane #refiner #lCol #events");
			onHeaderClick(eventsHeader, true);
			setDefaultSelection(true);				
			resetAllScrolls();
		},
		setStaticView:function()
		{
			setStaticView();
			setDefault();
		},
		onIndexing : function()
		{
			dispatchRefinerChangeEvent("", "*", undefined);
		},
		onForceRefinerChange : function(type)
		{
			//dispatchRefinerChangeEvent("", "*");
		},
		onRefinerItem: function()
		{
			setHashValues($(this));			
			onItemClick($(this));
		},
		onHeaderClick: function()
		{
			var $this = $(this);
			onHeaderClickHandler($this, true);
		},
		selectSelected : function()
		{
			preserveState = true;
			if(selectedRefinerItem1 != undefined || selectedRefinerItem2 != undefined)
			{
				var iType = (selectedRefinerItem1 && selectedRefinerItem1.length > 0) ? "#" + selectedRefinerItem1.attr("type").toLowerCase() : undefined;
				if(iType == undefined)
					iType = (selectedRefinerItem2 && selectedRefinerItem2.length > 0) ? "#" + selectedRefinerItem2.attr("type").toLowerCase() : undefined;				
				var level1Lb = (selectedRefinerItem1) ? selectedRefinerItem1.attr('label') : undefined;
				var level2Lb = (selectedRefinerItem2) ? selectedRefinerItem2.attr('label') : undefined;
				var level3Lb = (selectedRefinerItem3) ? selectedRefinerItem3.attr('label') : undefined;
				var rItems = $(".iscrollWrapper .setBody .refinerItem", "#contentPage #contentBody #mainPane #refiner #lCol " + iType);
				var n = (rItems) ? rItems.length : 0;	
				setSelectedState(iType, level1Lb, level2Lb, level3Lb, rItems, n);
			}
			else//nothing is selected, lets get opened refiner set
			{
				var setItems = $(".refinerSet", "#contentPage #contentBody #mainPane #refiner #lCol");
				var n = setItems.length; // should be 4
				for(var i = 0; i < n; i++)
				{
					var $set = $(setItems[i]);
					var setHeight = $set.height();
					var setId = $set.attr('id');
					if(setHeight > 45) //height of header
					{
						onHeaderClick($('.setHeader', $set), true);
						break;
					}	
				}	
			}
		},
		externalSelection : function()
		{			
			setTimeout(function()
			{
				var searchItem = $("#searchInput", "#header").val();
				if(searchItem.length > 0)
				{
					var rItems = $(".refinerItem", "#contentPage #contentBody #mainPane #refiner #lCol");
					var n = rItems.length;
					
					for(var i = 0; i < n; i++)
					{
						var tRItem = $(rItems[i]);
						var lb = tRItem.attr("label");
						if(lb.indexOf(searchItem) > -1)
						{
							var type = tRItem.attr("type");
							invokeRefinerSelection(type, tRItem);
							return;
						}	
					}
				}	
			}, 50);
		}
	};

	function invokeRefinerSelection(type, refinerItem)
	{
		var typeHeader = $('.setHeader', "#contentPage #contentBody #mainPane #refiner #lCol #" + type);
		onHeaderClickHandler(typeHeader, false);
		setHashValues(refinerItem);			
		onItemClick(refinerItem);
		resetAllScrolls();
	}
	
	function onHeaderClickHandler($this, notify)
	{
		var parent = $this[0].parentNode;
		var countAttr = $(parent).attr('count');
		var count = (countAttr) ? parseInt(countAttr) : 0;
		if(count > 0)
		{
			onHeaderClick($this, notify);
			selectedRefinerItem3 = undefined;
			selectedRefinerItem2 = undefined;
			selectedRefinerItem1 = undefined;
		}	
	}
	
	function setSelectedState(iType, level1Lb, level2Lb, level3Lb, rItems, n)
	{
		var level1Item = undefined;
		var level2Item = undefined;
		var level3Item = undefined;
		
		for(var i = 0; i < n; i++)
		{
			var rItem = $(rItems[i]);
			var rLb = rItem.attr('label');
			var rLevel = rItem.attr('level');
			if(rLevel == 1 && level1Item == undefined && level1Lb != undefined)
			{
				if(rLb == level1Lb)
					level1Item = rItem;
			}	
			if(rLevel == 2 && level2Item == undefined && level2Lb != undefined && (level1Lb == undefined || level1Item != undefined))
			{
				if(rLb == level2Lb)
					level2Item = rItem;
			}
			if(rLevel == 3 && level3Item == undefined && level3Lb != undefined && (level2Lb == undefined || level2Item != undefined))
			{
				if(rLb == level3Lb)
					level3Item = rItem;
			}
		}	
		selectedRefinerItem3 = level3Item;
		selectedRefinerItem2 = level2Item;
		selectedRefinerItem1 = level1Item;
		
		if(selectedRefinerItem3)
			onItemClick(selectedRefinerItem3);
		else if(selectedRefinerItem2)
			onItemClick(selectedRefinerItem2);
		else if(selectedRefinerItem1)
			onItemClick(selectedRefinerItem1);
	}
	
	var oneTime = true;
	function appendRefinerHeader(titleTxt, countTxt)
	{
		var titleLb = titleTxt;
		if(titleTxt == AppEnum.entities)
		{
			var entitiesCacheText = cache.getValue(AppEnum.ENTITY_NAME);
			if(entitiesCacheText)
				titleLb = entitiesCacheText;
		}	
		
		if(titleTxt == AppEnum.places)
			titleLb = AppEnum.placesTxt;
		var div = $("#"+titleTxt, "#refiner");
		if(div.length == 0)//  First Time only
			IchUtil.appendIchTemplate('refinerSet', RefinerSet, $('#refiner > #lCol', "#contentBody"),{title: titleLb.toUpperCase(), id: titleTxt});
		div = $("#"+titleTxt, "#refiner");// now just update the count
		div.attr("count", countTxt);
		var countDiv = $(".headerCount", div);
		countDiv.html("(" + countTxt + ")");		
		countDiv.attr("count", countTxt);		
		if(countTxt == 0) // Close if there are no results. 
			setOpen(titleTxt, false);
	};
	
	function setSetData(type, refinerItem) 
	{		
		appendRefinerHeader(type, refinerItem.count);
		var setOwner = $("#" + type + " .setBody", "#refiner");	
		setOwner.empty();
		var n = (refinerItem.children) ? refinerItem.children.length : 0;		
		for(var i = 0; i < n; i++)
		{
			var charRefinerItem = refinerItem.children[i];	
			var lb = charRefinerItem.label;
		    var m = (charRefinerItem.children) ? charRefinerItem.children.length : 0;
		    for(var j = 0; j < m; j++)
			{
				var keywordRefinerItem = charRefinerItem.children[j];	
				if(lb)
				{
					keywordRefinerItem.charLb = lb;
					lb = undefined;
				}
				keywordRefinerItem.parentId = charRefinerItem.uid;				
				addNewItem(keywordRefinerItem, setOwner, RefinerItem2Child);
			}
		}		
	};
	
	function setEvents() 
	{
		var type = AppEnum.events;
		var itemsByDate = ModelAssist.getTypedCollection(type);
		appendRefinerHeader(type, itemsByDate.count); // adding or updating header Tab
		
		var setOwner = $("#" + type + " .setBody", "#refiner");	
		setOwner.empty();
		var n = (itemsByDate.children) ? itemsByDate.children.length : 0;
		for(var i = 0; i < n; i++)
		{
			var yyyyRefinerItem = itemsByDate.children[i];	
			addNewItem(yyyyRefinerItem, setOwner, RefinerItem);
		    var m = (yyyyRefinerItem.children) ? yyyyRefinerItem.children.length : 0;
		    for(var j = 0; j < m; j++)
			{
				var mmRefinerItem = yyyyRefinerItem.children[j];	
				var mmIdx = parseInt(mmRefinerItem.label);
				mmRefinerItem.label = AppEnum.months[mmIdx];	
				mmRefinerItem.parentId = yyyyRefinerItem.uid;
				addNewItem(mmRefinerItem, setOwner, RefinerItem1Child);
				var o = (mmRefinerItem.children) ? mmRefinerItem.children.length : 0;
				for(var k = 0; k < o; k++)
				{
					var stackItem = mmRefinerItem.children[k];
					stackItem.parentId = mmRefinerItem.uid;
					if(stackItem && stackItem.type == AppEnum.events)
						addNewItem(stackItem, setOwner, RefinerItem2Child);
				}	
			}
		}
	};
	
	function addNewItem(refinerDateItem, setDiv, template)
	{
		refinerDateItem.width = (refinerDateItem.count >= 50) ? 100 : refinerDateItem.count * 2;
		refinerDateItem.dotClass = (refinerDateItem.count >= 50) ? 'visible' : '';
		if(refinerDateItem.label == AppEnum.stared)
			refinerDateItem.lbTxt = "My Favorites";
		else
			refinerDateItem.lbTxt = refinerDateItem.label;
		
		IchUtil.appendIchTemplate('noname', template, setDiv, refinerDateItem);
	};
	
	var scrolls = {};
	function setScroll(setOwnerName)
	{
		var setOwner = $("#" + setOwnerName + " .iscrollWrapper", "#refiner");	
		if(setOwner.attr("id") == undefined)
			setOwner.attr("id", AppUtil.UIID);
		var sId = "#" +  setOwner.attr("id");
		var tmpScroll = scrolls[setOwnerName];
		
		if(tmpScroll)
		{
			tmpScroll.destroy();
		}	
			
		scrolls[setOwnerName] = new iScroll(sId,{ scrollX: false, scrollY: true, mouseWheel: false, scrollbars: 'custom'});
	};
	
	function updateAllScrolls()
	{   
		var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities];
		for(var i = 0; i < sets.length; i++)
		{
			var s = scrolls[sets[i]];
			if(s)
			{
				s.refresh();
			}	
			else
			{
				setScroll(sets[i]);
			}	
		}
	}
	
	function resetAllScrolls()
	{
		var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities, AppEnum.favorites];
		for(var i = 0; i < sets.length; i++)
		{
			var s = scrolls[sets[i]];
			if(s)
				s.scrollTo(0, 0, 0);
		}
	}
	
	function setDefault()
	{
		if(oneTime)
		{
			updateAllScrolls();
			oneTime = false;
			setDefaultSelection(false);
		}	
	};
	
	function setDefaultSelection(invokeClick)
	{
		var firstItem = $("#events .refinerItem:first-child", '#refiner');			
		var nd2Item = $("#events .refinerItem:nth-child(2)", '#refiner');
		var nd2Level = nd2Item.attr('level');
		var item = undefined;
		
		if(nd2Item.length > 0 && nd2Level == '2')
			item = nd2Item;
		else if(firstItem.length > 0)
			item = firstItem;
		
		setHashValues(item);
		if(invokeClick)
			onItemClick(item);
	}	
	
	function onItemClick(clickedItem)
	{		
		var iType = clickedItem.attr("type");
		var iLb = clickedItem.attr("label");
		var uiId = clickedItem.attr("id");
		var selectedUID = RefinerState.selectedUID;
		
		removeSelectedState();
		
		if(selectedUID == uiId) // clicked on the same item// unselect all.
		{			
			RefinerState.selectedUID = 0;
			iLb = "*";
			uiId = undefined;
			selectedRefinerItem3 = undefined;
			selectedRefinerItem2 = undefined;
			selectedRefinerItem1 = undefined;
		}
		else
		{
			RefinerState.selectedUID = uiId;
			addSelectedState(clickedItem);		
		}	
		dispatchRefinerChangeEvent(iType, iLb, uiId);
	}
	
	function onHeaderClick($this, notify)
	{
		//removeSelectedState();
		var parent = $this[0].parentNode;
		var parentId = parent.id;
		if(RefinerState.canClose(parentId))
		{
			var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities, AppEnum.favorites];
			for(var i = 0; i < sets.length; i++)
			{
				setOpen(sets[i], false);// close all
			}	
			toggleOpen(parentId);
			setSecIcon(parentId);
			setStaticView(true);
		}	
		//if(notify)
		//	dispatchRefinerChangeEvent(parentId, '*', undefined);
	}
	
	function removeSelectedState()
	{
		$(".refinerItem").removeClass("selected");
		$(".refinerItem *").removeClass("selected"); // from all Children		
	}	
	
	function addSelectedState(clickedItem)
	{
		var id = clickedItem.attr('id');	
		clickedItem.addClass("selected");
		$("#" + id + " *", "#refiner").addClass("selected");// add selected state to all Children
	}
	
	function toggleOpen(ownerName)
	{
		RefinerState.open[ownerName] = !RefinerState.open[ownerName];
	}

	function setOpen(ownerName, val)
	{
		RefinerState.open[ownerName] = val;
	}	
	
	function isOpen(ownerName)
	{
		var div = $("#"+ownerName, "#refiner");
		var count = $(div).attr("count");
		if(count == 0)
			setOpen(ownerName, false);
		return RefinerState.open[ownerName];
	}
	
	function setSecIcon(secName)
	{
		var div = $("#"+secName, "#refiner");
		var count = $(div).attr("count");
		var iconDiv = $(".iconDiv", div);
		if(count == 0)
		{
			$(iconDiv).removeClass("fa-chevron-down");
			$(iconDiv).removeClass("fa-chevron-right");		
		}
		else if(isOpen(secName))
		{
			$(iconDiv).removeClass("fa-chevron-down");
			$(iconDiv).addClass("fa-chevron-right");
		}
		else
		{
			$(iconDiv).addClass("fa-chevron-down");
			$(iconDiv).removeClass("fa-chevron-right");	
		}
	}	
	
	function setStaticView(ignoreSelectedState)
	{
		if(ignoreSelectedState == true)
		{
			//Do Nothing
		}
		else
		{
			removeSelectedState();
		}
			
		var sets = [AppEnum.events, AppEnum.places, AppEnum.people, AppEnum.entities, AppEnum.favorites];
		var openCount = 0;
		for(var i = 0; i < sets.length; i++)
		{
			if(isOpen(sets[i]))
				openCount++;
		}
		
		var minHeight = LayoutUtil.getMinRefinerSectionHeight(openCount);			
		
		for(i = 0; i < sets.length; i++)
		{
			var setOwner = $("#" + sets[i] + " .iscrollWrapper", "#refiner");
			if(isOpen(sets[i]))
			{
				$(setOwner).height(minHeight);
			}
			else
			{				
				$(setOwner).height(0);
			}		
		}
		
		for(i = 0; i < sets.length; i++)
		{
			setSecIcon(sets[i]);
		}
		updateAllScrolls();
	}
	
	function dispatchRefinerChangeEvent(itemType, term, uid)
	{
		AppUtil.showLoader(true);
		setTimeout(function()
		{
			RefinerState.selectedTerm = term;
			$.event.trigger("refinerChange", {type: itemType, term: term, uid:uid, preserveState : preserveState});
			preserveState = false;
		}, 50);
		
	}
	
	return helper;
});