define(["text!share/SharePopup.html", 
        "css!share/SharePopup",
        'util/IchUtil',
        'util/AppUtil'],
        
function(SharePopupHTML, SharePopupCSS, IchUtil, AppUtil)
{				
	function addListeners()
	{
		AppUtil.addTouchEvent('#typePage #shareScreen .link', hideView);
	}
	
	function hideView()
	{
		$('#typePage').fadeOut(200);
	}
	
	var typePage = 
	{
		init:function()
		{
			addListeners();
		},
		showPopup : function(items)
		{
			var n = (items) ? items.length : 0; 
			if(n > 0)
			{
				$('#typePage').empty();
				var obj = {count: n};
				IchUtil.applyIchTemplate('noname', SharePopupHTML, $('#typePage'), obj);
				$('#typePage').fadeIn(200);
			}	
		}
	};
	return typePage;
});