// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['util/IchUtil',
        'util/AppUtil',
        'adptr/DeviceAdaptor',
        "m/ModelAssist",
        'util/TextUtil',
        'util/LayoutUtil',
        'util/ScrollUtil',
        'enum/AppEnum',
        "model",
        "text!mainPane/view_pane/ViewPaneTagItem.html",
        "mainPane/tag/TagSuggestions"],

function(IchUtil, AppUtil, DeviceAdaptor, ModelAssist, TextUtil, LayoutUtil, ScrollUtil, AppEnum, model, ViewPaneTagItemHTML, TagSuggestions)
{
	var pageHeight = undefined;
	var vpDiv = undefined;
	var hScroll = undefined;
	var vpItem1 = undefined;
	var vpItem2 = undefined;
	var vpItem3 = undefined;
	var vpItem4 = undefined;
	var vpItem5 = undefined;
	var dataProvider = undefined;
	var picHeight = undefined;

    function setInitChildState(startPos)
    {
        if(startPos == 0)
        {
            var dpItem1 = dataProvider[startPos + 'px'];
            var dpItem2 = (dpItem1) ? dataProvider[dpItem1.vpNextIdx + 'px'] : undefined;
            var dpItem3 = (dpItem2) ? dataProvider[dpItem2.vpNextIdx + 'px'] : undefined;
            var dpItem4 = (dpItem3) ? dataProvider[dpItem3.vpNextIdx + 'px'] : undefined;
            var dpItem5 = (dpItem4) ? dataProvider[dpItem4.vpNextIdx + 'px'] : undefined;
            vpItem1.css('left', (dpItem1) ? dpItem1.vpIdx : 0);
            vpItem2.css('left', (dpItem2) ? dpItem2.vpIdx : 0);
            vpItem3.css('left', (dpItem3) ? dpItem3.vpIdx : 0);
            vpItem4.css('left', (dpItem4) ? dpItem4.vpIdx : 0);
            vpItem5.css('left', (dpItem5) ? dpItem5.vpIdx : 0);
            updateItem(vpItem1);
            updateItem(vpItem2);
            updateItem(vpItem3);
            updateItem(vpItem4);
            updateItem(vpItem5);
        }
    }

	function updateScroll(newWidth, scrollToX)
	{
		hScroll.scrollTo(-scrollToX, 0, 0);
		var lastScrollX = scrollToX;

		ScrollUtil.updateScroll(vpDiv, hScroll, newWidth, pageHeight, 10, function()
		{
			setInitChildState(scrollToX);
			$.event.trigger("imagesLoaded");
		});
	}


	function updateItem(item)
	{
		var idx = item.css("left");
//        console.log("idx is " + idx);
		var picInfo = dataProvider[idx];
		var vpImg = $(".vpImg", item);

		if(picInfo == undefined)
		{
			vpImg.attr("src", "");
			vpImg.width(0);
			item.hide();
			return;
		}
		else
		{
			item.show();
			// ( add by 15 21.05.2015
			//if(DeviceAdaptor.inBrowser) // for browser testing
			//	picInfo.source_file = "http://placekitten.com/" + picInfo.vpWidth + '/' + picHeight;
			// add by 15 21.05.2015 )

			var isSelected = picInfo.selected;
			if(isSelected)
				item.addClass("selected");
			else
				item.removeClass("selected");
			vpImg.attr("src", picInfo.source_file);
			item.attr("picId", picInfo.id);


            item.width(picInfo.vpWidth);


       //BH:  Size image to fit in window.
       var imgWidth = picInfo.orgWidth;
       var imgHeight = picInfo.orgHeight;
       var ratio = (LayoutUtil.picHeight / imgHeight);

//       var ratio = [LayoutUtil.picWidth / imgWidth, LayoutUtil.picHeight / imgHeight];
//       ratio = Math.min(ratio[0], ratio[1]);  //to set ratio to vertical as well
       vpImg.width(imgWidth*ratio);
       vpImg.height(imgHeight*ratio);



			previewItemTags(item, picInfo);
			setFavState(item);
		}
	}

	function previewItemTags(vpItem, picInfo)
	{
		var pairs = picInfo.keyword_pairs;
		var m = (pairs) ? pairs.length : 0;
		var $vpTagDiv = $(".vpTagDiv", vpItem);
		$vpTagDiv.empty();
		var keyObjs = [];
		var kwObj = {};
		for(var j = 0; j < m; j++)
		{
			var pair = pairs[j];
			kwObj = {};
			kwObj.type =  TextUtil.getKeywordType(pair);
			kwObj.keyword =  TextUtil.getKeywordVal(pair);
			if(kwObj.keyword == AppEnum.stared)
				continue;
			if(TextUtil.stringHasValue(kwObj.keyword))
			{
				kwObj.type = kwObj.type.toLowerCase();
				kwObj.bgClass = kwObj.type + "BGColor";
				kwObj.type = kwObj.type;
				kwObj.picId = picInfo.id;
				keyObjs.push(kwObj);
			}
		}
		keyObjs.sort(TextUtil.sortStackByKeyword);
		m = keyObjs.length;
		for(var i = 0; i < m; i++)
		{
			kwObj = keyObjs[i];
			IchUtil.appendIchTemplate('noname', ViewPaneTagItemHTML, $vpTagDiv, kwObj);
		}
	}

	function setPictureKeywrods()
	{
		var n = (visiblePicInfo) ? visiblePicInfo.length : 0;
		for(var i = 0; i < n; i++)
		{
			var picInfo = visiblePicInfo[i];
			var pairs = picInfo.keyword_pairs;
			var m = (pairs) ? pairs.length : 0;
			var $vpTagDiv = $(".vpTagDiv", "#" + picInfo.uid);
			$vpTagDiv.empty();
			for(var j = 0; j < m; j++)
			{
				var pair = pairs[j];
				var kwObj = {};
				kwObj.type =  TextUtil.getKeywordType(pair);
				kwObj.keyword =  TextUtil.getKeywordVal(pair);
				if(kwObj.keyword == AppEnum.stared)
					continue;

				if(TextUtil.stringHasValue(kwObj.keyword))
				{
					kwObj.type = kwObj.type.toLowerCase();
					kwObj.bgClass = kwObj.type + "BGColor";
					kwObj.type = kwObj.type;
					kwObj.picId = picInfo.id;
					IchUtil.prependIchTemplate('noname', ViewPaneTagItemHTML, $vpTagDiv, kwObj);
				}
			}
		}
	}

	var waiting = false;
	var maxRetryCount = 10;
	function onScroll()
	{
		if(waiting)
			return;
		waiting = true;
		maxRetryCount = 10;
		setTimeout(function()
		{
			onScrolling(hScroll.x);
			waiting = false;
		}, 150);
	}

	function onScrollEnd()
	{

       // if I need to add longer wait of 5 seconds, might need to add additional logic
		onScrolling(hScroll.x);
		setTimeout(function()
		{
			onScrolling(hScroll.x);
		}, 150);
	}

	function onScrolling(scrollX)
	{
		var positions = [vpItem1, vpItem2, vpItem3, vpItem4, vpItem5];
		positions.sort(TextUtil.sortonPosition);
		var firstItem = positions[0];
		var midLeftItem = positions[1];
		var midItem = positions[2];
		var midRightItem = positions[3];
		var lastItem = positions[4];
		var currentScrollX = Math.abs(scrollX);

		//console.log("maxRetryCount= " + maxRetryCount + "::::" + firstItem.position().left + ", " + midLeftItem.position().left +
		//		", " + midItem.position().left + ", " + midRightItem.position().left + ", " + lastItem.position().left + ", x = " + currentScrollX);

		if(midItem.position().left > currentScrollX) //scrolling left
		{
			var canMoveLeft = (midRightItem.position().left > currentScrollX);
			if(canMoveLeft)
			{
				scrollLeftHandler(firstItem, lastItem);
			}
		}
		else if(midRightItem.position().left < currentScrollX)
		{
			var canMoveRight = (midLeftItem.position().left < currentScrollX);
			if(canMoveRight)
			{
				scrollRightHandler(firstItem, lastItem);
			}
		}

		if(currentScrollX > midRightItem.position().left && midRightItem.position().left > 0 && maxRetryCount > 0)
		{
			maxRetryCount--;
			onScrolling(currentScrollX);
		}
		else if(currentScrollX < midLeftItem.position().left && maxRetryCount > 0)
		{
			maxRetryCount--;
			onScrolling(currentScrollX);
		}
	}

	function scrollLeftHandler(firstItem, lastItem)
	{
		var firstIdx = firstItem.css("left");
		var firstPicInfo = dataProvider[firstIdx];
		if(firstPicInfo)
		{
			var newX = firstPicInfo.vpPrevIdx;
			lastItem.css('left', newX);
			updateItem(lastItem);
		}
	}

	function scrollRightHandler(firstItem, lastItem)
	{
		var lastIdx = lastItem.css("left");
		var lastPicInfo = dataProvider[lastIdx];
		if(lastPicInfo)
		{
			var newX = lastPicInfo.vpNextIdx;
			firstItem.css('left', newX);
			updateItem(firstItem);
		}
	}

	function setFavState($vpItem)
	{
		var $favIcon = $(".favIcon .fa", $vpItem);
		var isFav = $vpItem.attr("isFav");

		if(isFav == 'true')
		{
			$($favIcon).removeClass("fa-star-o");
			$($favIcon).addClass("fa-star");
		}
		else
		{
			$($favIcon).addClass("fa-star-o");
			$($favIcon).removeClass("fa-star");
		}
	}

	var helper = {
		vpState : undefined,
		visibleItems : undefined,

		setView : function(e, data)
		{
			var selectedStack = data.selectedStack;
			helper.setDefaultValues();

			if(selectedStack == undefined)
				return;

			helper.visibleItems = [];
			dataProvider = {};
			var picInfos = [];
			var picHash = {};
			var scrollTo = 0;

			var picIds = selectedStack.picIds;
			var m = picIds.length;

			for(var j = 0; j < m; j++) // get the collection of pictures to show
			{
				var picID = picIds[j];
				if(picHash[picID] == null)
				{
					var picInfo = ModelAssist.getPicById(picID);
					picInfos.push(picInfo);
					picHash[picID] = picID;
                    //Fix Pic Width Errors


       //BH Test for resizing
       var imgWidth = picInfo.orgWidth;
       var imgHeight = picInfo.orgHeight;
       var aspectRatio = imgWidth/imgHeight;
//       console.log("imgWidth is " + imgWidth);
//       console.log("imgHeight is " + imgHeight);
//       console.log("aspectRatio is " + aspectRatio);
//       console.log("picWIdth * aspectRatio is " + (LayoutUtil.picWidth*aspectRatio));
//       console.log("LayoutUtil.picWidth is " + LayoutUtil.picWidth);
//       console.log("LayoutUtil.picWidthNarrow is " + LayoutUtil.picWidthNarrow);


            if(picInfo.vpWidth == undefined)
                {

//              if (aspectRatio < 1)
//                isVertical = true;
//              else
//                isVertical = false;

//            picInfo.vpWidth = (isVertical) ? LayoutUtil.picWidthNarrow : LayoutUtil.picWidth;

//       BH:  Size image to fit in window.

        var ratio = (LayoutUtil.picHeight / imgHeight);
//       var ratio = [LayoutUtil.picWidth / imgWidth, LayoutUtil.picHeight / imgHeight];
//       ratio = Math.min(ratio[0], ratio[1]);
//       console.log("ratio is " + ratio);

       picInfo.vpWidth = Math.ceil(imgWidth*ratio);
       picInfo.vpHeight = Math.ceil(imgHeight*ratio);
//       console.log("picInfo.vpWidth is " + picInfo.vpWidth);


                    }
				}
			}



			picInfos.sort(TextUtil.sortByCreationTime);	// sort collection by date

			var n = (picInfos) ? picInfos.length : 0;
			var totalWidth = 0;
			var picInfo = undefined;
			var prevIdx = -10;
			helper.visibleItems = TagSuggestions.visiblePicInfos = picInfos;
			for(var i = 0; i < n; i++) // index collection
			{
				picInfo = picInfos[i];
				var vpWidth = picInfo.vpWidth;
//                console.log("in helper: vpWidth is " + vpWidth)
				var nextIdx = totalWidth + vpWidth + 5;
				picInfo.vpPrevIdx = prevIdx;
				prevIdx = picInfo.vpIdx = totalWidth;
				picInfo.vpNextIdx = nextIdx;
				dataProvider[picInfo.vpIdx + "px"] = picInfo;
				totalWidth = nextIdx; // 5 for gap
			}

			updateScroll(totalWidth, scrollTo); // update viewpane size and scroll
			AppUtil.showLoader(false);

			setTimeout(function()
			{
				$.event.trigger("viewPaneItemsChanged", {items: helper.visibleItems});
			}, 50);
		},
		setDefaults : function()
		{
			vpDiv = $("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems");
			hScroll = ScrollUtil.setHScroll("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane");
			hScroll.on('scroll', onScroll);
			hScroll.on('scrollEnd', onScrollEnd);
			vpItem1 = $("#vpItem0", vpDiv);
			vpItem2 = $("#vpItem1", vpDiv);
			vpItem3 = $("#vpItem2", vpDiv);
			vpItem4 = $("#vpItem3", vpDiv);
			vpItem5 = $("#vpItem4", vpDiv);
		},
		setDefaultValues : function()
		{
			if(picHeight == undefined)
			{
				pageHeight = picHeight = LayoutUtil.picHeight;
				var vpItems = $(".vpItem", vpDiv);
				var vpImg = $(".vpImg", vpDiv);
				vpDiv.height(picHeight);
				vpItems.height(picHeight);
				vpImg.height(picHeight);
			}
		},
		refreshScroll : function()
		{
			hScroll.refresh();
		},
		onVPItemFavTab : function (event)
		{
			event.stopPropagation();
			var $vpItem = $(this.parentNode);
			var picId = $vpItem.attr("picId");
			var isFav = $vpItem.attr("isFav");
			$vpItem.attr("isFav", (isFav == 'true') ? "false" : "true");
			ModelAssist.addPicToFavorites(picId);
			model.saveDirtyState();
			setFavState($vpItem);
		},
		onVPItemTab : function(event)
		{
			var $this = $(this);
			var idx = $this.css("left");
			var picInfo = dataProvider[idx];
			if(picInfo.selected)
			{
				picInfo.selected = false;
				$this.removeClass("selected");
			}
			else
			{
				picInfo.selected = true;
				$this.addClass("selected");
			}
		},
		updateTags : function()
		{
			updateItem(vpItem1);
			updateItem(vpItem2);
			updateItem(vpItem3);
			updateItem(vpItem4);
			updateItem(vpItem5);
		},
		unselectAll : function()
		{
			$(".vpItem",vpDiv).removeClass("selected");
			for(var idx in dataProvider)
			{
				var picInfo = dataProvider[idx];
				picInfo.selected = false;
			}
		},
		selectAll : function()
		{
			$(".vpItem",vpDiv).addClass("selected");
			for(var idx in dataProvider)
			{
				var picInfo = dataProvider[idx];
				picInfo.selected = true;
			}
		},
		getSelectedItems : function()
		{
			var selectedItems = [];
			for(var idx in dataProvider)
			{
				var picInfo = dataProvider[idx];
				if(picInfo.selected)
					selectedItems.push(picInfo);
			}
			return selectedItems;
		},
		deleteTag : function(event)
		{
			event.stopPropagation();
			var $tag = $(this);
			var keyword = $tag.attr("keyword");
			var type = $tag.attr("type").toLowerCase();
			var tagPicId = $tag.attr("picId");
			$tag.hide();
			ModelAssist.removeKeywordFromPicInfo(tagPicId, keyword, type);
		},
		getVisiblePicInfo : function()
		{
			return helper.visibleItems;
		}
	};
	return helper;
});