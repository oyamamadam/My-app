// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log', "cls",
        'util/AppUtil',
        'util/TextUtil',
        "m/ModelAssist",
        "util/IchUtil",
        "iScroll5",
        "text!mainPane/stacks/StacksItem.html"],
        
function(log, cls, AppUtil, TextUtil, ModelAssist, IchUtil, iScroll, StacksItem)
{
	var stackParent = undefined;

    //define sScroll variable.

	var sScroll = undefined;

    //define totalWidth variable
    var totalWidth = undefined;
	var retryCount = undefined;
	var selectedStackId = undefined;
	var selectedNavItem = undefined;
	var stacks = undefined;
	var preserveState = undefined;

	// ( add by 15 21.05.2015
	if(typeof iScroll === 'undefined') iScroll = window.IScroll;
	// add by 15 21.05.2015 )

    function getKeywordObj(keywordsObj, picInfo)
    {
        var keywordPairs = picInfo.keyword_pairs;
        var n = keywordPairs.length;
        for(var i = 0; i < n; i++)
        {
            var pair = picInfo.keyword_pairs[i];
            if(pair == undefined)
                continue;
            var pairObj = keywordsObj[pair.toUpperCase()];
            if(pairObj == undefined)
            {
                var keywordType = TextUtil.getKeywordType(pair);
                var keywordVal = TextUtil.getKeywordVal(pair);
                if(keywordType == undefined || keywordVal == undefined || keywordVal == "*")
                    continue;
                pairObj = {picIds: {}, type: keywordType, keyword: keywordVal};
                keywordsObj[pair.toUpperCase()] = pairObj;
            }
            pairObj.picIds[picInfo.id] = picInfo.id;
        }
        return keywordsObj;
    }
	function buildStackObjs(picIds)
	{
		var n = (picIds) ? picIds.length : 0;
		var allStacks = {};
		var dateStacks = {};
		var keywordStacks = {};
		for(var i = 0; i < n; i++)
		{
			var picInfo = ModelAssist.getPicById(picIds[i]);
			allStacks[picInfo.id] = picInfo.id;
			var dateObj = dateStacks[picInfo.dateLabel];
			if(dateObj == undefined)
			{	
				dateObj = {picIds: {}, time: new Date(picInfo.fullYear, picInfo.month, picInfo.dayOfMonth).getTime()};
				dateStacks[picInfo.dateLabel] = dateObj;
			}
			dateObj.picIds[picInfo.id] = picInfo.id;
			keywordStacks = getKeywordObj(keywordStacks, picInfo);
 		}	
		appendStacks(AppUtil.getArrayFromObject(allStacks), AppUtil.getArrayFromObject(dateStacks), AppUtil.getArrayFromObject(keywordStacks));
	}


    function addDateStacks(dateStacks)
    {
        dateStacks.sort(TextUtil.sortStackByTime);
        var n = dateStacks.length;
        for(var i = 0; i < n; i++)
        {
            var dateStackObj = dateStacks[i];
            var stackLb = TextUtil.getStackDateLabel(dateStackObj.time);
            var picInfos = AppUtil.getArrayFromObject(dateStackObj.picIds);
            addStack(stackLb, picInfos.length, 'none', 'date', picInfos);
        }
    }
	function appendStacks(allPicIds, dateStackAry, keywordStackAry)
	{		
		addStack("ALL PHOTOS", allPicIds.length, 'none', 'all', allPicIds);		
		addDateStacks(dateStackAry);
		addKeywordStacks(keywordStackAry);	
		selectStack();
		updateScroll();
		dispatchStackNorofication();
	}
    function addKeywordStacks(keywordStacks)
	{
		keywordStacks.sort(TextUtil.sortStackByKeyword);
		var n = keywordStacks.length;
		for(var i = 0; i < n; i++)
		{
			var keywordObj = keywordStacks[i];
			var stackLb = keywordObj.keyword;
			var picInfos = AppUtil.getArrayFromObject(keywordObj.picIds);
			addStack(stackLb, picInfos.length, 'none', 'tag', picInfos);	
		}	
	}
	
	function addStack(stackLb, count, type, stackType, picIds)
	{
		totalWidth = totalWidth + 105;
		var stack = new cls.StackItem(stackLb, count, type, stackType, picIds);
		stacks[stack.uid] = stack;
		IchUtil.appendIchTemplate('noname', StacksItem, stackParent, stack);	
	}
	
	function updateScroll()
	{			
		stackParent.width(totalWidth - 5); // get width of every img			
				
		if(sScroll.scrollerWidth != totalWidth && retryCount < 10)
		{
			retryCount++;
			setTimeout(function()
			{
				updateScroll();
			}, 20);			
		}	
		else
		{
			var selectedStack = $(".stacksItem.selected", stackParent);
			var scrollToX = 0;
			
			if(sScroll && preserveState)
				scrollToX = sScroll.x;
			else if(selectedStack.length > 0)
				scrollToX = -parseInt(selectedStack[0].offsetLeft);			
			else if(sScroll.scrollerWidth < Math.abs(scrollToX))
				scrollToX = 0;
			
			sScroll.scrollTo(scrollToX, 0, 0);
			sScroll.refresh();
		}	
	}
	
	function selectStack()
	{
		var $stackItem = undefined;
		if(selectedNavItem.length == 0 || selectedNavItem.attr("level") < 3) //nothing selected
		{
			$stackItem = $(".stacksItem:first-child", stackParent);
		}	
		else if(preserveState == false || 1==1)
		{
			var keyword = selectedNavItem.attr("label");
			$stackItem = $(".stacksItem[stackKeyword='"+ keyword +"']", stackParent);
		}
		
		if($stackItem && $stackItem.length > 0)
		{
			$stackItem.addClass("selected");
			$("*", $stackItem).addClass("selected");
		}	
	}
	
	function dispatchStackNorofication()
	{
		setTimeout(function()
		{
			var $selectedStack = $(".stacksItem.selected", stackParent);
			$.event.trigger("stackChangeNotification", {selectedStack: stacks[$selectedStack.attr("id")]});
		}, 50);
	}
	
	var helper = {
        setView : function(e, data)
		{
			if(stackParent == undefined)
			{
				stackParent = $("#stacks", '#stack');
				sScroll = new iScroll("#stack",{ scrollX: true, scrollY: false, mouseWheel: false, scrollbars: 'custom', scrollbarClass: 'myScrollbar'});
			}					
			sScroll.scrollTo(sScroll.x, 0, 0);
			
			totalWidth = 0;
			retryCount = 0;
			stacks = {};
			stackParent.empty();
			selectedNavItem = $("#" + data.uid, "#contentPage #mainPane #refiner");
			preserveState = data.preserveState;
			
			var refinerItems = ModelAssist.getRefinerItems(data.type, [data.uid]);
				
			var n = refinerItems.length;
			var picIds = [];
			
			for(var i = 0; i < n; i++)
			{
				var rItem = refinerItems[i];
				var itemPicIds = rItem.picIds;
				picIds = picIds.concat(itemPicIds);
			}	
			buildStackObjs(picIds);
		},
		onStackTab : function()
		{
			var $this = $(this);
			var $thisId = $this.attr("id");
			if(selectedStackId == $thisId)
				return;
			
			$(".stacksItem", stackParent).removeClass('selected');
			$(".stacksItem *", stackParent).removeClass('selected');
			$this.addClass("selected");
			$("*", $this).addClass("selected");		
			
			dispatchStackNorofication();
		},
        refreshScroll : function()
        {
            sScroll.refresh();
        }
	};
	return helper;
});