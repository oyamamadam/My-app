// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['cls', 'util/GpsUtil', 'log', 'util/IchUtil'],
function(cls, gpsUtil, log, IchUtil) {  

    console.debug("scan-ios.js");

    var me = {
	   	getPicturesCallback: undefined,
    	pictureFiles:[],
    	pictureFilesHash:{},
    	thumbnails:[],
    	imgCount : undefined,

    	getPictures:function(callback){
    		me.getPicturesCallback = callback;
        	if (typeof DirectoryEntry == "undefined"){
                console.warn("scan-ios.getPictures > DirectoryEntry feature is unsupported");
            } else {
				console.debug("scan-ios.getPictures > start");
				me.getAllPhotoMetadata();
            }
    	},

        getAllPhotoMetadata:function() {
            //cordova.exec(me.onGetAllPhotoMetadataSuccess, me.onGetAllPhotoMetadataError, "PhotoLibrary", "getAllPhotos", []);
            if (navigator.assetslib) {
                navigator.assetslib.getAllPhotoMetadata(me.onGetAllPhotoMetadataSuccess, me.onGetAllPhotoMetadataError);
            } else {
                console.log("scan-ios.getAllPhotoMetadata > navigator.assetslib feature is unsupported");
                //alert("phonegap::getAllPhotoThumbnails > navigator.assetslib feature is unsupported");
            }

        },

        onGetAllPhotoMetadataSuccess:function(data){
        	me.thumbnails = data;
            console.log("scan-ios.onGetAllPhotoMetadataSuccess > " + data.length);
            //alert("iOS onGetAllPhotosSuccess\n" + data.length);
            imgCount = data.length;
            $.event.trigger("wizardEvent", {type: "dirScanComplete", total: imgCount});
                        
            for (var i = 0; i < data.length; i++) 
            {
            	var dict = data[i];
            	var pic = me.convertIosPhoto(dict);
	            if (!me.pictureFilesHash.hasOwnProperty(pic.path)) 
	            {
	                me.pictureFiles.push(pic);                 	
	                me.pictureFilesHash[pic.path] = pic;
	                //me.loadImg(pic);
	                console.log("PIC METADATA:");
	                if(pic && pic.metadata)
	                {
	                	console.log(pic.metadata);
		                console.log(pic.path);
		                console.log("_");
	                }	
	                else
	                {
	                	console.log("META DATA IS UNDEFINED!!!!!!");
	                }	
	            }
	            else
	            {
	            	console.warn(pic.path + "is a duplicate. Skipping...");
	            	imgCount--;
	            }	            
            };      
            console.log("DONE SCANNING IOS");
            me.getPicturesCallback(me.pictureFiles);
        },
        
        loadImg : function(pic)
        {
        	console.log("1. " + pic.path);
        	 $("<img>", { src: pic.path }).bind('load', function() 
        	 {
        		 pic.width = this.width;
              	 pic.height = this.height;
              	 imgCount--;
              	 console.log("imgCount = "  + imgCount);
              	 $.event.trigger("wizardEvent", {type: "fileScanComplete", remaining: imgCount});
                 if (imgCount == 0 && me.getPicturesCallback != undefined) 
                 {
                	 console.log("done = "  + imgCount);
                 	me.getPicturesCallback(me.pictureFiles);
                 };
        	 });
        },

        convertIosPhoto:function(d){
            if (!d) return null;
            var keywords = d.hasOwnProperty("iptc_Keywords") ? d["iptc_Keywords"] : [];
            var lastModifiedDate = d.hasOwnProperty("date") ? d["date"] : null;
            if(lastModifiedDate) {
            	lastModifiedDate = lastModifiedDate.substring(0,22) + ":" + lastModifiedDate.substr(22);
            }
            var gpsPosition = d.hasOwnProperty("gps_Latitude") && d.hasOwnProperty("gps_Longitude") ? 
            	gpsUtil.applyLatLongRef(d["gps_Latitude"], d["gps_Longitude"], d["gps_LatitudeRef"], d["gps_LongitudeRef"]) :
            	null;

        	var meta = new cls.Metadata(keywords, new Date(lastModifiedDate), gpsPosition);
            meta.xmpCreateDate = null;
            meta.xmpMetadataDate = null;
            meta.exifDateTimeOriginal = d.hasOwnProperty("exif_DateTimeOriginal") ? d["exif_DateTimeOriginal"] : null;
            meta.exifDateTimeDigitized = d.hasOwnProperty("exif_DateTimeDigitized") ? d["exif_DateTimeDigitized"] : null;
            meta.exifDateTime = null;

            var fullPath = d["url"];
            var filename = d["filename"];
            var pic = new cls.Pic(fullPath, filename, fullPath, meta); 
            // pic.base64encoded = d["base64encoded"];
            // console.debug("META: " + meta);
            // console.debug("PIC.name:" + pic.name + " PIC.path:" + pic.path);
            // console.debug("PIC: " + pic);
            // console.debug("d: " + d);
            //console.log("meta.exifDateTimeOriginal: " + meta.exifDateTimeOriginal);
            //console.log("meta.exifDateTimeDigitized: " + meta.exifDateTimeDigitized);

            return pic;
        },

        onGetAllPhotoMetadataError:function(error){
            console.log("scan-ios.onGetAllPhotoMetadataError > " + error);
        },


        getThumbnails:function(list){
            if (navigator.assetslib) {
                navigator.assetslib.getThumbnails(list, me.onGetThumbnailsSuccess, me.onGetThumbnailsError);
                //cordova.exec(me.onGetThumbnailsSuccess, me.onGetThumbnailsError, "AssetsLib", "getThumbnails", [list]);
            } else {
                console.warn("scan-ios.getThumbnails > navigator.assetslib feature is unsupported");
            }
        },
       
        onGetThumbnailsSuccess:function(data){
            console.log("scan-ios.onGetThumbnailsSuccess > " + data.length);
            //alert("iOS onGetThumbnailsSuccess\n" + data.length);
            $.event.trigger("iosThumbnailsChange",[data]);
        },
       
        onGetThumbnailsError:function(error){
            console.log("scan-ios.onGetThumbnailsError > " + error);
        },


        getFullScreenPhotos:function(list){
            if (navigator.assetslib) {
                navigator.assetslib.getFullScreenPhotos(list, me.onGetFullScreenPhotosSuccess, me.onGetFullScreenPhotosError);
                //cordova.exec(me.onGetFullScreenPhotosSuccess, me.onGetFullScreenPhotosError, "AssetsLib", "getFullScreenPhotos", [list]);
            } else {
                console.warn("scan-ios.getAllPhotoThumbnails > navigator.assetslib feature is unsupported");
            }
        },
       
        onGetFullScreenPhotosSuccess:function(data){
            console.log("scan-ios.onGetFullScreenPhotosSuccess > " + data.length);
            //alert("iOS onGetFullScreenPhotosSuccess\n" + data.length);
            $.event.trigger("iosFullScreenPhotosChange",[data]);
        },
       
        onGetFullScreenPhotosError:function(error){
            console.log("scan-ios.onGetFullScreenPhotosError > " + error);
        },

    };

    return me;
});