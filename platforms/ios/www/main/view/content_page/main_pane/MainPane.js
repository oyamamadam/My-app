define(['log', 
        "ich", 
        'util/AppUtil', 
        "text!mainPane/MainPane.html", 
        "css!mainPane/MainPane",
        "mainPane/refiner/Refiner",
        "mainPane/breadcrumb/Breadcrumb",
        "mainPane/stacks/Stacks", 
        "mainPane/sub_header/SubHeader", 
        "mainPane/view_pane/ViewPane",
        "mainPane/share/Share",
        "mainPane/trash/Trash",
        "mainPane/tag/Tag"],
        
function(log,ich,AppUtil,mainPaneHTML,mainPaneCSS,refiner,breadcrumb,stacks,subHeader,viewPane, share, trash, tag)
{
	function addListeners()
	{
		$(document).on("deepNavEvent", onDeepNavEvent);
	}
	
	function onDeepNavEvent(e)
	{
//		var subContentID = e.subPageID;
//		var sectionID = e.sectionID;
//		if(subContentID === "#mainPane")
//		{
//			if(sectionID === "#tag")
//			{
//				//tag.toggle();
//			}				
//			else if(sectionID === "#stack")
//			{
//				//$("#tag").hide();
//			}
//		}
	}
	
	function toggleTagStack()
	{
		$("#tag").toggle();
	}
	
	var comp = {init:function()
	{
		AppUtil.applyIchTemplate('mainPaneHTML', mainPaneHTML, $('#mainPane'));			
		addListeners();		
		refiner.init();
		breadcrumb.init();
		stacks.init();
		subHeader.init();
		viewPane.init();
		tag.init();
		share.init();
		trash.init();
	}};
	return comp;
});