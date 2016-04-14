define(['log', "ich", 'util/AppUtil', "text!mainPane/footer/Footer.html", "css!mainPane/footer/Footer",
        "text!mainPane/footer/FooterItem.html"],
function(log, ich, AppUtil, footerHTML, footerCSS, footerItemHTML)
{
	function addListeners()
	{
		
	}	
	
	var lastSubTitle= '';
	function setPOCView(subID, subTitle)
	{
		if(lastSubTitle === subTitle)
			subTitle = "";
		else
			lastSubTitle = subTitle;
		var fObj = {src:"assets/icon/footerImg.png",
					title: subTitle};					 
		AppUtil.appendIchTemplate('footerItemHTML', footerItemHTML, $('.wrapper', subID), fObj);	
	}
	
	var comp = {init:function()
	{		
		AppUtil.applyIchTemplate('footerHTML', footerHTML, $('#footer', "#rDiv"));
		
		addListeners();		
		
		for(var i = 0; i < 2; i++)
		{			
			setPOCView("#vnts", "BBall Game");
		}
		for(var i = 0; i < 1; i++)
		{			
			setPOCView("#plcs", "New York");
		}
		for(var i = 0; i < 4; i++)
		{			
			if(i<2)
				setPOCView("#ppl", "Sebastian");
			else
				setPOCView("#ppl", "Sattie");
		}
		for(var i = 0; i < 19; i++)
		{			
			if(i<3)
				setPOCView("#ntts", "Food");
			else if(i<5)
				setPOCView("#ntts", "Art");
			else
				setPOCView("#ntts", "Water");
		}
	}};
	return comp;
});