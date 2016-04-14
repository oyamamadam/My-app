if(typeof define !== 'function') { var define = require('amdefine')(module); }

define(function(require)
{
	var supported_file_formats = null; 		// /\.(dng|jpg|jpeg|png)$/i;
	var files_info = [];					// file collection, call enumFiles() to fill
	var slash = (require('os').platform() == 'win32' ? '\\' : '/');
	var max_file_size = 20 * 1024;


	function checkFileExtension(file_name)
	{
		return supported_file_formats.test(file_name);
	};


	function checkFileSize(stats)
	{
		return stats.size >= max_file_size;
	};


	return {

		init: function(l_supported_file_formats)
		{
			supported_file_formats = new RegExp('\\.(' + l_supported_file_formats.join('|') + ')$', 'i');
		},


		getFilesInfo: function(index) { return files_info; },

		getSlash: function() { return slash; },

		// Find files that have extension supported_file_formats.
		enumFiles: function(_source_folder, callbackBegin, callbackHandleFolder, callbackHandleFile, callbackComplete)
		{
			var fs = require('fs');
			var path = require('path');
			var platform = require('os').platform();
			var source_folder = '';

			files_info = [];

			if(typeof _source_folder == 'string')
			{
				source_folder = _source_folder;
				_source_folder = [];
				_source_folder.push(source_folder);
			}

			var counter = _source_folder.length;

			for(var f = 0; f < _source_folder.length; ++f)
			{
				source_folder = _source_folder[f];

				if(callbackBegin) callbackBegin(source_folder);

				fs.readdir(source_folder,
				(
					function closureReadDir(_this, current_path)
					{
						return function handleReadDir(error, files)
						{
							if(error)
							{
								if(error.code != 'EACCES' && error.code != 'EPERM' && error.code != 'ENOENT' && error.code != 'UNKNOWN') console.log(error);
								if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
								return;
							}
							counter += files.length;

							if(callbackHandleFolder) callbackHandleFolder(current_path, files_info.length);

							for(var i = 0; i < files.length; ++i)
							{
								var file_path = (!current_path.length || (current_path.length && current_path[current_path.length - 1] == path.sep) ? current_path : current_path + path.sep) + files[i];

								fs.lstat(file_path,
								(
									function closureLStat(_this, file_path)
									{
										return function handleLStat(error, st)
										{
											if(error)
											{
												if(error.code != 'EACCES' && error.code != 'EPERM' && error.code != 'ENOENT' && error.code != 'EINVAL') console.log(error);
												if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
												return;
											}

											if(st.isDirectory())
											{
												fs.readdir(file_path, closureReadDir(_this, (platform == 'win32' ? file_path.replace('/', '\\') : file_path)));
											}
											else if(st.isFile())
											{
												if(checkFileExtension(file_path) && checkFileSize(st))
												{
													if(callbackHandleFile) callbackHandleFile(current_path, (platform == 'win32' ? file_path.replace('/', '\\') : file_path), st.mtime, st.birthtime);
													files_info.push({ OriginFileName: file_path });
												}
												if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
											}
											else
											{
												if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
											}
										};
									}
								)(_this, file_path));
							}
							if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
						};
					}
				)(this, source_folder));
			}
		},

		// Find folders that have files with extension supported_file_formats.
		enumFolders: function(source_folder, callbackBegin, callbackHandleFolder, callbackComplete)
		{
			var fs = require('fs');
			var path = require('path');
			var platform = require('os').platform();
			var counter = 1;

			files_info = [];

			if(callbackBegin) callbackBegin(source_folder);

			fs.readdir(source_folder,
			(
				function closureReadDir(_this, current_path)
				{
					return function handleReadDir(error, files)
					{
						if(error)
						{
							if(error.code != 'EACCES' && error.code != 'EPERM' && error.code != 'ENOENT' && error.code != 'UNKNOWN') console.log(error);
							if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
							return;
						}
						counter += files.length;

						for(var i = 0; i < files.length; ++i)
						{
							var file_path = (!current_path.length || (current_path.length && current_path[current_path.length - 1] == path.sep) ? current_path : current_path + path.sep) + files[i];
							var need_check_file_extension = true;

							fs.lstat(file_path,
							(
								function closureLStat(_this, file_path)
								{
									return function handleLStat(error, st)
									{
										if(error)
										{
											if(error.code != 'EACCES' && error.code != 'EPERM' && error.code != 'ENOENT' && error.code != 'EINVAL') console.log(error);
											if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
											return;
										}

										if(st.isDirectory())
										{
											fs.readdir(file_path, closureReadDir(_this, (platform == 'win32' ? file_path.replace('/', '\\') : file_path)));
										}
										else if(st.isFile())
										{
											if(need_check_file_extension && checkFileExtension(file_path) && checkFileSize(st))
											{
												if(callbackHandleFolder) callbackHandleFolder(current_path, files_info.length);
												files_info.push({ OriginFileName: current_path });
												need_check_file_extension = false;
											}
											if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
										}
										else
										{
											if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
										}
									};
								}
							)(_this, file_path));
						}
						if(--counter == 0 && callbackComplete) callbackComplete(source_folder);
					};
				}
			)(this, source_folder));
		}
	};
});
