// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require)
{
	// win, linux, mac
	var os_platform = require('os').platform();
	var reading_tags = [];
	var exiftoolAppName = null;

	function checkExiftool()
	{
		exiftoolAppName = null;
		
		// We have binary file at our paсkage for windows
		if(os_platform == 'win32')
		{
			exiftoolAppName = 'exiftool.exe';
			return true;
		}
		
		// but for linux or mac exiftool must be preinstalled by user
		var fs = require('fs');
		var exiftool_paths = ['/usr/bin/exiftool', '/usr/local/bin/exiftool'];
		
		for(var i = 0; i < exiftool_paths.length; ++i)
		{
			if(fs.existsSync(exiftool_paths[i]))
			{
				exiftoolAppName = exiftool_paths[i];
				return true;
			}
		}		
		return false;
	}

	function getExiftoolAppName() 
	{
		//return (os_platform == 'win32' ? 'exiftool.exe' : (os_platform == 'darwin' ? '/usr/local/bin/exiftool' : 'exiftool'));
		return exiftoolAppName;
	}

	return {

		init: function(l_reading_tags)
		{
			reading_tags = l_reading_tags;
			return checkExiftool();
		},

		
		// Construct command for read exif info
		getReadCommand: function(file_name)
		{
			var tags = '';
			for(var i = 0; i < reading_tags.length; ++i) tags += ' -' + reading_tags[i];
			return getExiftoolAppName() + ' -E -j -n ' + tags + ' "' + file_name + '"';
		},


		// Construct command for write exif info
		getSaveCommand: function(file_info, file_info_origin)
		{
			var tags = '';
			for(var t = 0; t < reading_tags.length; ++t)
			{
				var tag = reading_tags[t];
				if(file_info[tag] != file_info_origin[tag]) tags += ' -' + tag + '=\'' + file_info[tag] + '\'';
			}
			return getExiftoolAppName() + tags + ' "' + file_info.OriginFileName + '"';
		},


		// Read exif info from file
		readTags: function(file_info, callback)
		{
			var exec = require('child_process').exec;

			exec(this.getReadCommand(file_info.OriginFileName),
				function handleReadTags(error, stdout, stderr)
				{
					if (error !== null)
					{
						if(typeof(callback) == 'function') callback(error, file_info);
						return;
					}

					try
					{
						var props = JSON.parse(stdout);
					}
					catch(e)
					{
						console.log('parse error' + e);
						return;
					}

					for(var prop in props[0]) file_info[prop] = props[0][prop];

					if(typeof(callback) == 'function') callback(error, file_info);
				}
			);
		},


		// Write exif info to file
		saveTags: function(file_info, file_info_origin)
		{
			if(!file_info || !file_info_origin || file_info.OriginFileName != file_info_origin.OriginFileName) return;

			var exec = require('child_process').exec;

			exec(this.getSaveCommand(file_info, file_info_origin),
				function handleSaveTags(error, stdout, stderr)
				{
					if (error !== null)
					{
						console.log('exec error: ' + error);
						alert(error);
						return;
					}
				}
			);
		}
	}
});
// add by 15 21.05.2015 )
