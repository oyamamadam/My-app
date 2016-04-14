define(['util/AppUtil', 
        "text!mainPane/sub_header/SubHeader.html", 
        "css!mainPane/sub_header/SubHeader",
        "m/AppModel",
        'enum/AppEnum',
        "mainPane/view_pane/ViewPaneHelper"],
		
function(AppUtil, subHeaderHTML, subHeaderCSS, AppModel, AppEnum, ViewPaneHelper)
{
	var vpItems = undefined;
	function addListeners()
	{
		$(document).on("stackChangeNotification", onStackChangeNotification);
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged); 
		AppUtil.addTouchEvent("#contentPage #contentBody #mainPane #rDiv #subHeader .subNavBtn", onSubNavBtnClicked);	
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.tagging', onVPItemTab);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.sharing', onVPItemTab);
		AppUtil.addTouchEvent('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem.trashing', onVPItemTab);
	}
	
	function onStackChangeNotification(e, data)
	{
		clearOptSelection();
		if(data && data.selectedStack)
		{
			var subHeaderTxt = data.selectedStack.label;
			setHeader(subHeaderTxt);
		}	
		if(vpItems == undefined)
			vpItems = $('#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane #viewPaneItems .vpItem');
	}
	
	function onVPItemTab()
	{
		clearOptSelection();
	}
	
	function setHeader(subHeaderTxt)
	{
		$(".keywords", "#contentPage #contentBody #mainPane #rDiv #subHeader").html(subHeaderTxt);
	}
	
	function onHeaderSelectionChanged()
	{
		var isSelectable = AppModel.isSelectable();		
		var subNavOpts = $("#subHeaderOptionsDiv", "#contentPage #contentBody #mainPane #rDiv #subHeader");
		var subNavCount = $(".selCount", "#contentPage #contentBody #mainPane #rDiv #subHeader");
		var favIcons = $(".favIcon", vpItems);
		clearOptSelection();
		if(isSelectable)
		{
			favIcons.hide();
			subNavOpts.css("visibility", "visible");
			subNavCount.css("visibility", "visible");
			setCountLb();
		}			
		else
		{
			favIcons.show();
			subNavOpts.css("visibility", "hidden");
			subNavCount.css("visibility", "hidden");
		}			
	}
	
	function setCountLb()
	{
		setTimeout(function()
		{
			var subNavCount = $(".selCount", "#contentPage #contentBody #mainPane #rDiv #subHeader");
			var selectedItems = ViewPaneHelper.getSelectedItems();
			var l = selectedItems.length;
			subNavCount.html("(" + l + ")");
			$.event.trigger({type:"vpItemSelectionChanged"});
		}, 200);
	}
	
	function clearOptSelection()
	{
		var optItems = $("#subHeaderOptionsDiv", "#contentPage #contentBody #mainPane #rDiv #subHeader");		
		optItems.removeClass("hl");
		$("*", optItems).removeClass("hl");
		setCountLb();
	}
	
	function onSubNavBtnClicked()
	{
		var $thiz = $(this);
		clearOptSelection();
		
		$thiz.addClass("hl");
		$("*", $thiz).addClass("hl");
		
		var optId = $thiz.attr("id");
		if(optId == "checkAllNav")
			selectAllClick();
		else if(optId == "uncheckNav")
			unselectAllClick();
		setCountLb();
	}
	
	function unselectAllClick()
	{
		vpItems.removeClass('selected');
		ViewPaneHelper.unselectAll();
	}

	function selectAllClick()
	{		
		vpItems.addClass('selected');
		ViewPaneHelper.selectAll();
	}
		
	var comp = {
	init:function()
	{		
		addListeners();		
		AppUtil.applyIchTemplate('subHeaderHTML', subHeaderHTML, $('#subHeader'), null);	
	}};
	return comp;
});