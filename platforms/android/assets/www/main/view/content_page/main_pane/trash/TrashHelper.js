if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['util/AppUtil',
        'util/TextUtil',
        'util/IchUtil',
        'enum/AppEnum',
        'adptr/DeviceAdaptor',
        "text!mainPane/trash/TrashItem.html",
        'util/LayoutUtil',
        'util/ScrollUtil',
        "model",
        "m/ModelAssist"],

function(AppUtil, TextUtil, IchUtil, AppEnum, DeviceAdaptor, TrashItemHTML, LayoutUtil, ScrollUtil, model, ModelAssist)
{
	var newDiv = undefined;
	var oldDiv = undefined;
	var scrollDiv = undefined;
	var vScroll = undefined;
	var picHeight = 70;
	var picWidth = 100;
	var picWidthNarrow = 50;

	function addNewItem(picInfo, parentDiv)
	{
		picInfo.trashWidth = (picInfo.orgWidth > picInfo.orgHeight) ? picWidth : picWidthNarrow;
		picInfo.trashHeight = picHeight;
		// ( add by 15 21.05.2015
		//if(DeviceAdaptor.inBrowser) // for browser testing
		//	picInfo.source_file = "http://placekitten.com/" + picInfo.trashWidth + '/' + picInfo.trashHeight;
		// add by 15 21.05.2015 )

		IchUtil.appendIchTemplate('noname', TrashItemHTML, parentDiv, picInfo);
	}

	function updateScroll()
	{
		vScroll.scrollTo(0, 0, 0);
		ScrollUtil.updateScroll(scrollDiv, vScroll, 0, 0, 10, function()
		{
			console.log("TRASH SCROLL UPDATED");
		});
	}

	var comp = {
		setDynamicView: function(picInfos)
		{
			newDiv.empty();
			var n = (picInfos) ? picInfos.length : 0;
			for(var i = 0; i < n; i++)
			{
				var picInfo = picInfos[i];
				addNewItem(picInfo, newDiv);
			}
			updateScroll();
		},
		setStaticView: function()
		{
			oldDiv.empty();
			var picInfos = ModelAssist.getObjectsById();
			for(var picId in picInfos)
			{
				var picInfo = picInfos[picId];
				if(picInfo.isDeleted)
					addNewItem(picInfo, oldDiv);
			}
			updateScroll();
		},
		setDefaults : function()
		{
			if(newDiv == undefined)
			{
				newDiv = $(".trashBody", "#mainPane #trashDiv #trashGroupWrapper #toBeTrashDiv");
				oldDiv = $(".trashBody", "#mainPane #trashDiv #trashGroupWrapper #trashedDiv");
				scrollDiv = $(".trashGroupWrapper", "#mainPane #trashDiv #trashScrollWrapper");
				vScroll = ScrollUtil.setVScroll("#mainPane #trashDiv #trashScrollWrapper");
			}
			comp.setStaticView();
		},
		saveTrash : function(items)
		{
			var n = items.length;
			for(var i = 0; i < n; i++)
			{
				var trashItem = $(items[i]);
				var itemId = trashItem.attr("picId");
				var isChecked = trashItem.hasClass("checked");
				if(isChecked)
					ModelAssist.addPicToTrash(itemId);
				else
					ModelAssist.removePicFromTrash(itemId);
			}
			model.saveDirtyState();
		}
	};

	return comp;
});