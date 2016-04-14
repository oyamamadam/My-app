define(["util/AppUtil","text!test/TestPage.html","css!test/TestPage","phonegap"],
function(AppUtil,testHTML,testCSS,phonegap)
{
	var urls = [];
	var metadata = [];

	function addListeners()
	{
		AppUtil.addTouchEvent('#testPage #getAllPhotos', getAllPhotos);
		AppUtil.addTouchEvent('#testPage #getPhotoMetadata', getPhotoMetadata);
		AppUtil.addTouchEvent('#testPage #showThumbnails', showThumbnails);
		AppUtil.addTouchEvent('#testPage #showOriginalPhoto', showOriginalPhoto);
		$(document).on("allPhotosChange", allPhotosChangeHandler);
		$(document).on("photoMetadataChange", photoMetadataChangeHandler);
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function getAllPhotos()
	{
		phonegap.getAllPhotos();  
	}
	function allPhotosChangeHandler(event, data){
		urls = data;
		console.log("testPage.allPhotosChangeHandler " + data.length);
		p = $("#getAllPhotosText", "#testPage")[0];
		p.innerHTML = "We got " + data.length + " photo urls";
		if(data.length>0) p.innerHTML += "<br/> URL1 = " + data[0];
		if(data.length>1) p.innerHTML += "<br/> URL2 = " + data[1];
 	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function getPhotoMetadata()
	{
		var url100 = urls.slice(0,100);
		phonegap.getPhotoMetadata(url100);  
	}
	function photoMetadataChangeHandler(event, data)
	{
		metadata = data;
		console.log("testPage.photoMetadataChangeHandler " + data.length);
		p = $("#getPhotoMetadataText", "#testPage")[0];
		p.innerHTML = "We got " + data.length + " photo metadata objects";
		if(data.length>0) p.innerHTML += "<br/> Metadata1 = " + data[0].filename + ", " + data[0].date + ", " + data[0].width + "x" + data[0].height;
		if(data.length>1) p.innerHTML += "<br/> Metadata2 = " + data[1].filename + ", " + data[1].date + ", " + data[1].width + "x" + data[1].height;
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function showThumbnails()
	{  
		var count = urls.length;
		if(count>0){
			var index1 = randomInt(0,count-1);
			var index2 = randomInt(0,count-1);
			var index3 = randomInt(0,count-1);
			var index4 = randomInt(0,count-1);
			var index5 = randomInt(0,count-1);
			p = $("#showThumbnailsText", "#testPage")[0];
			p.innerHTML = "Show thumbnails ... " + [index1,index2,index3,index4,index5];
			var showThumb = function(img,url){
				img.src = url;
				img.width = 4*40;
				img.height = 3*40;
			}; 			
			var thumb1 = $("#thumb_1", "#testPage")[0];
			var thumb2 = $("#thumb_2", "#testPage")[0];
			var thumb3 = $("#thumb_3", "#testPage")[0];
			var thumb4 = $("#thumb_4", "#testPage")[0];
			var thumb5 = $("#thumb_5", "#testPage")[0];
			showThumb(thumb1,urls[index1]);
			showThumb(thumb2,urls[index2]);
			showThumb(thumb3,urls[index3]);
			showThumb(thumb4,urls[index4]);
			showThumb(thumb5,urls[index5]);
		}
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function showOriginalPhoto()
	{
		var count = urls.length;
		if(count>0){
			var index = randomInt(0,count-1);
			p = $("#showOriginalPhotoText", "#testPage")[0];
			p.innerHTML = "Show full screen photo ... " + index;
			var img = $("#originalImage", "#testPage")[0];
			img.src = urls[index];
		}
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function randomInt(min,max)
	{
	    return Math.floor(Math.random()*(max-min+1)+min);
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var testPage = 
	{
		init:function()
		{
			console.log("TestPage.init");
			//console.log(testHTML);
			AppUtil.applyIchTemplate('testHTML', testHTML, $('#testPage'));			
			
			addListeners();
		},
		showPage:function()
		{
			console.log("TestPage.show");
			$('#testPage').show();
		}
	};
	return testPage;
});