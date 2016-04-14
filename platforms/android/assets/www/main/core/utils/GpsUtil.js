if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['exif','cls'],
function(exif,cls) { 
    console.debug("GpsUtil.js");

	var me = {
		getPosition:function(exifdata){
			var gpsPosition = undefined;
	        if(exifdata){
	            var aLat = exif.getTag(exifdata, "GPSLatitude");  
	            var aLong = exif.getTag(exifdata, "GPSLongitude");  
	            if (aLat && aLong){
	                var strLatRef = exif.getTag(exifdata, "GPSLatitudeRef") || "N";  
	                var strLongRef = exif.getTag(exifdata, "GPSLongitudeRef") || "W";
	                var fLat = (aLat[0] + aLat[1]/60 + aLat[2]/3600) * (strLatRef == "N" ? 1 : -1);  
	                var fLong = (aLong[0] + aLong[1]/60 + aLong[2]/3600) * (strLongRef == "W" ? -1 : 1); 
	                gpsPosition = new cls.GPSPosition(fLat, fLong); 
	            }
	            else{
	                //console.debug("Exif GPS metadata is missing");
	            }
			}
			else{
				//console.debug("Exif metadata is undefined");
			}
			return gpsPosition;
		},

		applyLatLongRef:function(aLat, aLong, strLatRef, strLongRef){
			var fLat = aLat * (strLatRef == "N" ? 1 : -1);
			var fLong = aLong * (strLongRef == "W" ? -1 : 1);
			gpsPosition = new cls.GPSPosition(fLat, fLong);
			return gpsPosition;
		}
	};
	return me;
});