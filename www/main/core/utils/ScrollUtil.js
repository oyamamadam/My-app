// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log', 'util/AppUtil', "iScroll5"],
function(log, AppUtil, iScroll)
{
	// ( add by 15 21.05.2015
	if(typeof iScroll === 'undefined') iScroll = window.IScroll;
	// add by 15 21.05.2015 )
	
	var util = {	
		setHScroll : function(scrollSelector)
		{
			var hScroll = new iScroll(scrollSelector,{ scrollX: true, 
													    scrollY: false,
													    mouseWheel: false,
													    scrollbars: 'custom',
													    scrollbarClass: 'myScrollbar',
													    deceleration: 0.003,
													    probeType: 2});
			return hScroll;
		},
		setVScroll : function(scrollSelector)
		{
			var vScroll = new iScroll(scrollSelector,{ scrollX: false,
													   scrollY: true,
													   mouseWheel: false,
													   scrollbars: 'custom',
													   scrollbarClass: 'myScrollbar',
													   deceleration: 0.003,
													   probeType: 2});
			return vScroll;
		},
		updateScroll : function(scrollDiv, scrollObj, newWidth, newHeight, retryCount, cb)
		{			
			scrollDiv.width(newWidth);
			scrollDiv.hide().show(0);
			scrollObj.refresh();
			if(scrollObj.scrollerWidth != newWidth && retryCount > 0)
			{
				var rc = retryCount - 1;
				setTimeout(util.updateScroll(scrollDiv, scrollObj, newWidth, newHeight, rc, cb), 50);
			}	
			else
			{
				cb();		
			}
		},
		updateVScroll : function(scrollDiv, scrollObj, newWidth, newHeight, retryCount, cb)
		{			
			scrollDiv.height(newHeight);
			scrollDiv.hide().show(0);
			scrollObj.refresh();
			if(scrollObj.scrollerHeight != newHeight && retryCount > 0)
			{
				var rc = retryCount - 1;
				setTimeout(util.updateVScroll(scrollDiv, scrollObj, newWidth, newHeight, rc, cb), 50);
			}	
			else
			{
				cb();		
			}
		}
	};
	return util;
});