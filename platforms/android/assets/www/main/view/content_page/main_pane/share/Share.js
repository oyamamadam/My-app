define(['util/IchUtil', 
        'util/AppUtil',
        "text!mainPane/share/Share.html", 
        "css!mainPane/share/Share",
        "mainPane/share/ShareHelper",
        "mainPane/view_pane/ViewPaneHelper",
        "mainPane/stacks/StacksHelper",
        "header/Header",
        "m/AppModel",
        'enum/AppEnum'],
        
function(IchUtil, AppUtil, shareHTML, shareCSS, ShareHelper, ViewPaneHelper, StacksHelper, Header, AppModel, AppEnum)
{
	var compState = undefined;
	
	function addListeners()
	{
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged); 
		AppUtil.addTouchEvent('#mainPane #share #doneShareBtn', saveDirtyState);
		AppUtil.addTouchEvent('#mainPane #share #cancelShareBtn', cancelDirtyState);
		AppUtil.addTouchEvent('#mainPane #shareDiv #shareScrollWrapper .shareGroupWrapper.subItem', onSubItemTab);
	}	
	
	function onSubItemTab()
	{
		var subItem = $(this);
		var allItems = $('#mainPane #shareDiv #shareScrollWrapper .shareGroupWrapper.subItem');
		allItems.removeClass('selected');
		subItem.addClass('selected');
	}
	
	function saveDirtyState()
	{
		var shareSelectionDiv = $("#mainPane #shareDiv #shareScrollWrapper .shareGroupWrapper.subItem.selected");
		var type = shareSelectionDiv.attr("type");
		var selectedItems = ViewPaneHelper.getSelectedItems();
		if(selectedItems.length == 0)
		{
			alert("SELECT ONE OR MORE PHOTOS TO SHARE!");
			return;
		}
        
		type = "SHARE"
		ShareHelper.invokeShare(type, selectedItems);
		Header.externalOptionSelection("shareNav");
	}

	function cancelDirtyState()
	{
		Header.externalOptionSelection("shareNav");
	}
	
	function onHeaderSelectionChanged()
	{
		if(AppModel.isSharing) {
            setTimeout(setShareState, 100);
			setShareState();
        }
		else
			hideShareState();
	}
	
	function setShareState()
	{
		if(compState == AppEnum.shareState)
			return;
		compState = AppEnum.shareState;
		$('#contentBody #rDiv #share').show();
		$('#contentBody #rDiv #viewPaneWrapper').css('right', '200px');
		$('#contentBody #rDiv #subHeader').css('right', '200px');
		$('#contentBody #rDiv #stackWrapper').css('right', '220px');		
		StacksHelper.refreshScroll();
		ViewPaneHelper.refreshScroll();
	}
	
	function hideShareState()
	{
		if(compState == AppEnum.shareState)
		{
			compState = undefined;
			$('#contentBody #rDiv #share').hide();
			$('#contentBody #rDiv #viewPaneWrapper').css('right', '0px');
			$('#contentBody #rDiv #subHeader').css('right', '0px');
			$('#contentBody #rDiv #stackWrapper').css('right', '20px');
			StacksHelper.refreshScroll();
			ViewPaneHelper.refreshScroll();
		}
	}
	
	var comp = {
		init:function()
		{		
			IchUtil.applyIchTemplate('shareHTML', shareHTML, $('#share', "#mainPane"));
			addListeners();
		}
	};
	return comp;
});