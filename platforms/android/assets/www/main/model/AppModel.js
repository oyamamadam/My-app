define(['util/AppUtil'],
        
function(AppUtil)
{
	function dispatchChangeEvent(type)
	{		
		$.event.trigger(type);
	}
	
	function resetAllValues()
	{
		helper.isGrid = helper.isPreview = helper.isTagging = helper.isSharing = helper.isHome = helper.isFav = false;
		helper.isTrash = helper.isSettings = helper.isLogout = helper.isHelp = false;
	}
	
	var helper = {
		isGrid:undefined,
		isPreview:true,
		isTagging:undefined,
		isSharing:undefined,
		isHome:undefined,
		isFav:undefined,
		isTrash:undefined,
		isSettings:undefined,
		isLogout:undefined,
		isHelp:undefined,
		
		headerSelectionChange : function(selectedId)
		{
			resetAllValues();
			switch(selectedId)
			{
				case "homeNav": helper.isHome = true; break;
				case "gridNav": helper.isGrid = true; break;
				case "favNav": helper.isFav = true; break;
				case "trashNav": helper.isTrash = true; break;
				case "settingsNav": helper.isSettings = true; break;
				case "logoutNav": helper.isLogout = true; break;
				case "infoNav": helper.isPreview = true; break;
				case "tagNav": helper.isTagging = true; break;
				case "shareNav": helper.isSharing = true; break;
				case "helpNav": helper.isHelp = true; break;
			}
			setTimeout(function()
			{
				dispatchChangeEvent("headerSelectionChanged");
			}, 20);	
		},
		
		isSelectable : function()
		{
			return helper.isTagging || helper.isTrash || helper.isSharing;
		}
	};
	
	return helper;		
});