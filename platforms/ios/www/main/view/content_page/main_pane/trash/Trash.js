// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['util/IchUtil', 
        'util/AppUtil',
        "text!mainPane/trash/Trash.html", 
        "css!mainPane/trash/Trash",
        "mainPane/trash/TrashHelper",
        "mainPane/view_pane/ViewPaneHelper",
        "mainPane/stacks/StacksHelper",
        "header/Header",
        "m/AppModel",
        'enum/AppEnum'],
        
function(IchUtil, AppUtil, trashHTML, trashCSS, TrashHelper, ViewPaneHelper, StacksHelper, Header, AppModel, AppEnum)
{
	var compState = undefined;
	var helpComp = undefined;
	var contentComp = undefined;
	
	function addListeners()
	{
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged); 
		$(document).on("vpItemSelectionChanged", onItemSelectionChanged); 
		$(document).on("viewPaneItemsChanged", onViewPaneItemsChanged); 
		AppUtil.addTouchEvent('#mainPane #trash #doneShareBtn', saveDirtyState);
		AppUtil.addTouchEvent('#mainPane #trash #cancelShareBtn', cancelDirtyState);
		AppUtil.addTouchEvent('#mainPane #trashDiv #trashGroupWrapper .trashGroup .trashBody .trashItem', onTrashItemTab);
	}	
	
	function onTrashItemTab()
	{
		var subItem = $(this);
		var isChecked = subItem.hasClass("checked");
		if(isChecked)
			subItem.removeClass("checked");
		else
			subItem.addClass("checked");
	}
	
	function saveDirtyState()
	{
		var items = $("#mainPane #trashDiv #trashGroupWrapper .trashGroup .trashBody .trashItem");
		TrashHelper.saveTrash(items);
		Header.externalOptionSelection("trashNav");
	}

	function cancelDirtyState()
	{
		Header.externalOptionSelection("trashNav");
	}
	
	function onHeaderSelectionChanged()
	{
		if(AppModel.isTrash)
			setTimeout(setTrashState, 100);
		else if(AppModel.isHelp)
			setTimeout(setHelpState, 100);
		else
			hideTrashHelpState();
	}
	
	function setTrashState()
	{
		if(compState == AppEnum.trashState)
			return;
		compState = AppEnum.trashState;
		TrashHelper.setDefaults();
		setTimeout(function()
		{
			$('#contentBody #rDiv #trash').show();
			$('#contentBody #rDiv #viewPaneWrapper').css('right', '200px');
			$('#contentBody #rDiv #subHeader').css('right', '200px');
			$('#contentBody #rDiv #stackWrapper').css('right', '220px');		
			StacksHelper.refreshScroll();
			ViewPaneHelper.refreshScroll();
		}, 100);
	}

       function setHelpState()
       {
       if(compState == AppEnum.helpState)
       return;
       compState = AppEnum.helpState;
       
       // BW 140918 turned on hide functions and added new jQuery ajax call. Michal likley has some nice methods for this but I don't know the app well yet. So this is my get this done for now way.
       helpComp.show();
       contentComp.hide();
       
       // just some tests.
       //$('#contentPage #contentBody #helpPage').css('background', 'yellow'); // testing adjusting .css and it works
       //$('#helpPage').html("<p><b>Appended text 1</b></p>"); // testing .html and it works
       
       $('#helpPage').append("<p><b>Loading Help...</b></p>"); // testing .append and it works
       // ajax call for help page
       
       $.ajax({url:"http://bibliosmart.com/help/",success:function(result){
              $("#helpPage").html(result);
            }});
       
       // BW has not idea how this would work so he addes simple jquery above.
       //window.open('http://bibliosmart.com/help/help.html', '_blank', 'location=yes');
       }
	
	function hideTrashHelpState()
	{
		if(compState == AppEnum.trashState)
		{
			compState = undefined;
			$('#contentBody #rDiv #trash').hide();
			$('#contentBody #rDiv #viewPaneWrapper').css('right', '0px');
			$('#contentBody #rDiv #subHeader').css('right', '0px');
			$('#contentBody #rDiv #stackWrapper').css('right', '20px');
			StacksHelper.refreshScroll();
			ViewPaneHelper.refreshScroll();
		}
		else if(compState == AppEnum.helpState)
		{
			helpComp.hide();
			contentComp.show();
			compState = undefined;
		}	
	}
	
	function onItemSelectionChanged()
	{
		if(compState == AppEnum.trashState)
		{
			var selectedItems = ViewPaneHelper.getSelectedItems();
			TrashHelper.setDynamicView(selectedItems);
		}
	}
	
	function onViewPaneItemsChanged()
	{
		
	}
	
	var comp = {
		init:function()
		{		
			IchUtil.applyIchTemplate('shareHTML', trashHTML, $('#trash', "#mainPane"));
			addListeners();
			helpComp = $("#contentPage #contentBody #helpPage");
			contentComp = $("#contentPage #contentBody #mainPane");		
		}
	};
	return comp;
});