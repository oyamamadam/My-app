// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }

define(['exif', 'cls', 'util/GpsUtil', 'log'], function(exif, cls, gpsUtil, log)
{
	console.debug("scan-node.js");

	const PICTURE_EXT = [".jpg",".png"];
	const MIN_FILE_SIZE = 20000;

	var me =
	{
		filesystem: undefined,
		getPicturesCallback: undefined,
		count: 0,
		pictureFileEntries: [],
		pictureFiles: [],
		pictureFilesHash: {},
		isSyncing: false,

		getPictures: function(callback)
		{
			me.getPicturesCallback = callback;
			me.startDirectoryScan();
/*
			if (typeof DirectoryEntry == "undefined")
			{
				console.warn("scan.getPictures > DirectoryEntry feature is unsupported");
			}
			else if (!me.filesystem)
			{
				console.log("scan.getPictures > gettting filesystem first");
				me.getFileSystem();
			}
			else
			{
				me.startDirectoryScan();
			}
*/
		},

		validateFiles: function(fileEntries, callback)
		{
			console.log("scan-node: validateFiles");

			me.getPicturesCallback = callback;
			me.pictureFileEntries = fileEntries;

			$.event.trigger("wizardEvent", {type: "dirScanComplete", total: me.pictureFileEntries.length});

			setTimeout(function() { me.processPictureFileEntries(); }, 100);
		},
/*
		getFileSystem: function()
		{
			if (typeof LocalFileSystem == "undefined")
			{
				console.debug("scan.getFileSystem > LocalFileSystem feature is unsupported");
			}
			else
			{
				console.debug("scan.getFileSystem");
				requestFileSystem(LocalFileSystem.PERSISTENT, 0, me.getFileSystemSuccess, me.getFileSystemError);
			}
		},

		getFileSystemError: function(error)
		{
			console.error("scan.getFileSystemError > " + error.code);
			console.error(error);
		},

		getFileSystemSuccess: function(filesystem)
		{
			console.debug("scan.getFileSystemSuccess > " + filesystem.name);
			me.filesystem = filesystem;
			me.startDirectoryScan();
		},
*/
		startDirectoryScan: function()
		{
			var fs = me.filesystem;
			console.debug("filesystem root = " + fs.root.fullPath);
			me.pictureFileEntries = [];
			me.pictureFile = [];
			fs.root.getDirectory('Pictures', { create: false }, me.getDirSuccess, me.getDirError);
		},

		getDirSuccess: function(dir)
		{
			console.debug("scan.getDirSuccess > " + dir.fullPath);
			me.readDirectoryEntries(dir);
		},

		getDirError: function(error)
		{
			console.error("scan.getDirError > " + error.code);
			console.error(error);
		},

		readDirectoryEntries: function(dir)
		{
			me.count++;
			var directoryReader = dir.createReader();
			directoryReader.readEntries(me.readDirectoryEntriesSuccess, me.readDirectoryEntriesError);
		},

		readDirectoryEntriesError: function(error)
		{
			console.error("scan.readDirectoryEntriesError > " + error.code);
			console.error(error);
		},

		oneIs: false,

		readDirectoryEntriesSuccess: function(entries)
		{
			for (var i = 0; i < entries.length; i++)
			{
				var entry = entries[i];
				var typeStr = entry.isDirectory ? "dir" : "file";

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
					setTimeout(function() { me.processPictureFileEntries(); }, 100);
				}
			}
		},

		checkAddPicture: function(entry)
		{
			var path = entry.fullPath.toLowerCase();
			var exts = PICTURE_EXT.concat();
			var found = false;

			while (!found && exts.length > 0)
			{
				var ext = exts.pop();

				if (path.lastIndexOf(ext) == (path.length - ext.length))
				{
					found = true;
					me.pictureFileEntries.push(entry);
				}
			}
		},

		processPictureFileEntries: function()
		{
			var list = me.pictureFileEntries;

			me.count = 0;

			for (var i = 0; i < list.length; i++)
			{
				var fileEntry = list[i];
				me.count++; // 1
				fileEntry.file(me.getFileSuccess, me.getFileError);
			}
		},

		getFileError: function(error)
		{
			console.error("scan.getFileError " + error.code);
			console.error(error);
		},

		getFileSuccess: function(file)
		{
			if (file.size > MIN_FILE_SIZE)
			{
				slice = file.slice(0, 131072);
				me.readAsBinaryString(slice,file);
			}
			me.count--; // 1
		},

		readAsBinaryString: function(slice, file)
		{
			var reader = new FileReader();

			reader.onloadend = function (evt)
			{
				var data = evt.target.result;
				var xmp = data.substring(data.indexOf('<x:xmpmeta'), data.indexOf('</x:xmpmeta>'));

				var findTag = function(tagStart,tagEnd,text)
				{
					var retVal = "";
					var start = text.indexOf(tagStart);

					if (start > -1)
					{
						start = start + tagStart.length;
						var end = text.indexOf(tagEnd, start);
						if (end > -1) retVal = xmp.substring(start, end);
					}
					return retVal;
				};

				var xmpCreateDate = findTag('CreateDate="','"',xmp);
				var xmpMetadataDate = findTag('MetadataDate="','"',xmp);
				var keywords = findTag('<dc:subject>','</dc:subject>',xmp);
				var keyPart = keywords.split('>');

				keywords = [];

				for(var i = 0; i < keyPart.length; i++)
				{
					var key = keyPart[i].trim();

					if(key.indexOf('<') != 0)
					{
						key = (key.split('<')).shift().trim();
						if (key) keywords.push(key);
					}
				}

				var exifdata = exif.readFromBinaryFileText(data);    // read exif
				var gpsPosition = gpsUtil.getPosition(exifdata);
				var exifDateTimeOriginal = undefined;
				var exifDateTimeDigitized = undefined;
				var exifDateTime = undefined;

				if(exifdata)
				{
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

				var pic = new cls.Pic(file.fullPath, file.name, file.fullPath, undefined, meta);

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
					$.event.trigger("wizardEvent", { type: "fileScanComplete", remaining: me.count });

					if (me.count == 0 && me.getPicturesCallback != undefined)
					{
						me.pictureFiles.sort(pic.compare);
						me.getPicturesCallback(me.pictureFiles);
					}
				};
				img.src = pic.path;
			};
			me.count++;
			reader.readAsBinaryString(slice);
		}
	};
	return me;
});
// add by 15 21.05.2015 )
