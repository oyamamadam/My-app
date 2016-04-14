define(['cordova', 'log', 'cls', 'adptr/DeviceAdaptor'], 
function(cordovaModule, log, cls, DeviceAdaptor) {

	var phonegap = {
        connection:undefined,     // phonegap connection information, when changed "connectionChange" even is fired
        deviceInfo:undefined,     // phonegap device information, when changed "deviceInfoChange" even is fired
        filesystem:undefined,
        imageData:undefined,
        allThumbnails:undefined,
        pictureFiles:[],
        pictureFilesHash:{},
        littleEndian:undefined,


        // Device Constructor
        initialize: function() {
            phonegap.bindEvents();
        },
        // Bind Event Listeners
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },

        onDeviceReady: function() {
            console.log('phonegap::onDeviceReady');
            //alert("phonegap::onDeviceReady");
            phonegap.checkDevice();
            //phonegap.checkConnection();
            phonegap.getFileSystem();
    
            var db = window.openDatabase("BiblioSmartDB", "1.0", "Saved Notes", 200000);
            db.transaction(phonegap.getDbNotes, phonegap.onDbError, phonegap.onDbSuccess);

            var littleEndian = (function() {
              var buffer = new ArrayBuffer(2);
              new DataView(buffer).setInt16(0, 256, true);
              return new Int16Array(buffer)[0] === 256;
            })();
            console.log("littleEndian >>> " + littleEndian); // true or false
            phonegap.littleEndian = littleEndian;
        },

        getDbNotes:function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS NOTES (notetitle, notedetail, imagesource, notelat, notelon)");
            tx.executeSql("SELECT * FROM NOTES", [], phonegap.onSelectNotesSuccess, phonegap.onDbError);
        },

        onDbSuccess:function(tx, results) {
            console.log('phonegap::onDbSuccess');
        },

        onDbError:function(error) {
            console.log('phonegap::onDbError > ' + error.message);
            //alert("Database error:\n" + error.message);
        },

        onSelectNotesSuccess:function(tx, results) {
            dbresults = results;
            var len = results.rows.length;
            for(var i = 0; i<len; i++) {
                // $("#notelist").append("<li><a href=#newnote onclick='itemindex=" + i + ";'>" + results.rows.item(i).notetitle + "</a></li>");
                console.log(results.rows.item(i).notetitle);
            }
        },

        saveNote:function(tx) {
            tx.executeSql("INSERT INTO NOTES (notetitle, notedetail, imagesource, notelat, notelon) VALUES (?, ?, ?, ?, ?)",[notedata.notetitle, notedata.notedetail, notedata.imagesource, notedata.notelat, notedata.notelon]);
        },

        checkConnection:function() {
            if (navigator.connection) {
                var networkState = navigator.connection.type;
                var states = {};
                states[Connection.UNKNOWN]  = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI]     = 'WiFi connection';
                states[Connection.CELL_2G]  = 'Cell 2G connection';
                states[Connection.CELL_3G]  = 'Cell 3G connection';
                states[Connection.CELL_4G]  = 'Cell 4G connection';
                states[Connection.CELL]     = 'Cell generic connection';
                states[Connection.NONE]     = 'No network connection';
               // alert('Connection type: ' + states[networkState]);
                console.log('phonegap::checkConnection > Connection type: ' + states[networkState]);
            } else {
                console.log("phonegap::checkConnection > navigator.connection feature is unsupported");
            }
        },
        
        checkDevice:function(){
            if (typeof device == "undefined") {
                console.log("phonegap::checkDevice > device feature is unsupported");
            	DeviceAdaptor.inBrowser = true;
            } else {
                var infoText =  'Device Model: '    + device.model    + '\n' +
                                'Device Cordova: '  + device.cordova  + '\n' +
                                'Device Platform: ' + device.platform + '\n' +
                                'Device UUID: '     + device.uuid     + '\n' +
                                'Device Version: '  + device.version  + '\n';
                console.log('Device Info: ' + infoText);
                this.deviceInfo = device;
                $.event.trigger("deviceInfoChange", [this.deviceInfo, infoText]);
            }
        },

        isAndroid:function(){
            return phonegap.deviceInfo ? phonegap.deviceInfo.platform == "Android" : false;
        },

        isIOS:function(){
            return phonegap.deviceInfo ? phonegap.deviceInfo.platform == "iOS" : false;
        },

        pickPicture:function(){
            if (navigator.camera) {
                var cameraPopoverHandle = navigator.camera.getPicture(this.onPickPictureSuccess, this.onPickPictureError,
                    { destinationType: Camera.DestinationType.FILE_URI,
                      sourceType: Camera.PictureSourceType.PHOTOLIBRARY });

            } else {
                console.log("phonegap::pickPicture > navigator.camera feature is unsupported");
               //alert("phonegap::pickPicture > navigator.camera feature is unsupported");
            }
        },

        onPickPictureSuccess:function(imageData) {
            console.log("phonegap::onPickPictureSuccess");
            console.log(imageData);
            phonegap.imageData = imageData;
            $.event.trigger("imageDataChange", [phonegap.imageData]);
        },

        onPickPictureError:function(error) {
            console.log("phonegap::onPickPictureError > " + error);
        },
        // Reposition the popover if the orientation changes.
        // window.onorientationchange = function() {
        //  var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, 0);
        //  cameraPopoverHandle.setPosition(cameraPopoverOptions);
        // }

        getFileSystem:function(){
            if (typeof LocalFileSystem == "undefined"){
                console.log("phonegap::getFileSystem > LocalFileSystem feature is unsupported");
            } else {
                console.log("phonegap::getFileSystem");
                requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.onGetFileSystemSuccess, this.onGetFileSystemError);
                //requestFileSystem(LocalFileSystem.TEMPORARY, 0, this.onGetFileSystemSuccess, this.onGetFileSystemError);
            }
        },

        onGetFileSystemSuccess:function(filesystem){
            console.log("phonegap::onGetFileSystemSuccess > " + filesystem.name);
            phonegap.filesystem = filesystem;
        },

        onGetFileSystemError:function(error){
            console.log("phonegap::onGetFileSystemError > " + error.code);
        },

        getPictures:function(){
            if (typeof DirectoryEntry == "undefined"){
                console.log("phonegap::getPictures > DirectoryEntry feature is unsupported");
            } else if (!this.filesystem){
            	console.log("phonegap::getPictures > filesystem not ready");
            } else {
            	console.log("phonegap::getPictures");
                var fs = this.filesystem;          
                console.log("Root = " + fs.root.fullPath);
                if (phonegap.isAndroid()) {
                	var folder =  'Pictures'; // 'Pictures'; // 'dcim'; // dcim/Camera';  
                    console.log("Android... searching for  "  + folder + "  directory");                    
                    fs.root.getDirectory(folder,{create:false}, phonegap.onGetDirSuccess,phonegap.onGetDirError);
                } else if (phonegap.isIOS()) {
                    console.log("iOS... getting parent application directory");
                    fs.root.getDirectory('../tmp',{create:false}, phonegap.onGetDirSuccess,phonegap.onGetDirError);
                }
            }
        },

        onGetDirSuccess: function(dir){
            console.log("onGetDirSuccess, starting readEntries...");
            var directoryReader = dir.createReader();
            directoryReader.readEntries(phonegap.onScanRecursiveSuccess,phonegap.onScanRecursiveError);  // Get a list of all the entries in the directory
        },

        onGetDirError:function(error){
            console.log("phonegap::onGetDirError > " + error.code);
            console.log(error);
        },

        onScanRecursiveSuccess:function (entries) {
            const pictureExts = [".jpg",".png"];
            console.log("phonegap::onScanRecursiveSuccess > " + entries.length);
            var changed = false;
            var p = undefined;
            for (var i=0; i<entries.length; i++) {
                var entry = entries[i];
                var typeStr = entry.isDirectory ? "dir" : "file";
                console.log(entry.name + "(" + typeStr + ") >   " + entry.fullPath);
                if(entry.isDirectory){
                    //console.log("Scanning subdirectory recursively " + entry.fullPath);
                    //var directoryReader = entry.createReader();
                    //directoryReader.readEntries(phonegap.onScanRecursiveSuccess,phonegap.onScanRecursiveError);
                }
                else {
                    var path = entry.fullPath;
                    var found = false;
                    var exts = pictureExts.concat();
                    var pic = undefined;
                    while (!found && exts.length>0) 
                    {
                        var ext = exts.pop();
                        if (path.lastIndexOf(ext)==(path.length - ext.length))
                        {
                            found = true;
                            p = entry;
                            pic = new cls.Pic(entry.name, entry.name, entry.fullPath, entry); 
                        }
                    }  
                    if (found && !phonegap.pictureFilesHash.hasOwnProperty(pic.path)) {
                        //console.log("adding to phonegap.pictureFiles");
                        phonegap.pictureFilesHash[pic.path] = pic;
                        phonegap.pictureFiles.push(pic); // add picture to the phonegap.pictureFiles array
                        changed = true;
                    }
                }
            }
            if (changed) 
            {            	
                console.log("phonegap::onScanRecursiveSuccess > " + phonegap.pictureFiles.length);
                mdCount = 0;
                phonegap.invokeMetaDataRead();
            }
        },
        
        mdCount: undefined,
        
        invokeMetaDataRead:function()
        {
        	console.log("phonegap.invokeMetaDataRead")
        	var n = (phonegap && phonegap.pictureFiles) ? phonegap.pictureFiles.length : 0;   
        	if(mdCount < n)
        	{
        		var picVO = phonegap.pictureFiles[mdCount];
        		if(picVO && picVO.entry)
        			picVO.entry.file(phonegap.gotFile, phonegap.fail);
        	}
        	else//DONE ALL FILES COMPLETE
        	{
        		console.log("ALL DONE");
        		$.event.trigger("onPictureFilesChange");
        	}
        },
        
        fileSliceDone : function(metadata)
        {
        	var picVO = phonegap.pictureFiles[mdCount];
        	if(picVO)
        	{
        		picVO.metadata = metadata;
        		mdCount++;
        		phonegap.invokeMetaDataRead();
       		}
        },
                
        fail:function(error) 
        {
        	console.log("ERROR?");
            console.log(error.code);
        },

        // http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/
        gotFile:function(file)
        {
            console.log("phonegap.gotFile " + file.name);            
            console.log("fullPath " + file.fullPath);            
            console.log("lastModifiedDate " + file.lastModifiedDate);            
            slice = file.slice(0, 131072);
            phonegap.readAsBinaryString(slice);
        },
        

        readAsBinaryString:function(file){
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                console.log("readAsBinaryString success");
                var data = evt.target.result;
                console.log(typeof data);
                console.log("data.length = " + data.length);
                console.log("has <x:xmpmeta ?     -  " + data.indexOf('<x:xmpmeta'));
                console.log("has </x:xmpmeta> ?   -  " + data.indexOf('</x:xmpmeta>'));
                var xmp = data.substring(data.indexOf('<x:xmpmeta'), data.indexOf('</x:xmpmeta>'));
                console.log("xmp.length = "+xmp.length);
                console.log(xmp);
                var findTag = function(tagStart,tagEnd,text){
                    var retVal = "";
                    var start = text.indexOf(tagStart);
                    if (start > -1){
                        console.log(tagStart + " tagStart = " + start);
                        start = start + tagStart.length;
                        var end = text.indexOf(tagEnd,start);
                        if (end > -1){
                            console.log(tagEnd + " tagEnd = " + end);
                            retVal = xmp.substring(start,end); // reading the value
                        }else{
                            console.warn(tagEnd + " tagEnd not found");
                        }
                    }else{
                        console.warn(tagStart + " tagStart not found");
                    }
                    console.log("findTag.retVal = " + retVal);
                    return retVal;
                };
                var createDate = findTag('CreateDate="','"',xmp);
                if(!createDate){
                    createDate = findTag('MetadataDate="','"',xmp);
                }
                var keywords = findTag('<dc:subject>','</dc:subject>',xmp);
                var keyPart = keywords.split('>');
                console.log(keyPart);
                keywords = [];
                for(var i = 0; i < keyPart.length; i++){
                    var key = keyPart[i];
                    key = key.trim();
                    if(key.indexOf('<')!=0){
                        key = (key.split('<')).shift();
                        key = key.trim();
                        if (key) keywords.push(key);
                    }
                }
                console.log("CREATE_DATE: " + createDate);
                console.log("KEYWORDS:    " + keywords);
                var gpsPosition = '';// NEED TO ADD THIS
                var md = new cls.Metadata(keywords, createDate, gpsPosition);
                phonegap.fileSliceDone(md);
            };
            reader.readAsBinaryString(file);
        },

        readAsBinaryArray:function(file){
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                console.log("2. readAsBinaryArray success");
                var data = evt.target.result;
                console.log(data);
                var dataView = new DataView(data);
                console.log("DataView  " + dataView.getUint8(0,phonegap.littleEndian));
                console.log("DataView  " + dataView.getUint8(1,phonegap.littleEndian));
                console.log("255 == 0xFF  "+(255 == 0xFF))
                console.log("DataView  " + dataView.getUint16(0,phonegap.littleEndian));

               console.log(new Uint8Array(evt.target.result));
            };
            reader.readAsArrayBuffer(file);
        },

        readAsText:function(file) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                console.log("3. readAsText success");
                console.log(evt.target.result);
            };
            reader.readAsText(file);
        },

        onScanRecursiveError:function (error) {
            console.log("phonegap::onScanRecursiveError > " + error.code);
            console.log(error);
            /*
            console.log("FileError.NOT_FOUND_ERR " + FileError.NOT_FOUND_ERR);
            console.log("FileError.SECURITY_ERR " + FileError.SECURITY_ERR);
            console.log("FileError.ABORT_ERR " + FileError.ABORT_ERR);
            console.log("FileError.NOT_READABLE_ERR " + FileError.NOT_READABLE_ERR);
            console.log("FileError.ENCODING_ERR " + FileError.ENCODING_ERR);
            console.log("FileError.NO_MODIFICATION_ALLOWED_ERR " + FileError.NO_MODIFICATION_ALLOWED_ERR);
            console.log("FileError.INVALID_STATE_ERR " + FileError.INVALID_STATE_ERR);
            console.log("FileError.SYNTAX_ERR " + FileError.SYNTAX_ERR);
            console.log("FileError.INVALID_MODIFICATION_ERR " + FileError.INVALID_MODIFICATION_ERR);
            console.log("FileError.QUOTA_EXCEEDED_ERR " + FileError.QUOTA_EXCEEDED_ERR);
            console.log("FileError.TYPE_MISMATCH_ERR " + FileError.TYPE_MISMATCH_ERR);
            console.log("FileError.PATH_EXISTS_ERR " + FileError.PATH_EXISTS_ERR);
            */
        },

        echo:function(str) {
            cordova.exec(phonegap.onEchoSucess, phonegap.onEchoError, "Echo", "echo", [str]);
        },

        onEchoSucess:function(str){
            console.log("phonegap::onEchoSucess > " + str);
            //alert("iOS onEchoSucess\n" + str);
        },

        onEchoError:function(error){
            console.log("phonegap::onEchoError > " + error);
           // alert("iOS onEchoError\n" + error);
        },

        getAllPhotoThumbnails:function() {
            //cordova.exec(phonegap.onGetAllPhotoThumbnailsSuccess, phonegap.onGetAllPhotoThumbnailsError, "PhotoLibrary", "getAllPhotos", []);
            if (navigator.assetslib) {
                navigator.assetslib.getAllPhotoThumbnails(phonegap.onGetAllPhotoThumbnailsSuccess, phonegap.onGetAllPhotoThumbnailsError);
            } else {
                console.log("phonegap::getAllPhotoThumbnails > navigator.assetslib feature is unsupported");
                //alert("phonegap::getAllPhotoThumbnails > navigator.assetslib feature is unsupported");
            }

        },

        onGetAllPhotoThumbnailsSuccess:function(data){
            phonegap.allThumbnails = data;
            console.log("phonegap::onGetAllPhotoThumbnailsSuccess > " + data.length);
            //alert("iOS onGetAllPhotosSuccess\n" + data.length);
            $.event.trigger("onGetAllPhotoThumbnailsSuccess");
        },

        onGetAllPhotoThumbnailsError:function(error){
            console.log("phonegap::onGetAllPhotoThumbnailsError > " + error);
            //alert("iOS onGetAllPhotoThumbnailsError\n" + error);
        },


        setMetadata:function(){
            if (phonegap.pictureFiles.length > 0) {
                entry = phonegap.pictureFiles[0].fileEntry;
                entry.setMetadata(phonegap.setMetaDataSuccess, phonegap.setMetaDataError, {"com.bibliosmart.tags": "Italy"});
            }
            else {
                console.log("There is no pictures. Call getPictures before setting their metadata.");
            }
        },
        setMetadataSuccess:function(){
            console.log("The metadata was successfully set.");
        },
        setMetadataError:function(){
            console.log("The metadata could not be set");
        },
    };
    return phonegap;
});