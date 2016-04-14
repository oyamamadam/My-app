// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['cls'],
function(cls) {  

    console.debug("photo-db.js");
    var db = window.openDatabase("BiblioSmartDB", "1.0", "Biblio Smart DB", 200000);
    db.transaction(setupDb, onDbError, onDbSuccess);
    var cacheMap = {};
    var cacheArray = [];

    function setupDb(tx){
		tx.executeSql("CREATE TABLE IF NOT EXISTS PHOTOS (path UNIQUE, ignore, keywords, gpsPosition, lastModifiedDate)");
		tx.executeSql("SELECT * FROM PHOTOS", [], onSelectAllPhotosSuccess, onDbError);    	
    }

    function onDbError(error){
    	console.error('onDbError ' + error.message);
    }
    
    function onDbSuccess(tx, results){
		console.debug('onDbSuccess');
    }

    function onSelectAllPhotosSuccess(tx, results) {
		var len = results.rows.length;
		var msg = len == 0 ? "No PHOTOS's in the database" : "PHOTO DB loaded with "+ len +" records";
		cacheMap = {}; cacheArray = [];  // reset cache to empty
		for (var i = 0; i < len; i++) {
			var row = results.rows.item(i);
			var photo = convertToPhoto(row);
			cacheMap[photo.path] = photo;
			cacheArray.push(photo);
		}
		console.debug(msg);
	}

	function onDbGetValueSuccess(tx, results) {
		console.debug("onDbGetValueSuccess 1 " + tx);
		console.debug("onDbGetValueSuccess 2 " + results);
	}

    function upsertRow(path, metadata, ignore){
    	var photo = convertToDB(path, metadata, ignore);
    	upsertCache(photo);
		db.transaction(
			function(tx){
				tx.executeSql("REPLACE INTO PHOTOS (path, ignore, keywords, gpsPosition, lastModifiedDate) VALUES (?, ?, ?, ?, ?)",
					[photo.path, photo.ignore, photo.keywords, photo.gpsPosition, photo.lastModifiedDate]);
			}, 
			onDbError, onDbSuccess);
    }

    function deletePhoto(path){
    	deleteCache(path);
		db.transaction(
			function(tx){
				tx.executeSql("DELETE FROM PHOTOS where key=?",[path]);
			}, 
			onDbError, onDbSuccess);
    }

    function ignorePhoto(path, ignore){
    	if(cacheMap.hasOwnProperty(path)){
    		cacheMap[path].ignore = ignore;
			db.transaction(
				function(tx){
					tx.executeSql("UPDATE PHOTOS SET ignore=? WHERE path=?", [ignore, path]);
				}, 
				onDbError, onDbSuccess);
		}
    }

    function getPhoto(path){
    	return cache[path];
		// db.transaction(
		// 	function(tx){
		// 		tx.executeSql("SELECT * FROM PHOTOS where key=?",[key]);
		// 	}, 
		// 	onDbError, onDbGetValueSuccess);
    }

    function getAllPhotos(){
    	return cacheArray;
    }

    function convertToPhoto(row){
		var photo = {
			path : row.path, 
			ignore : row.ignore == "true" ? true : false,
			keywords : row.keywords ? row.keywords.trim().split(",") : [], 
			gpsPosition : row.gpsPosition ? row.gpsPosition.trim().split(",") : [], 
			lastModifiedDate : new Date(row.lastModifiedDate)
		};
		if(photo.gpsPosition.length > 0){
			for (var i = photo.gpsPosition.length - 1; i >= 0; i--) {
				photo.gpsPosition[i] = Number(photo.gpsPosition[i]);
			}
		}
		return photo;    	
    }

    function convertToDB(path, metadata, ignore){
		var photo = {
			path : path, 
			ignore : ignore,
			keywords : metadata.keywords, 
			gpsPosition : metadata.gpsPosition ? [metadata.gpsPosition.latitude, metadata.gpsPosition.longitude] : [], 
			lastModifiedDate : metadata.lastModifiedDate
		};
		return photo;     	
    }

    function upsertCache(photo){
    	if(cacheMap.hasOwnProperty(photo.path)){
		    for(var i=0; i<cacheArray.length; i++) {
		        if (cacheArray[i].path == photo.path){
		        	cacheArray[i] = photo;
		        	break;
		        }
		    }
    	}else{
    		cacheArray.push(photo);
    	}
    	cacheMap[photo.path] = photo;
    }

    function deleteCache(path){
    	if(cacheMap.hasOwnProperty(path)){
		    for(var i=0; i<cacheArray.length; i++) {
		        if (cacheArray[i].path == path){
		        	cacheArray.splice(i,1);
		        	break;
		        }
		    }
		    cacheMap[path] = undefined;
    		delete cacheMap[path];
    	}
    }

    var me = {
    	///
    	// Checks if PHOTODB is empty.
    	// It should be used to while loading all initial data into photo db
    	// For example, if photodb.isEmpty(), then in a for loop photodb.add(photo) can be executed to load the data into PHOTODB
    	isEmpty: function()
    	{
    		return cacheArray.length == 0;
    	},
    	///
    	// Adds one photo to the PHOTODB database.
    	// If photo path is the same as existing row in the db, then record is updated with new values.
    	// @param   photo   Instance of cls.Pic class
		add: function(photo)
		{
			upsertRow(photo.path, photo.metadata, false);  // under the hood both add and update will call upsert
		},
    	///
    	// Updates one photo to the PHOTODB database.
    	// If photo path is the same as existing row in the db, then record is updated with new values.
    	// @param   photo   Instance of cls.Pic class
		update: function(photo)
		{
			upsertRow(photo.path, photo.metadata, false);  // under the hood both add and update will call upsert
		},
    	///
    	// Deletes one photo from the PHOTODB database by a given path.
    	// It should be only used to clean up database.
    	// @param   phath   Instance of a string
		delete: function(path)
		{
			deletePhoto(path);
		},
		///
		// Sets ignore tag to true on a picture if user decides to not include a photo in the application
    	// @param   phath   Instance of a string
		ignore: function(path)
		{
			ignorePhoto(path, true);
		},
		///
		// Sets ignore tag to false on a picture. 
    	// @param   phath   Instance of a string
		unignore: function(path)
		{
			ignorePhoto(path, false);
		},
		///
		// Gets database photo onbject for a given path. 
    	// @param   path   Instance of a string
    	// @return  object photo = { path,        // String
		//	  						 ignore,      // Boolean true or false
		//	                         keywords,    // Array of String keywords
		//	  						 gpsPosition, // Array of 2 Numbers: first latitude, second longitude
		//	                         lastModifiedDate  // Date object
		//  					   }
		get: function(path)
		{
			return getPhoto(path);
		},
		///
		// Gets reference to all database photo objects. 
		getAll: function(){
        	return getAllPhotos();
		},
		/// 
		// Unit tests
		test:function()
		{
		    // TESTs
		    
		    // 1) adding new photo
		    var photo1 = new cls.Pic("id", "name", "path1", new cls.Metadata(["keyword_x","keyword_y","keyword_z"], new Date(), new cls.GPSPosition(-44.54, 23.09)));
		    me.add(photo1);
		    
		    // 2) update photo keywords with "2" at the end of each keyword
		    photo1 = new cls.Pic("id", "name", "path1", new cls.Metadata(["keyword_x2","keyword_y2","keyword_z2"], new Date(), new cls.GPSPosition(-44.54, 23.09)));
		    me.update(photo1);
            
            // 3) ignore photo1 test
            me.ignore(photo1.path);

            // 4) unignore photo1 test
            me.unignore("abc");
		}
	};

	return me;
});