// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['exif', 'cls', 'util/GpsUtil', 'log'],
function(exif, cls, gpsUtil, log) {  // http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/

    console.debug("scan-droid.js");
	const PICTURE_EXT = [".jpg",".png"];
	const MIN_FILE_SIZE = 10000; //100000; // 100000 == 100kbs

    var me = {
    	filesystem:undefined,
    	getPicturesCallback:undefined,
    	count:0,
    	pictureFileEntries:[],
    	pictureFiles:[],
    	pictureFilesHash:{},
    	isSyncing:false,

    	getPictures:function(callback){
    		me.getPicturesCallback = callback;
        	if (typeof DirectoryEntry == "undefined"){
                console.warn("scan.getPictures > DirectoryEntry feature is unsupported");
            } else if (!me.filesystem){
            	console.log("scan.getPictures > gettting filesystem first");
            	me.getFileSystem();
            } else {
				me.startDirectoryScan();
            }
    	},

    	validateFiles : function(fileEntries, callback)
    	{
    		console.log("SCAN-ANDROID: validateFiles");
    		me.getPicturesCallback = callback;
    		me.pictureFileEntries = fileEntries;
    		$.event.trigger("wizardEvent", {type: "dirScanComplete", total: me.pictureFileEntries.length});
			setTimeout(function()
			{
				me.processPictureFileEntries();
			}, 100);
    	},

    	getFileSystem:function(){
            if (typeof LocalFileSystem == "undefined"){
                console.debug("scan.getFileSystem > LocalFileSystem feature is unsupported");
            } else {
                console.debug("scan.getFileSystem");
                requestFileSystem(LocalFileSystem.PERSISTENT, 0, me.getFileSystemSuccess, me.getFileSystemError);
            }
        },
        getFileSystemError:function(error){
            console.error("scan.getFileSystemError > " + error.code);
            console.error(error);
        },
        getFileSystemSuccess:function(filesystem){
            console.debug("scan.getFileSystemSuccess > " + filesystem.name);
            me.filesystem = filesystem;
            me.startDirectoryScan();
        },

        startDirectoryScan:function(){
        	var fs = me.filesystem;
            console.debug("filesystem root = " + fs.root.fullPath);
            me.pictureFileEntries = [];
            me.pictureFile = [];
            // 'Pictures'  'dcim' 'dcim/Camera' '/sdcard/Pictures/'
            fs.root.getDirectory('Pictures',{create:false}, me.getDirSuccess,me.getDirError);
        },

        getDirSuccess:function(dir){
            console.debug("scan.getDirSuccess > " + dir.fullPath);
            me.readDirectoryEntries(dir);
        },
        getDirError:function(error){
            console.error("scan.getDirError > " + error.code);
            console.error(error);
        },

        readDirectoryEntries:function(dir){
        	me.count++;
			//console.debug("scan.readDirectoryEntries > count = " + me.count);
        	var directoryReader = dir.createReader();
        	directoryReader.readEntries(me.readDirectoryEntriesSuccess,me.readDirectoryEntriesError);  // Get a list of all the entries in the directory
        },
        readDirectoryEntriesError:function(error){
            console.error("scan.readDirectoryEntriesError > " + error.code);
            console.error(error);
        },
        oneIs : true,
        readDirectoryEntriesSuccess:function(entries)
        {
			for (var i=0; i<entries.length; i++)
			{
                var entry = entries[i];
                var typeStr = entry.isDirectory ? "dir" : "file";
                //console.log(entry.name + "(" + typeStr + ") >   " + entry.fullPath);
                if(entry.isDirectory)
                {
                	me.readDirectoryEntries(entry);
                }
                else
                {
                	me.checkAddPicture(entry);
                    if(oneIs)
                    {
                        log.i(entry);
                        console.log("-=-");
                        oneIs = false;
                    }
                }
            }
			me.count--;
			if(me.count == 0)
			{
				console.debug("scan.readDirectoryEntriesSuccess > complete count = " + me.count);
				console.log("Found " + me.pictureFileEntries.length + " pictures");
				if(me.isSyncing)
				{
                    console.log("isSyncing");
					me.getPicturesCallback(me.pictureFileEntries);
				}
				else
				{
                    console.log("dirScanComplete");
					$.event.trigger("wizardEvent", {type: "dirScanComplete", total: me.pictureFileEntries.length});
					setTimeout(function()
					{
						me.processPictureFileEntries();
					}, 100);
				}
			}
        },

        checkAddPicture:function(entry){
	        var path = entry.fullPath.toLowerCase();
	        var exts = PICTURE_EXT.concat();
	        var found = false;
	        while (!found && exts.length>0)
	        {
	            var ext = exts.pop();
	            if (path.lastIndexOf(ext)==(path.length - ext.length))
	            {
	                found = true;
	                me.pictureFileEntries.push(entry);
	            }
	        }
        },

        processPictureFileEntries:function(){
        	var list = me.pictureFileEntries;
        	me.count = 0;
			for (var i=0; i<list.length; i++) {
				var fileEntry = list[i];
				me.count++; // 1
				fileEntry.file(me.getFileSuccess, me.getFileError);
			}
        },

        getFileError:function(error)
        {
        	console.error("scan.getFileError " + error.code);
            console.error(error);
        },

        getFileSuccess:function(file)
        {
            if (file.size > MIN_FILE_SIZE) {        // prcess only files larger than 100KB
	            slice = file.slice(0, 131072);
	            me.readAsBinaryString(slice,file);
	        }
	        me.count--; // 1
        },

        readAsBinaryString:function(slice,file){
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                //console.log("readAsBinaryString success " + file.fullPath);
                var data = evt.target.result;
                //console.log("has <x:xmpmeta ?     -  " + data.indexOf('<x:xmpmeta'));
                //console.log("has </x:xmpmeta> ?   -  " + data.indexOf('</x:xmpmeta>'));
                var xmp = data.substring(data.indexOf('<x:xmpmeta'), data.indexOf('</x:xmpmeta>'));
                //console.log("xmp.length = "+xmp.length);
                var findTag = function(tagStart,tagEnd,text){
                    var retVal = "";
                    var start = text.indexOf(tagStart);
                    if (start > -1){
                        //console.log(tagStart + " tagStart = " + start);
                        start = start + tagStart.length;
                        var end = text.indexOf(tagEnd,start);
                        if (end > -1){
                            //console.log(tagEnd + " tagEnd = " + end);
                            retVal = xmp.substring(start,end); // reading the value
                        }else{
                            //console.warn(tagEnd + " tagEnd not found");
                        }
                    }else{
                        //console.warn(tagStart + " tagStart not found");
                    }
                    //console.log("findTag.retVal = " + retVal);
                    return retVal;
                };
                var xmpCreateDate = findTag('CreateDate="','"',xmp);
                var xmpMetadataDate = findTag('MetadataDate="','"',xmp);

                var keywords = findTag('<dc:subject>','</dc:subject>',xmp);
                var keyPart = keywords.split('>');
                //console.log(keyPart);
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

                //console.log("Starting reading exif metadata");
                var exifdata = exif.readFromBinaryFileText(data);    // read exif
                //console.log(exifdata);
                //alert(exif.pretty(exifdata));
                var gpsPosition = gpsUtil.getPosition(exifdata);
                var exifDateTimeOriginal = undefined;
                var exifDateTimeDigitized = undefined;
                var exifDateTime = undefined;
                if(exifdata){
                    exifDateTimeOriginal = exif.getTag(exifdata, "DateTimeOriginal");
                    exifDateTimeDigitized = exif.getTag(exifdata, "DateTimeDigitized");
                    exifDateTime = exif.getTag(exifdata, "DateTime");
                }
            	var meta = new cls.Metadata(keywords, new Date(file.lastModifiedDate), gpsPosition);
                meta.xmpCreateDate = xmpCreateDate;
                meta.xmpMetadataDate = xmpMetadataDate;
                meta.exifDateTimeOriginal = exifDateTimeOriginal;
                meta.exifDateTimeDigitized = exifDateTimeDigitized;
                meta.exifDateTime = exifDateTime;
                //console.debug("meta.xmpCreateDate="+meta.xmpCreateDate+" meta.xmpMetadataDate="+meta.xmpMetadataDate+" meta.exifDateTimeOriginal="+
                //   meta.exifDateTimeOriginal+" meta.exifDateTimeDigitized="+meta.exifDateTimeDigitized+" meta.exifDateTime="+meta.exifDateTime);
                var pic = new cls.Pic(file.fullPath, file.name, file.fullPath, undefined, meta);
                //console.debug("META: " + meta);

                //console.debug("pic.name:" + pic.name + " pic.path:" + pic.path);
                //console.debug("PIC: " + pic);
                //console.log(pic);

                if (!me.pictureFilesHash.hasOwnProperty(pic.path))
                {
	                me.pictureFiles.push(pic);
	                me.pictureFilesHash[pic.path] = pic;
                }
                else
                {
                	console.warn(pic.path + "is a duplicate. Skipping...");
                }

               	var img = new Image();
                img.onload = function()
                {
                	pic.width = this.width;
                	pic.height = this.height;
                	me.count--;
                    //console.log("count = " + me.count)
                	$.event.trigger("wizardEvent", {type: "fileScanComplete", remaining: me.count});
                    if (me.count == 0 && me.getPicturesCallback != undefined)
                    {
                    	me.pictureFiles.sort(pic.compare);
                    	me.getPicturesCallback(me.pictureFiles);
                   	};
                }
                img.src = pic.path;
            };
            me.count++;
            reader.readAsBinaryString(slice);
        }
    };
    return me;
});