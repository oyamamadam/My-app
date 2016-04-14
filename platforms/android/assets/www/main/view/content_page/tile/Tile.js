define(['log', "ich", 'util/AppUtil', "text!tile/Tile.html", "css!tile/Tile", "text!tile/TileItem.html"],
function(log, ich, AppUtil, tileHTML, tileCSS, tileItemHTML)
{
	function addListeners()
	{
	}
		
	function setPOCView()
	{
		var tileObj = {src:"assets/icon/vpImg0.jpg",
					  title: "Tile Title",
					  count: "2"};
		AppUtil.appendIchTemplate('tileItemHTML', tileItemHTML, $('#tileOuter', "#tile"), tileObj);	
	}
		
	var comp = {init:function()
	{
		AppUtil.applyIchTemplate('tileHTML', tileHTML, $('#tile'));
				
		addListeners();
		
		for(var i = 0; i < 4; i++)
		{
			setPOCView();
		}
		
	}};
	return comp;
});