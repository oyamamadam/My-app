if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['util/IchUtil',
        'util/AppUtil',
        "mainPane/view_pane/ViewPaneHelper",
        'adptr/DeviceAdaptor',
        'hammerTime'],

function(IchUtil, AppUtil, ViewPaneHelper, DeviceAdaptor, FullScreenItemHtml, hammerTime)
{
	var isFullScreen = false;
	var pageWidth = undefined;
	var contentWidth = undefined;
	var pageHeight = undefined;
	var fsDiv = undefined;
	var hScroll = undefined;
	var ScrollUtil = undefined;
	var fsItem1 = undefined;
	var fsItem2 = undefined;
	var fsItem3 = undefined;
	var lastScrollX = undefined;
	var dataProvider = undefined;
	var helper = undefined;
	var picHeight = undefined;
	var picWidth = undefined;
	var picWidthNarrow = undefined;
    // BW hammertime
    // var myElement = document.getElementById('fsParentDiv');
    // var mc = new Hammer(myElement);

	function toggleFullScreen()
	{
		if(isFullScreen)
		{
			$('#fullScreen').show();
		}
		else
		{
			$('#fullScreen').hide();
			dataProvider = {};
			updateScroll(0, 0);
		}
	}

	function updateScroll(newWidth, scrollToX)
	{
       console.log("scrollToX: " + scrollToX);

       //BH: remove right arrow if at beginning
       if(scrollToX != 0 ) {
       $('#leftArrow').css('visibility', 'visible');
       } else {
       $('#leftArrow').css('visibility', 'hidden');
       }

		hScroll.scrollTo(-scrollToX, 0, 0);
		contentWidth = newWidth;
		lastScrollX = scrollToX;

		ScrollUtil.updateScroll(fsDiv, hScroll, newWidth, pageHeight, 10, function()
		{
			setChildPosition(scrollToX);
		});
	}

	function setChildPosition(startPos)
	{

      // console.log("test: " + startPos);


		fsItem1.css('left', startPos - pageWidth);
		fsItem2.css('left', startPos);
		fsItem3.css('left', startPos + pageWidth);
		updateItem(fsItem1);
		updateItem(fsItem2);
		updateItem(fsItem3);
	}

	var waiting = false;
	function onScroll()
	{
		if(waiting)
			return;
		waiting = true;
		setTimeout(function()
		{
			onScrolling(hScroll.x);
			waiting = false;
		}, 500);
	}

	function onScrolling(scrollX)
	{


//       console.log("hScroll.x: " + hScroll.x);
//       console.log("scrollX: " + scrollX);


       //BH: if at beginning, turn off left arrow
       if(scrollX != 0 ) {
        $('#leftArrow').css('visibility', 'visible');
       } else {
        $('#leftArrow').css('visibility', 'hidden');
       }

		var left1 = fsItem1.position().left;
		var left2 = fsItem2.position().left;
		var left3 = fsItem3.position().left;
		var firstItem = get1stItem(left1, left2, left3);
		var midItem = get2ndItem(left1, left2, left3);
		var lastItem = get3rdItem(left1, left2, left3);
		var currentScrollX = Math.abs(scrollX);

		if(lastScrollX > currentScrollX) //scrolling left
		{
			var canMoveLeft = (midItem.position().left > currentScrollX);
             //console.log("canMoveLeft: " +  canMoveLeft);
			if(canMoveLeft)
			{
				scrollLeftHandler(firstItem, lastItem);
				updateItem(lastItem);
			}
		}
		else
		{
			var canMoveRight = (midItem.position().left < currentScrollX);
           // console.log("canMoveRight: " +  canMoveRight);
			if(canMoveRight)
			{
                scrollRightHandler(firstItem, lastItem);
				updateItem(firstItem);
			}
		}
		lastScrollX = currentScrollX;
	}

	function scrollLeftHandler(firstItem, lastItem)
	{
		var newX = parseInt(helper.searchAndReplaceNoCase(firstItem.css("left"), 'px', '')) - pageWidth;
		lastItem.css('left', newX);
	}

	function scrollRightHandler(firstItem, lastItem)
	{
		var newX = parseInt(helper.searchAndReplaceNoCase(lastItem.css("left"), 'px', '')) + pageWidth;
		firstItem.css('left', newX);
	}

	function get1stItem(left1, left2, left3)
	{
		if(left1 < left2 && left1 < left3)
			return fsItem1;
		else if(left2 < left1 && left2 < left3)
			return fsItem2;
		return fsItem3;
	}

	function get2ndItem(left1, left2, left3)
	{
		if((left1 > left2 && left1 < left3) || (left1 > left3 && left1 < left2))
			return fsItem1;
		else if((left2 > left1 && left2 < left3) || (left2 > left3 && left2 < left1))
			return fsItem2;
		return fsItem3;
	}

	function get3rdItem(left1, left2, left3)
	{
		if(left1 > left2 && left1 > left3)
			return fsItem1;
		else if(left2 > left1 && left2 > left3)
			return fsItem2;
		return fsItem3;
	}

	function updateItem(item)
	{
		var idx = item.css("left");
		var picInfo = dataProvider[idx];
		var fsImg = $(".fsImg", item);


       /*
       // BW added make left arrow visible if not on first images
       if(idx != "0px") {
            $('#leftArrow').css('visibility', 'visible');
       }
       */
        //console.log("test: " + fsImg);

		if(picInfo == undefined)
		{
                    // If getting error from end of IDX, hide right arrow
                   if(idx.charAt(0) != '-')
                   {
 //                     console.log("idx.charAt(0) is " + idx.charAt(0));
                       $('#rightArrow').css('visibility', 'hidden');
                   }

//            if(idx.indexOf('-') === -1)
//            {
//                $('#rightArrow').css('visibility', 'hidden');
//            }
			console.log("ERROR = " + idx);
			fsImg.attr("src", "");
			fsImg.width(0);
			return;
		}
		else
		{

       //BH:  Fix to make isVertical work
//            var aspectRatio = imgWidth/imgHeight;
//            if (aspectRatio > 1)
//                isVertical = false;
//            else
//                isVertical = true;


//            console.log("imgWidth is " + imgWidth);
//            console.log("imgHeight is " + imgHeight);
//            console.log("aspectRatio is " + aspectRatio);

//			var isVertical = imgHeight > imgWidth;  //BH:  Old isVertical code.

//            console.log("isVertical is " + isVertical);
			//if(DeviceAdaptor.inBrowser) // for browser testing
			//	picInfo.source_file = "http://placekitten.com/" + picWidthNarrow + '/' + picHeight;
			// ( add by 15 21.05.2015
			//if(DeviceAdaptor.inBrowser)
			//	picInfo.source_file = "http://placekitten.com/" + picWidth + '/' + picHeight;
			// add by 15 21.05.2015 )
			fsImg.attr("src", picInfo.source_file);


            //BH Compute size of image and set dimentions
            var imgWidth = picInfo.orgWidth;
            var imgHeight = picInfo.orgHeight;
            var ratio = [picWidth / imgWidth, picHeight / imgHeight];
            ratio = Math.min(ratio[0], ratio[1]);
//            console.log("ratio is " + ratio);
            fsImg.width(imgWidth*ratio);
            fsImg.height(imgHeight*ratio);


//			if(isVertical)
//				fsImg.width(picWidthNarrow);
//			else
//				fsImg.width(picWidth);
		}
	}

	helper =
	{
		setView : function($vpItem)
		{
			isFullScreen = true;
			toggleFullScreen();
			dataProvider = {};
			var scrollTo = 0;
			var visiblePicInfos = ViewPaneHelper.getVisiblePicInfo();
			var n = (visiblePicInfos) ? visiblePicInfos.length : 0;

            //BH Initialize Arrows
            $('#rightArrow').css('visibility', 'visible');
            $('#leftArrow').css('visibility', 'visible');


            console.log("in setView: n is " + n);
			var picId = $vpItem.attr("picId");
			for(var i = 0; i < n; i++)
			{
				var picInfo = visiblePicInfos[i];
				if(picId == picInfo.id)
					scrollTo = i * pageWidth;
				var idx = i * pageWidth + "px";
				dataProvider[idx] = picInfo;
			}
			updateScroll(n * pageWidth, scrollTo);
		},
		setFullScreenDefaults : function(h, w, scrollUtil, picH, picW, picW2)
		{
			pageWidth = w;
			pageHeight = h;
			ScrollUtil = scrollUtil;
			fsDiv = $("#fullScreen #fsParentDiv #fsScrollWrapper #fullScreenItems");
			hScroll = ScrollUtil.setHScroll("#fullScreen #fsParentDiv #fsScrollWrapper");
			hScroll.on('scroll', onScroll);
			hScroll.disable();
			fsItem1 = $("#fsItem0", fsDiv);
			fsItem2 = $("#fsItem1", fsDiv);
			fsItem3 = $("#fsItem2", fsDiv);
			fsItem1.width(pageWidth);
			fsItem2.width(pageWidth);
			fsItem3.width(pageWidth);
			picHeight = picH;
			picWidth = picW;
			picWidthNarrow = picW2;

			var fsImg = $(".fsImg", "#fullScreen #fsParentDiv #fsScrollWrapper #fullScreenItems .fsItem");

//            console.log("picHeight is " + picHeight);
//            console.log("picWidth is " + picWidth);
//
//			fsImg.height(picHeight);
//            fsImg.width(picWidth);
		},
		invokeZoomIn : function($img)
		{
		},
		onRightArrowClick : function()
		{
            $('#leftArrow').css('visibility', 'visible');

			var left1 = fsItem1.position().left;
			var left2 = fsItem2.position().left;
			var left3 = fsItem3.position().left;
			var lastItem = get3rdItem(left1, left2, left3);
			var lastItemX = lastItem.position().left;

			if(lastItemX >= contentWidth)
				return;

			hScroll.scrollTo(-lastItemX, 0, 500);

			setTimeout(function(){
				onScrolling(lastItemX);
			}, 500);
		},
		onLeftArrowClick : function()
		{
            // BW
             $('#rightArrow').css('visibility', 'visible');

			var left1 = fsItem1.position().left;
			var left2 = fsItem2.position().left;
			var left3 = fsItem3.position().left;
			var firstItem = get1stItem(left1, left2, left3);
			var firstItemX = firstItem.position().left;

			if(firstItemX < 0)
				return;

			hScroll.scrollTo(-firstItemX, 0, 500);

			setTimeout(function(){
				onScrolling(firstItemX);
			}, 500);
		},
		searchAndReplaceNoCase: function (str, searchvalue, replace)
		{
			var re = new RegExp(searchvalue,"gi");
			return str.replace(re, replace);
		},
		onCollapseClick : function()
		{
			isFullScreen = false;
			toggleFullScreen();
		}
	};
	return helper;
});