if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["text!sync/Sync.html",
        "text!sync/SyncItem.html",
        "css!sync/Sync",
        'util/IchUtil',
        'util/AppUtil',
        'adptr/DeviceAdaptor',
        'util/ScrollUtil'],

function(SyncHTML, SyncItemHTML, SyncCSS, IchUtil, AppUtil, DeviceAdaptor, ScrollUtil)
{
	var isVisible = false;
	var hScroll = undefined;
	var syncItemDiv = undefined;
	var itemsByPath = undefined;
	var syncCB = undefined;

	function addListeners()
	{
		AppUtil.addTouchEvent('#syncPage #syncScreen .link', toggleView);
		AppUtil.addTouchEvent('#syncPage #syncScreen .divBtn', onOkClick);
		AppUtil.addTouchEvent('#syncPage #syncScreen #syncWrapper #syncItems .syncItem', onSyncItemClick);
	}

	function toggleView()
	{
		if(isVisible)
			$('#syncPage').fadeOut(200);
		else
			$('#syncPage').fadeIn(200);
		isVisible = !isVisible;
		if(isVisible == false)
			$.event.trigger("headerEvent", {navId: "syncNav"});
	}

	function onOkClick()
	{
		var syncItems = $("#syncPage #syncScreen #syncWrapper #syncItems .syncItem.selected");
		var n = syncItems.length;
		var newFiles = [];
		for(var i = 0; i < n; i++)
		{
			var item = $(syncItems[i]);
			var path = item.attr("picPath");
			var item = itemsByPath[path];
			newFiles.push(item);
		}
		toggleView();
		syncCB(newFiles);
	}

	function setView(items)
	{
		var n = items.length;
		var newWidth = 0;
		for(var i = 0; i < n; i++)
		{
			var item = items[i];
			// ( add by 15 21.05.2015
			//if(DeviceAdaptor.inBrowser)
			//	item.fullPath = "http://placekitten.com/" + 150 + '/' + 110;
			// add by 15 21.05.2015 )
			itemsByPath[item.fullPath] = item;
			IchUtil.appendIchTemplate('noname', SyncItemHTML, syncItemDiv, item);
			newWidth = newWidth + 155;
		}

		hScroll.scrollTo(0, 0, 0);
		ScrollUtil.updateScroll(syncItemDiv, hScroll, newWidth, 110, 10, function(){});
	}

	function onSyncItemClick()
	{
		var $thiz = $(this);
		var isSelected = $thiz.hasClass("selected");
		if(isSelected)
			$thiz.removeClass("selected");
		else
			$thiz.addClass("selected");
	}

	var syncPage = {
		init:function()
		{
			IchUtil.applyIchTemplate('noname', SyncHTML, $('#syncPage'));
			addListeners();
			hScroll = ScrollUtil.setHScroll("#syncPage #syncScreen #syncWrapper");
			syncItemDiv = $("#syncPage #syncScreen #syncWrapper #syncItems");
		},
		showSyncPopup : function(newImgs, callBack)
		{
			itemsByPath = {};
			syncItemDiv.empty();
			setView(newImgs);
			toggleView();
			syncCB = callBack;
			setTimeout(function ()
			{
				hScroll.refresh();
			}, 1000);
		}
	};
	return syncPage;
});