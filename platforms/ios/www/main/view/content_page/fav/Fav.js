define(['log', 
        "ich",
        'util/AppUtil', 
        "text!fav/Fav.html", 
        "css!fav/Fav", 
        "fav/FavHelper"],
        
function(log, ich, AppUtil, favHTML, favCSS, FavHelper)
{
	function addListeners()
	{
	}
		
	var comp = {
	init:function()
	{
		AppUtil.applyIchTemplate('favHTML', favHTML, $('#fav'));				
		addListeners();		
	},
	setView : function()
	{
		FavHelper.setView();
	}};
	return comp;
});