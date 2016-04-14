if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['util/IchUtil', 
        'util/AppUtil',        
        'adptr/DeviceAdaptor',
        "text!mainPane/view_pane/grid/GridItem.html",
        "m/AppModel",
        'enum/AppEnum',
        'util/LayoutUtil',
        'util/ScrollUtil',
        'phonegap'],
        
function(IchUtil, AppUtil, DeviceAdaptor, GridItemHTML, AppModel, AppEnum, LayoutUtil, ScrollUtil, phonegap)
{
	var picHeight = undefined;
	var picWidth = undefined;
	var picWidthNarrow = undefined;
	var items = undefined;
	var gridPane = undefined;
	var gridPaneItems = undefined;
	var defaultSet = false;
	var hScroll = undefined;
	var itemsServed = undefined;
	var totalWidth = undefined;
    var items = [];
	
	function updateScroll()
	{			
		hScroll.scrollTo(0, 0, 0);
		var newWidth = (itemsServed && itemsServed.length > 2) ? Math.ceil(totalWidth / 3) : totalWidth;
		ScrollUtil.updateScroll(gridPaneItems, hScroll, newWidth, 0, 10, function()
		{
			//console.log("GRID SCROLL UPDATED");
		});
	}
       
 
	
	function addGridItem(picInfo)
	{
       var imgWidth = picInfo.orgWidth;
       var imgHeight = picInfo.orgHeight;
       var gridViewImageHeight = LayoutUtil.picHeight / 3
       var ratio = (gridViewImageHeight / imgHeight);
//       picInfo.gpWidth = Math.ceil(imgWidth*ratio);
//       picInfo.gpHeight = Math.ceil(imgHeight*ratio);
       
//       console.log("picInfo.gpWidth " + picInfo.gpWidth);
//       console.log("picInfo.gpHeight " + picInfo.gpHeight);

//
              picInfo.gpWidth = 157;
              picInfo.gpHeight = 157;

//       
//       console.log("picInfo.gpWidth is " + picInfo.gpWidth);
//       console.log("picInfo.gpHeight is " + picInfo.gpHeight);
//       console.log("picInfo.source_file is " + picInfo.source_file);
//


//		picInfo.gpWidth = (picInfo.orgWidth > picInfo.orgHeight) ? picWidth : picWidthNarrow;
//		picInfo.gpHeight = picHeight;
//		if(DeviceAdaptor.inBrowser) // for browser testing
//			picInfo.source_file = "http://placekitten.com/" + picInfo.gpWidth + '/' + picInfo.gpHeight;
//        console.log("picinfo.base64encoded is " + picInfo.base64encoded);
        totalWidth = totalWidth + picInfo.gpWidth + 15;
		IchUtil.appendIchTemplate('noname', GridItemHTML, gridPaneItems, picInfo);

	}
       
       function invokeDataLoad(urls)
       {
       phonegap.getThumbnails(urls, dataLoaded);
       }

       
       function dataLoaded(data)
       {
        var l = data.length;
        var n = helper.items.length;
        if (n == l)
        {
            for (var j = 0; j < n; j ++)
            {
                var item = helper.items[j];
                var itemUrl = item.source_file;
       
       
       
                for (var i = 0; i<l; i++)
                {
                    var dataItem = data[i];
                    var url = dataItem.url;
                    var base64encoded = "data:image/png;base64, " + dataItem.base64encoded;
//                    var base64encoded = dataItem.base64encoded;
                    if (url == itemUrl)
                    {
                        item.base64encoded = base64encoded;
                        break;
                    }

                }
                addGridItem(item);
            }
                itemsServed = helper.items;
                updateScroll();
        }
        else
        {
            console.log("error in thumbnail substitution");

      
        }
       
       

       }
       
       
       
	
	var helper = {
		setData : function(data)
		{
			helper.items = (data && data.items) ? data.items : undefined;
			helper.setView();
		},
		setView : function()
		{		
			if(AppModel.isGrid && helper.items)
			{
				if(helper.items == itemsServed) // it is the same collection, leave it be.
					return;
				totalWidth = 0;
				gridPaneItems.empty();
				var items = helper.items;
                var urls = [];
 				var n = items.length;

                for(var i = 0; i < n; i++)
				{
					var item = items[i]; // picInfo
                    console.log("item.source_file is " + item.source_file);
                    urls[i] = item.source_file;
//                    addGridItem(item);

				}
                invokeDataLoad(urls);
//				itemsServed = helper.items;
//				updateScroll();
			}	
		},
       

		setDefaults : function(parentPane)
		{
			if(defaultSet == false)
			{
				defaultSet = true;
				gridPane = parentPane;
				gridPaneItems = $("#gridPaneItems", parentPane);
 
//				picHeight = Math.floor(LayoutUtil.picHeight / 3) - 5;
//				picWidth = Math.floor(LayoutUtil.picWidth / 3);
//				picWidthNarrow = Math.floor(LayoutUtil.picWidthNarrow / 3);
				hScroll = ScrollUtil.setHScroll("#contentPage #contentBody #mainPane #rDiv #viewPaneWrapper #gridPane");
			}	
		}
	};
	return helper;
});