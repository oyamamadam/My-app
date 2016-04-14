// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['cls', 'util/GpsUtil', 'log', 'util/IchUtil'],
function(cls, gpsUtil, log, IchUtil) {  

    console.debug("scan-ios2.js");
    
    function createTestData(callBack)
    {
    	var n = 1027;
    	var data = [];
    	for(var i = 0; i < n; i++)
    	{
    		var item = {};
    		item.url = "C:\_dev_\git\BS_App_Dev\img" + i + ".png";
    		item.albumName = (new Date().getTime() % 3) ? "Sattie Work" : "Michal's Car";
    		data.push(item);
    	}	
    	callBack(data);
    }
    
    function createTestMetaData(urls, callBack)
    {
    	var n = urls.length;
    	var data = [];
    	for(var i = 0; i < n; i++)
    	{
    		var item = {};
    		item.url = urls[i];
    		item.date = "2014:03:16 10:26:48";
    		item.width = 2210;
    		item.height = 1000;
    		item.filename = "filename";
    		item.gps_Latitude = "33.46175";
    		item.gps_Longitude = "-111.9454889";
    		item.gps_LatitudeRef = "gps_LatitudeRef";
    		item.gps_LongitudeRef = "gps_LongitudeRef";
    		item.exif_DateTimeOriginal = "2014:03:16 10:26:48";
    		item.exif_DateTimeDigitized = "2014:03:16 10:26:48";
    		item.iptc_Keywords = undefined;
    		item.xmpCreateDate = "2014:03:16 10:26:48";
    		item.exifDateTime = "2014:03:16 10:26:48";
    		data.push(item);
    	}	
    	callBack(data);
    }

    var me = {

        getAllPhotos:function(callback){
        	console.log("scan-ios2.getAllPhotos");
            if (navigator.assetslib) 
            {
                navigator.assetslib.getAllPhotos(function(data)
                {
                	me.onGetAllPhotosSuccess(data);
                	callback(data);
                }, 
                me.onGetAllPhotosError);
            } else {
                console.log("scan-ios2.getAllPhotos > navigator.assetslib feature is unsupported");
                createTestData(callback);
            }
        },
        onGetAllPhotosSuccess:function(data){
            console.log("scan-ios.onGetAllPhotosSuccess > " + data.length);
            //alert("scan-ios.onGetAllPhotosSuccess\n" + data.length);
        },
        onGetAllPhotosError:function(error){
            console.log("scan-ios.onGetAllPhotosError > " + error);
        },

       // ( add by 15 21.05.2015
       /*
       getThumbnails:function(urls, callback){
       console.log("scan-ios2.getThumbnails");
              navigator.assetslib.getThumbnails(urls, function(data)
                                        {
                                        me.onGetThumbnailsSuccess(data);
                                        callback(data);
                                        },
                                        me.onGetThumbnailsError);
    
       },
	   */
		getThumbnails:function(urls, callback)
		{
			console.log("scan-ios2.getThumbnails");

			if(navigator.assetslib) 
			{
				navigator.assetslib.getThumbnails(urls, 
					function(data)
					{
						me.onGetThumbnailsSuccess(data);
						callback(data);
					},
					me.onGetThumbnailsError
				);
			}
			else
			{
				console.log("scan-ios2.getThumbnails > navigator.assetslib feature is unsupported");
				createTestData(callback);
			}
		},
       // add by 15 21.05.2015 )

       onGetThumbnailsSuccess:function(data){
       console.log("scan-ios.onGetThumbnailsSuccess > " + data.length);
       //alert("scan-ios.onGetAllPhotosSuccess\n" + data.length);
       },
       onGetThumbnailsError:function(error){
       console.log("scan-ios.onGetThumbnailsError > " + error);
       },

       
       
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getPhotoMetadata:function(urls,callback){
            if (navigator.assetslib) {
                navigator.assetslib.getPhotoMetadata(urls, function(data){me.onGetPhotoMetadataSuccess(data);callback(data);}, me.onGetPhotoMetadataError);
            } else {
                console.log("scan-ios.getPhotoMetadata > navigator.assetslib feature is unsupported");
                createTestMetaData(urls, callback);
            }
        },
        onGetPhotoMetadataSuccess:function(data){
            console.log("scan-ios.onGetPhotoMetadataSuccess > " + data.length);
            //alert("scan-ios.onGetPhotoMetadataSuccess\n" + data.length);
        },
        onGetPhotoMetadataError:function(error){
            console.log("scan-ios.onGetPhotoMetadataError > " + error);
        }
    };

    return me;
});