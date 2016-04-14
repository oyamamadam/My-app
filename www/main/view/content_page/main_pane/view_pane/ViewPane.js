define(['util/IchUtil', 
        'util/AppUtil', 
        "mainPane/view_pane/ViewPaneHelper", 
        "css!mainPane/view_pane/ViewPane",
        "text!mainPane/view_pane/ViewPaneItem.html",
        "m/AppModel",
        'enum/AppEnum',
        "mainPane/view_pane/grid/Grid"],
        
function(IchUtil, AppUtil, ViewPaneHelper, viewPaneCSS, ViewPaneItemHTML,AppModel, AppEnum, Grid)
{	
	function addListeners()
	{
		$(document).on("stackChangeNotification", onStackChangeNotification); 
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged); 
		$(document).on("updateViewPaneAfterTagChange", ViewPaneHelper.updateTags);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.tagging .tagItemDiv', ViewPaneHelper.deleteTag);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.tagging', ViewPaneHelper.onVPItemTab);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.sharing', ViewPaneHelper.onVPItemTab);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.trashing', ViewPaneHelper.onVPItemTab);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem .favIcon', ViewPaneHelper.onVPItemFavTab);
	}
	
	function onHeaderSelectionChanged()
	{
		ViewPaneHelper.unselectAll();
		if(AppModel.isPreview)
			setPreviewState();
		else if(AppModel.isTagging)
			setTaggingState();
		else if(AppModel.isSharing)
			setSharingState();
		else if(AppModel.isTrash)
			setTrashState();
		else
			resetAll();
	}
	
	function resetAll()
	{
		comp.resetState();		
	}
	
	function setPreviewState()
	{
		if(ViewPaneHelper.vpState == AppEnum.previewState)
			return;
		comp.resetState();
		comp.setPreviewState();
	}

	function setTaggingState()
	{
		if(ViewPaneHelper.vpState == AppEnum.taggingState)
			return;
		comp.resetState();
		comp.setTaggingState();
		ViewPaneHelper.unselectAll();
	}

	function setSharingState()
	{
		if(ViewPaneHelper.vpState == AppEnum.shareState)
			return;
		comp.resetState();
		comp.setSharingState();
		ViewPaneHelper.unselectAll();
	}

	function setTrashState()
	{
		if(ViewPaneHelper.vpState == AppEnum.trashState)
			return;
		comp.resetState();
		comp.setTrashState();
		ViewPaneHelper.unselectAll();
	}
	
	function onStackChangeNotification(e, data)
	{	
		ViewPaneHelper.setView(e, data);
		onHeaderSelectionChanged();
	}
	
	var comp = {
		vpTagDivs : undefined,
		vpItems : undefined,
		
		init:function()
		{			
			addListeners();	
			var n = 5; // lets only add 3 items
			var vpDiv = $("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems");			
			for(var i = 0; i < n; i++)
			{
				var fsObj = {idx: i};
				IchUtil.appendIchTemplate('noname', ViewPaneItemHTML, vpDiv, fsObj);	
			}	
			ViewPaneHelper.setDefaults();
			comp.vpItems = $(".vpItem", comp.vpDiv);
			comp.vpTagDivs = $(".vpTagDiv", comp.vpItems);
			Grid.init();
		},
		setPreviewState : function()
		{
			ViewPaneHelper.vpState = AppEnum.previewState;			
			comp.vpTagDivs.addClass("preview");
		},
		setTaggingState : function()
		{
			ViewPaneHelper.vpState = AppEnum.taggingState;
			comp.vpTagDivs.addClass("tagging");
			comp.vpItems.addClass("tagging");
		},
		setSharingState : function()
		{
			ViewPaneHelper.vpState = AppEnum.shareState;
			comp.vpItems.addClass("sharing");
		},
		setTrashState : function()
		{
			ViewPaneHelper.vpState = AppEnum.trashState;
			comp.vpItems.addClass("trashing");
		},
		resetState : function()
		{
			ViewPaneHelper.vpState = undefined;
			comp.vpTagDivs.removeClass("preview");
			comp.vpTagDivs.removeClass("tagging");
			comp.vpTagDivs.removeClass("sharing");
			comp.vpTagDivs.removeClass("trashing");
			comp.vpItems.removeClass("sharing");
			comp.vpItems.removeClass("tagging");
			comp.vpItems.removeClass("trashing");
			ViewPaneHelper.refreshScroll();
		},
	};
	return comp;
});