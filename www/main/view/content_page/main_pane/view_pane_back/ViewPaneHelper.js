define(['log',
        'util/AppUtil',
        'util/IchUtil',
        "mainPane/refiner/RefinerState",
        'enum/AppEnum',
        "text!mainPane/view_pane/ViewPaneItem.html",
        "text!mainPane/view_pane/ViewPaneTagItem.html",
        'adptr/DeviceAdaptor',
        "mainPane/tag/TagHelper",
        "m/DirtyHelper",
        "m/ModelAssist",
        'util/TextUtil',
        "iScroll5",
        "mainPane/tag/TagSuggestions",
        "util/LayoutUtil"],

function(log, AppUtil, IchUtil, RefinerState, AppEnum, viewPaneItemHTML, ViewPaneTagItemHTML, DeviceAdaptor,
		TagHelper,DirtyHelper, ModelAssist, TextUtil, iScroll, TagSuggestions, LayoutUtil)
{
	var count = 0;
	var totalWidth = 0;
	var totalChecked = 0;
	var activeItems = {};
	var vpScroll = undefined;
	var visiblePicInfo = [];
	var gridRows = 3;
	var maxHeight = 0;
	var retryCount = 0;
	var scrolling = false;
	var xToPicInfo = {};

	function updateScroll()
	{
		$('#viewPane #viewPaneItems', "#rDiv").width(totalWidth); // get width of every img

		var scrollToX = 0;
		if(vpScroll)
		{
			scrollToX = vpScroll.x;
		}
		else
		{
			vpScroll = new iScroll("#viewPane",{ scrollX: true,
												 scrollY: false,
												 mouseWheel: false,
												 scrollbars: 'custom',
												 scrollbarClass: 'myScrollbar'});
			vpScroll.on('scrollStart', onScrollStart);
			vpScroll.on('scrollEnd', onScrollEnd);
		}

		vpScroll.refresh();
		if(vpScroll.scrollerWidth != totalWidth && retryCount < 5)
		{
			retryCount++;
			setTimeout(function()
			{
				updateScroll();
			}, 100);
		}
		else
		{
			if(vpScroll.scrollerWidth < Math.abs(scrollToX))
				scrollToX = 0;
			vpScroll.scrollTo(scrollToX, 0, 0);

			$.event.trigger("viewPaneChangeNotification");
			AppUtil.showLoader(false);
			validateImagesBasedOnScroll();
		}
	}

	function onScrollStart()
	{
		scrolling = true;
		validateImagesBasedOnScroll();
	}
	function onScrollEnd()
	{
		scrolling = false;
		validateImagesBasedOnScroll();
	}
	function validateImagesBasedOnScroll()
	{
		var scrollToX = vpScroll.x;
		var viewMin = Math.abs(scrollToX) - 1000;
		var viewMax = Math.abs(scrollToX) + 1000;

		for(var picX in xToPicInfo)
		{
			var picInfo = xToPicInfo[picX];
			var vpItem = $("#" + picInfo.uid, '#contentBody #rDiv #viewPaneWrapper #viewPaneItems');
			var img = $('img', vpItem);

			if(picX > viewMin && picX < viewMax && img.attr('src') == "") // show picture
			{
				$('img', vpItem).attr('src', picInfo.source_file);
				delete xToPicInfo[picX];
			}
		}
		if(scrolling)
		{
			setTimeout(validateImagesBasedOnScroll, 50);
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

	function showPicture(picInfo, viewPaneItems)
	{
		// ( add by 15 21.05.2015
		//if(DeviceAdaptor.inBrowser) // for browser testing
		//	picInfo.source_file = "http://placekitten.com/g/" + picInfo.width + '/' + picInfo.height;
		// add by 15 21.05.2015 )

		IchUtil.appendIchTemplate('noname', viewPaneItemHTML, viewPaneItems, picInfo);
		visiblePicInfo.push(picInfo);
		var picId = picInfo.id;
		var vpItem = $("#" + picInfo.uid, '#contentBody #rDiv #viewPaneWrapper #viewPaneItems');
		$(vpItem).bind('pinch', pinchCallback);
		if(helper.hashObj[picId]) // isSelected
			addSelectedToPic(vpItem);

		helper.setFavState(vpItem);
		invlidateSize(vpItem, picInfo);
	};

	function pinchCallback(e)
	{
		console.log("pinchCallback");
	}

	function invlidateSize(vpItem, picInfo)
	{
		var w = picInfo.width;
		var h = picInfo.height;
		var newWidth = LayoutUtil.picWidthNarrow;
		if(w > h)
			newWidth = LayoutUtil.picWidth;

		vpItem.width(newWidth);
		vpItem.height(LayoutUtil.picHeight);

		xToPicInfo[totalWidth] = picInfo;
		totalWidth = totalWidth + newWidth + 5; // 5 for padding;

		totalChecked++;
		if(totalChecked == count) //loading done
		{
			totalWidth = Math.ceil(totalWidth + 5);
			retryCount = 0;
			updateScroll();
			imagesLoaded();
		}
	}

	function addSelectedToPic($this)
	{
		if(helper.isTagging || helper.isSharing)
		{
			var picId = $this.attr("picId");
			if($(".picOverlay", $this).hasClass("selected"))
			{
				$(".picOverlay", $this).removeClass("selected");
				$this.removeClass("selected");
				delete helper.hashObj[picId];
			}
			else
			{
				$(".picOverlay", $this).addClass('selected');
				$this.addClass('selected');
				helper.hashObj[picId] = picId;
			}
		}
	}

	function setDefaults()
	{
		vpItemCount = 3;
		count = 0;
		visiblePicInfo = [];
		totalChecked = 0;
		totalWidth = 0;
		if(scrolling)
			vpScroll.scrollTo(vpScroll.x, 0, 0);
		scrolling = false;

		if(maxHeight < 1)
		{
			maxHeight = $("#viewPane").height();
		}
	}

	function imagesLoaded()
	{
		var vpItems = $(".vpItem", "#viewPane");
		var $elms = $(".vpItem *", "#viewPane");
		setPictureKeywrods();
		$.event.trigger("imagesLoaded");
	}

	var helper = {
		hashObj: {},
		isTagging:false,
		isPreview:true,
		isGridView:false,
		isSharing:false,
		picHash:undefined,

		setView : function(e, data)
		{
			setDefaults();
			$("#viewPane #viewPaneItems").empty();
			var selectedStack = data.selectedStack;
			if(selectedStack == undefined)
				return;
			var picIds = selectedStack.picIds;
			var picInfos = [];
			var m = picIds.length;
			var picHash = {};
			for(var j = 0; j < m; j++)
			{
				var picID = picIds[j];
				if(picHash[picID] == null)
				{
					var picInfo = ModelAssist.getPicById(picID);
					picInfos.push(picInfo);
					picHash[picID] = picID;
				}
			}
			//picInfos = ModelAssist.getPicInfoFor(refinerIds);
			var n = count = (picInfos) ? picInfos.length : 0;
			var viewPaneItems = $('#viewPane #viewPaneItems', "#rDiv");
			TagSuggestions.visiblePicInfos = picInfos;
			for(var i = 0; i < n; i++)
			{
				var picInfo = picInfos[i];
				picInfo.index = i + 1;
				showPicture(picInfo, viewPaneItems);
			}
		},
		onImageClicked:function($this)
		{
			addSelectedToPic($this);
		},
		onDeleteTagClick:function(event)
		{
			event.stopPropagation();
			var $tag = $(this);
			var keyword = $tag.attr("keyword");
			var type = $tag.attr("type").toLowerCase();
			var tagPicId = $tag.attr("picId");
			$tag.hide();

			setTimeout(function()
			{
				ModelAssist.removeKeywordFromPicInfo(tagPicId, keyword, type);

				var selectedVpItem = $('.vpItem.selected', '#rDiv #viewPane #viewPaneItems');
				var n = selectedVpItem.length;
				for(var i = 0; i < n; i++)
				{
					var vpItem = selectedVpItem[i];
					var itemTags = $(".vpTagDiv .tagItemDiv", vpItem);
					var m = itemTags.length;
					for(var j = 0; j < m; j++)
					{
						var tag = $(itemTags[j]);
						var tagType = tag.attr("type").toLowerCase();
						var tagKeyword = tag.attr("keyword");
						if(tagType == type && keyword == tagKeyword)
						{
							tagPicId = tag.attr("picId");
							ModelAssist.removeKeywordFromPicInfo(tagPicId, tagKeyword, tagType);
							tag.hide();
						}
					}
				}
				setPictureKeywrods();
			}, 50);
		},
		getActiveItems: function()
		{
			return activeItems;
		},
		getVisiblePicInfo: function()
		{
			return visiblePicInfo;
		},
		init : function ()
		{},
		updateTags : function ()
		{
			setPictureKeywrods();
		},
		refreshScroll : function()
		{
			vpScroll.refresh();
		},
		resetScrollPosition : function ()
		{
			if(vpScroll)
			{
				vpScroll.refresh();
				vpScroll.scrollTo(0, 0, 0);
			}
		},
		onUtilClick : function(clickedBtn, cssClass)
		{
			if(helper.isTagging && cssClass == 'preview')
				return;
			var adding = false
			var vpItems = $(".vpItem", "#viewPane");
			var $elms = $(".vpItem *", "#viewPane");
			var itHasClass = vpItems.hasClass(cssClass);
			if(cssClass == "tagging")
				adding = helper.isTagging = !helper.isTagging;
			if(cssClass == "preview")
				adding = helper.isPreview = !helper.isPreview;
			if(cssClass == "sharing")
				adding = helper.isSharing = !helper.isSharing;
			var hiddenOptions = $('#subHeader .picOptionDiv .iconWrap.hidden');
			if(itHasClass || adding == false)// remove
			{
				vpItems.removeClass(cssClass);
				$elms.removeClass(cssClass);
				$('.actionIcon', clickedBtn).removeClass('selected');
				hiddenOptions.removeClass('selected');
				$(".idx", vpItems).css('font-size', 0);
			}
			else
			{
				vpItems.addClass(cssClass);
				$elms.addClass(cssClass);
				$('.actionIcon', clickedBtn).addClass('selected');
				if(cssClass == "tagging" || cssClass == "sharing")
					hiddenOptions.addClass('selected');
				if(cssClass == "preview")
					$(".idx", vpItems).css('font-size', 30);
			}
			setPictureKeywrods();
		},
		setFavState : function($vpItem)
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
	};
	return helper;
});