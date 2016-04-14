define(['util/IchUtil', 
        'util/AppUtil', 
        "mainPane/view_pane/grid/GridHelper", 
        "css!mainPane/view_pane/grid/Grid",
        "m/AppModel",
        'enum/AppEnum'],
        
function(IchUtil, AppUtil, GridHelper, GridCSS, AppModel, AppEnum)
{	
	var viewPane = undefined;
	var gridPane = undefined;
	
	function addListeners()
	{
		$(document).on("viewPaneItemsChanged", onViewPaneItemsChanged); 
		$(document).on("headerSelectionChanged", onHeaderSelectionChanged); 
	}

	function onHeaderSelectionChanged()
	{
		setGridState(AppModel.isGrid);			
	}
	
	function setGridState(isGrid)
	{
		if(isGrid)
		{
			viewPane.css("visibility", "hidden");
			gridPane.show();
			GridHelper.setDefaults(gridPane);
			GridHelper.setView();
		}
		else
		{
			viewPane.css("visibility", "visible");
			gridPane.hide();
			GridHelper.items = undefined;
		}					
	}

	function onViewPaneItemsChanged(e, data)
	{
		GridHelper.setData(data);
	}
		
	var comp = {		
		init:function()
		{			
			addListeners();	
			viewPane = $("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #viewPane");
			gridPane = $("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #gridPane");			
		}
	};
	return comp;
});