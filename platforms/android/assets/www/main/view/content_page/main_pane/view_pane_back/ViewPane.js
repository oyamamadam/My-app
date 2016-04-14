define(['log', 
        "ich", 
        'util/AppUtil', 
        "mainPane/view_pane/ViewPaneHelper", 
        "css!mainPane/view_pane/ViewPane",
        "mainPane/tag/TagHelper",
        "mainPane/stacks/StacksHelper",
        "m/ModelAssist",
        "model",
        "enum/AppEnum", 
        "share/SharePopup"],
        
function(log, ich, AppUtil, ViewPaneHelper, viewPaneCSS, TagHelper,StacksHelper, ModelAssist, model, AppEnum, SharePopup)
{	
	function addListeners()
	{
		$(document).on("stackChangeNotification", onStackChangeNotification); 
		$(document).on("imagesLoaded", onImagesLoaded);		
		$(document).on("updateViewPaneAfterTagChange", ViewPaneHelper.updateTags);		
		$(document).bind("defaultStateRequest", onDefaultStateRequest);
		AppUtil.addTouchEvent('#contentBody #rDiv #viewPaneWrapper #viewPaneItems .vpItem .tagItemDiv', ViewPaneHelper.onDeleteTagClick);
		AppUtil.addTouchEvent('#viewPane .vpItem', onImageClick);		
		AppUtil.addTouchEvent('#viewPane .favIcon', onFavClicked);			
		AppUtil.addTouchEvent("#contentBody #rDiv #subHeader #subHeaderOptionsDiv .subNavBtn", onSubNavBtnClicked);		
	}
	
	function onStackChangeNotification(e, data)
	{
		clearOptSelection();	
		ViewPaneHelper.setView(e, data);		
	}
		
	function onImageClick(e)
	{
		console.log("onImageClick");
		clearOptSelection();		
		var $img = $(this);
		ViewPaneHelper.onImageClicked($img);
	}
	
	function clearOptSelection()
	{
		var optItems = $("#contentBody #rDiv #subHeader #subHeaderOptionsDiv .subNavBtn");		
		optItems.removeClass("hl");
		$("*", optItems).removeClass("hl");
	}
	
	function onDoneIconClick()
	{
		if(ViewPaneHelper.isSharing)
		{			
			showSharePopup();
			var thiz = $('#mainPane #subHeader #subHeaderShareIcon')[0]; 
			ViewPaneHelper.onUtilClick(thiz, 'sharing');
		}		
		else if(ViewPaneHelper.isTagging)
		{
			comp.toggleTagClick();
			TagHelper.saveDirtyState();
		}	
	}	
	
	function onShareIconClick()
	{
		if(ViewPaneHelper.isPreview)
			comp.toggleEyeClick();
		
		if(ViewPaneHelper.isTagging)
			comp.toggleTagClick();
				
		toggleShareState();	
		var thiz = $('#mainPane #subHeader #subHeaderShareIcon')[0]; 	
		ViewPaneHelper.onUtilClick(thiz, 'sharing');
		unselectAllClick();
		setSelectableState();
	}

	function onTrashIconClick()
	{
		if(ViewPaneHelper.isTagging || ViewPaneHelper.isPreview || ViewPaneHelper.isGridView)
			return;
		if(isSharedState)
			toggleShareState();
		toggleTrashState();			
		setSelectableState(isTrashState);
		if(isTrashState)
			alert("Tab on images you would like to remove. Tab on Trash icon again to move them to Trash.");
	}
	
	function onDefaultStateRequest()
	{
		ViewPaneHelper.resetScrollPosition();
		if(ViewPaneHelper.isPreview)
			comp.toggleEyeClick();
		else if(TagHelper.isVisible)
			comp.toggleTagClick();
		$.event.trigger("defaultStateRequest2");
	}
	
	function onFavClicked()
	{
		var $this = $(this);
		var $vpItem = $(this.parentNode);
		
		var isFav = $vpItem.attr("isFav");
		var picID = $vpItem.attr("picid");
		
		if(isFav == 'true')
		{
			$vpItem.attr("isFav", 'false');
			ModelAssist.removePicFromFavorites(picID);
		}				
		else
		{			
			$vpItem.attr("isFav", 'true');
			ModelAssist.addPicToFavorites(picID);
		}		
		ViewPaneHelper.setFavState($vpItem);
		model.saveDirtyState();
	}
		
	function toggleShareState()
	{
		if(ViewPaneHelper.isSharing)
			$('.actionIcon', '#subHeader .picOptionDiv #subHeaderShareIcon').removeClass('selected');			
		else
			$('.actionIcon', '#subHeader .picOptionDiv #subHeaderShareIcon').addClass('selected');			
	}

	function toggleTrashState()
	{
		if(isTrashState)
		{
			isTrashState = false;
			$('.actionIcon', '#subHeader .picOptionDiv #subHeaderTrashIcon').removeClass('selected');
		}
		else
		{
			isTrashState = true;
			$('.actionIcon', '#subHeader .picOptionDiv #subHeaderTrashIcon').addClass('selected');
		}
	}	
	
	function showSharePopup()
	{
		var items = $('#contentBody #rDiv #viewPaneWrapper #viewPaneItems .vpItem.selected'); 
		var n = (items) ? items.length : 0;
		if(n > 0) // there are pictures which need to be shared
			SharePopup.showPopup(items);
	}
	
	function onImagesLoaded()
	{
		var isSharing = ViewPaneHelper.isSharing;
		var isPreview = ViewPaneHelper.isPreview;
		var isTagging = ViewPaneHelper.isTagging;
		// TURN OFF FIRST
		if(isSharing)
			onShareIconClick();
		if(isPreview)
			comp.toggleEyeClick();	
		if(isTagging)
			comp.toggleTagClick();	
		
		// TURN ON 2nd
		if(isSharing)
			onShareIconClick();
		if(isPreview)
			comp.toggleEyeClick();	
		if(isTagging)
			comp.toggleTagClick();	
	}

	function setSelectableState()
	{
		var isSelectable = ViewPaneHelper.isSharing || ViewPaneHelper.isTagging;
		var items = $('#contentBody #rDiv #viewPaneWrapper #viewPaneItems .vpItem');
		var subNavOpts = $("#subHeaderOptionsDiv", "#contentBody #rDiv #subHeader");
		var favIcons = $(".favIcon", items);
		if(isSelectable)
		{
			favIcons.hide();
			subNavOpts.css("visibility", "visible");
		}			
		else
		{
			favIcons.show();
			subNavOpts.css("visibility", "hidden");
		}			
	}
	
	function onSubNavBtnClicked()
	{
		var $thiz = $(this);
		clearOptSelection();
		
		$thiz.addClass("hl");
		$("*", $thiz).addClass("hl");
		
		var optId = $thiz.attr("id");
		if(optId == "checkAllNav")
		{
			selectAllClick();
		}	
		else if(optId == "uncheckNav")
		{
			unselectAllClick();
		}	
	}
	
	function unselectAllClick()
	{
		ViewPaneHelper.hashObj = {};
		var items = $('#contentBody #rDiv #viewPaneWrapper #viewPaneItems .vpItem');
		items.removeClass('selected');
		$('.picOverlay', items).removeClass('selected');
	}

	function selectAllClick()
	{
		ViewPaneHelper.hashObj = {};
		var items = $('#contentBody #rDiv #viewPaneWrapper #viewPaneItems .vpItem');
		
		items.addClass('selected');
		$('.picOverlay', items).addClass('selected');
		
		var n = items.length;
		for(var i = 0; i < n; i++)
		{
			var item = $(items[i]);
			var picID = item.attr('picId');
			ViewPaneHelper.hashObj[picID] = picID;
		}	
	}
	
	var comp = {
		wasPreviewBefore: false,
		init:function()
		{			
			addListeners();	
			ViewPaneHelper.init();
		},
		toggleEyeClick : function()		
		{
			if(ViewPaneHelper.isTagging)
				comp.toggleTagClick();
			if(ViewPaneHelper.isSharing)
				onShareIconClick();
			
			var thiz = $('#header .iconWrap #infoNav')[0]; 		
			ViewPaneHelper.onUtilClick(thiz, 'preview');
			setSelectableState();
		},
		toggleTagClick : function()
		{
			if(ViewPaneHelper.isSharing)
				onShareIconClick();
			if(ViewPaneHelper.isPreview)
			{
				comp.wasPreviewBefore = true;
				comp.toggleEyeClick();
			}
				
			
			var thiz = $("#mainPane #subHeader #subHeaderTagIcon")[0];
			
			ViewPaneHelper.onUtilClick(thiz, 'tagging');			
			TagHelper.isVisible = !TagHelper.isVisible;
			TagHelper.setView();
			unselectAllClick();
			setSelectableState();
			
			if(ViewPaneHelper.isTagging == false)
			{
				$('#contentBody #rDiv #tag').hide();
				$('#contentBody #rDiv #viewPaneWrapper').css('right', '0px');
				$('#contentBody #rDiv #subHeader').css('right', '0px');
				$('#contentBody #rDiv #stackWrapper').css('right', '20px');
				if(comp.wasPreviewBefore)
				{
					comp.toggleEyeClick();
					var prvBtn = $('#header #infoNav');
					prvBtn.addClass("hl");
					$("*", prvBtn).addClass("hl");
				}	
				comp.wasPreviewBefore = false;
			}				
			else
			{
				$('#contentBody #rDiv #tag').show();
				$('#contentBody #rDiv #viewPaneWrapper').css('right', '200px');
				$('#contentBody #rDiv #subHeader').css('right', '200px');
				$('#contentBody #rDiv #stackWrapper').css('right', '220px');
				var prvBtn = $('#header #infoNav');
				prvBtn.removeClass("hl");
				$("*", prvBtn).removeClass("hl");
			}
			StacksHelper.refreshScroll();
			ViewPaneHelper.refreshScroll();
		}
	};
	return comp;
});