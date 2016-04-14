// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log', 'util/AppUtil'],
function(log, AppUtil)
{
	var layoutUtil = {};
	function onWindowResize()
	{
		applyPageValues();	
		layoutUtil.validateMain();
	}
	
	function applyPageValues()
	{
		setWindowDimensionOn($("#contentPage"));
	}
	
	function setUI(ui, min, max, prc, isWidth)
	{
		var wd = getWindowDimension();
		var wv = (isWidth) ? wd.width : wd.height;
		var val = wv * (prc/100);
		if(val > max)
			val = max;
		else if(val < min)
			val = min;
		(isWidth) ? $(ui).width(val) : $(ui).height(val);
	}	
	
	function applyMarginTopStyle(comp)
	{
		var compHeight = $(comp).height();	
		$(comp).css("margin-top", -compHeight/2);	
	}
	
	function getWindowDimension()
	{
		var $win = $.mobile.window;
		var wd = {x: $win.scrollLeft(),y: $win.scrollTop(),width: ( window.innerWidth || $win.width() ),height: ( window.innerHeight || $win.height())};
		return wd;
	}
	
	function setWindowDimensionOn(comp)
	{
		var $win = $.window; // or get it from phonegap. 
		$(comp).width(window.innerWidth || $win.width());
		$(comp).height(window.innerHeight || $win.height());
	}
		
	layoutUtil = {
		appHeight: undefined,
		appWidth: undefined,
		picHeight: undefined,
		picWidth : undefined,
		picWidthNarrow : undefined,
		picFSHeight: undefined,
		picFSWidth : undefined,
		picFSWidthNarrow : undefined,
		
		init: function()
		{
			if(this.appHeight == undefined)
			{
				var loadingCan = $('#loaderDiv');
				this.appHeight = loadingCan.height();
				this.appWidth = loadingCan.width();
				//CALCULATE 4:3 RATIO for image size in Full Screen:
				this.picFSHeight = this.appHeight;
				this.picFSWidth = Math.floor(4 * this.picFSHeight / 3);
				this.picFSWidthNarrow = Math.floor(2.25 * this.picFSHeight / 3);	
			}
		}, 
		invokeResize:function()
		{
			//applyPageValues();
		},
		validateHeader:function()
		{
//			var header = $("#header", "#contentPage");
//			setUI(header, 35, 60, 10, false);
//			var h = $(header).height();
//			var navDiv = $("#navDiv", header);
//			$(navDiv).css("top", h/2 - $(navDiv).height()/2);
//			var headerBox = $("#headerBox", header);
//			$(headerBox).css("top", h/2 - $(headerBox).height()/2);
		},
		validateContent:function()
		{
//			var header = $("#header", "#contentPage");
//			var content = $("#contentBody", "#contentPage");
//			var h = $(header).height();
//			$(content).css("top", h);
		},
		validateMain:function()
		{
//			var refiner = $("#refiner", "#mainPane");
//			setUI(refiner, 200, 200, 20, true);
//			var rDiv = $("#rDiv", "#mainPane");
//			$(rDiv).css("left", $(refiner).width());
//			var tag = $("#tag", "#mainPane");
//			setUI(tag, 110, 300, 20, true);
//			var breadcrumb = $("#breadcrumb", rDiv);
//			setUI(breadcrumb, 40, 40, 10, false);
//			var stack = $("#stack", rDiv);
//			setUI(stack, 90, 90, 10, false);
//			$(stack).css("top", $(breadcrumb).height());
//			var subHeader = $("#subHeader", rDiv);
//			setUI(subHeader, 30, 40, 10, false);
//			$(subHeader).css("top", $(breadcrumb).height() + $(stack).height());
//			var viewPane = $("#viewPane", rDiv);
//			var topVal = $(breadcrumb).height() + $(stack).height() + $(subHeader).height();
//			var wd = getWindowDimension();
//			var hVal = wd.height - topVal - 60;
//			setUI(viewPane, hVal, hVal, 100, false);
//			$(viewPane).css("top", topVal);
		},
		validateContentPageSize : function()
		{
			//CALCULATE 4:3 RATIO for image size:
			var $viewPaneWrapper = $("#viewPaneWrapper");
			this.picHeight = $viewPaneWrapper.height() - 5;
       
            //BH:  use window size vs 2/3 apect ratio
            this.picWidth  = $viewPaneWrapper.width() - 5;
       
		//	this.picWidth = Math.floor(4 * this.picHeight / 3);
			this.picWidthNarrow = Math.floor(2.25 * this.picHeight / 3);		
			
		},
		getMinRefinerSectionHeight:function(openCount)
		{				
			var freeHeight = this.appHeight - 60 - (5 * 45); // 60 header height
			return freeHeight / openCount;
		}
	};
	return layoutUtil;
});