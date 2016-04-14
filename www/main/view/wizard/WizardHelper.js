// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['util/AppUtil',
        'phonegap',
        'util/TextUtil',
        'util/IchUtil',
        'text!wizard/WizardFolderItem.html',
        'text!wizard/WizardKeywordItem.html',
        'util/LayoutUtil',
        'util/ScrollUtil',
        'cache',
        'enum/AppEnum',
        'model'],

function(AppUtil, phonegap, TextUtil, IchUtil, WizardFolderItemHTML, WizardKeywordItemHTML, LayoutUtil, ScrollUtil, cache, AppEnum, model)
{
	// test by 15
	var read_gps = true;
	
	var picTotal = undefined;
	var stepOneMaxPx = 100;
	var maxPx = 296;
	var progressBar = undefined;
	var stepPageTxtDiv = undefined;
	var folders = {};
	var keywordItems = {};
	var stepHeight = undefined;
	var entityTxt = undefined;
	var allFiles = undefined;
	var toRemoveFiles = undefined;
	var keywordObject = undefined;
	// ( add by 15 21.05.2015
	// The size of portion allFiles for reading exif information.
	var portion_size = 15;
	// add by 15 21.05.2015 )

	function setStepThree()
	{
		var prevDiv = $("#wizardPage #wizBody #wizTwo");
		prevDiv.hide();
		var stepDiv = $("#wizardPage #wizBody #wizThree");
		stepDiv.show();
		stepPageTxtDiv.html("<b>Step 4.</b> Please choose the categories for your keywords by touching the circles below. You can skip this step and come back to it later, if you want:");
		var entititesDiv = $(".col5Header > div", stepDiv);
		entititesDiv.html(entityTxt);
		// ( add by 15 21.05.2015
		//stepDiv.height(stepHeight);
		stepDiv.height(400);
		// add by 15 21.05.2015 )
		var scroll = ScrollUtil.setVScroll("#wizardPage #wizBody #wizThree .scrollWrapper");
		var count = 0;
		for(var keywordName in keywordItems)
		{
			var keyObj = {keyword: keywordName};
			IchUtil.appendIchTemplate('noname', WizardKeywordItemHTML, $(".stepItems", stepDiv), keyObj);
			count++;
		}
		// ( add by 15 21.05.2015
		//$(".scrollWrapper", stepDiv).height(stepHeight - 140);
		$(".scrollWrapper", stepDiv).height(400 - 140);
		// add by 15 21.05.2015 )
		var items = $(".stepItems", stepDiv);
		ScrollUtil.updateVScroll(items, scroll, 0, count*35, 10, function(){});
		updateProgress(85);
	}

	function setStepTwo()
	{
		var prevDiv = $("#wizardPage #wizBody #wizOne");
		prevDiv.hide();
		var stepDiv = $("#wizardPage #wizBody #wizTwo");
		stepDiv.show();
		stepPageTxtDiv.html("<b>Step 3.</b> We put all of your photos into four categories for easy browsing: &quot;Events&quot;, &quot;Places&quot;, &quot;People&quot;, and &quot;Everything else&quot;. You can rename &quot;Everything else&quot; below...");
		updateProgress(50);
		stepDiv.height(300);
		var scroll = ScrollUtil.setVScroll("#wizardPage #wizBody #wizTwo .scrollWrapper");
		$(".scrollWrapper", stepDiv).height(180);
		var bodyDiv = $("#wizTwoBody", stepDiv);
		var count = 4; // number of children
		ScrollUtil.updateVScroll(bodyDiv, scroll, 0, count*40, 10, function(){});
	}

	function setStepOne()
	{
		// ( add by 15 21.05.2015
		var prevDiv = $("#wizardPage #wizBody #wizZero");
		prevDiv.hide();
		// add by 15 21.05.2015 )
		var parentDiv = $("#wizardPage #wizBody #wizOne");
		//var wizMsg = $("#wizardPage #wizMsg");
		// if(wizMsg) wizMsg.hide();
		parentDiv.show();

		// ( add by 15 21.05.2015
		//if(stepPageTxtDiv)
		//	stepPageTxtDiv.css("visibility", 'visible');
		//parentDiv.height(stepHeight);
		if(stepPageTxtDiv)
		{
			stepPageTxtDiv.html('<b>Step 2.</b> We found photos in the following folders and albums. Please confirm that you want all these included.');
			stepPageTxtDiv.css("visibility", 'visible');
		}
		parentDiv.height(400);
		// add by 15 21.05.2015 )
		
		var scroll = ScrollUtil.setVScroll("#wizardPage #wizBody #wizOne .scrollWrapper");
		var count = 0;
		for(var folderName in folders)
		{
			var itemObj = {fName: folderName};
			IchUtil.appendIchTemplate('noname', WizardFolderItemHTML, $(".stepItems", parentDiv), itemObj);
			count++;
		}
		
		// ( add by 15 21.05.2015
		//$(".scrollWrapper", parentDiv).height(stepHeight - 120);
		$(".scrollWrapper", parentDiv).height(400 - 120);
		// add by 15 21.05.2015 )
		var items = $(".stepItems", parentDiv);
		ScrollUtil.updateVScroll(items, scroll, 0, count*35, 10, function(){});
	}

	// ( add by 15 21.05.2015
	function setStepZero()
	{
		var stepDiv = $('#wizardPage #wizBody #wizZero');
		stepDiv.show();
		stepDiv.height(stepHeight);
		stepPageTxtDiv.html('<b>Step 1.</b> Select <i>"Scan all folders"</i> or <i>"Scan selected folder"</i> and wait while we search your device for photos...');
		stepPageTxtDiv.css('visibility', 'visible');
		AppUtil.showLoader(false);
	}
	// add by 15 21.05.2015 )

	function setFolderObject()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var i = 0; i < n; i ++)
		{
			var file = allFiles[i];
			var fileDirName = (phonegap.isAndroid()) ? TextUtil.getWizardFileDirName(file.url) : file.albumName;
			var folderObj = folders[fileDirName];
			if(folderObj == undefined)
			{
				folderObj = {files: []};
				folders[fileDirName] = folderObj;
			}
			folderObj.files.push(file);
		}
	}

	function buildKeywordObject()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var i = 0; i < n; i ++)
		{
			var file = allFiles[i];
			if(file)
			{
				var keywords = getUntypedKeywords(file);
				var m = keywords.length;
				for(var j = 0; j < m; j++)
				{
					var keyword = keywords[j];
					var kObj = keywordItems[keyword];
					if(kObj == undefined)
					{
						kObj = {files: []};
						keywordItems[keyword] = kObj;
					}
					kObj.files.push(file);
				}
			}
		}
	}

	function getUntypedKeywords(item)
	{
		var keys = (item.iptc_Keywords) ? item.iptc_Keywords : [];
		var n = keys.length;
		var keywords = [];
		for(var i = 0; i < n; i++)
		{
			var key = keys[i];
			if(key.indexOf(':') < 0)
				keywords.push(key);
		}
		return keywords;
	}

	function handleStepOne()
	{
		var parentDiv = $("#wizardPage #wizBody #wizOne");
		var wizItems = $(".wizFolderItem", parentDiv);
		var l = wizItems.length;
		toRemoveFiles = [];
		for(var i = 0; i < l; i++)
		{
			var item = wizItems[i];
			var fName = $(".folderTxt", item).attr('fName');
			var include = $(".includeCheck", item).hasClass('checked');
			var isKeyword = $(".keywordCheck", item).hasClass('checked');
			parseStepOneData(fName, include, isKeyword);
		}
		// ( add by 15 21.05.2015
		//removeFiles();
		//addKeywords();

		// node or NW
		if((typeof process !== "undefined" && process.versions && !!process.versions.node))
		{
			nodeRemoveFiles();
			
			if(!allFiles || !allFiles.length)
			{
				AppUtil.showLoader(false);
				alert('Nothig to do. Please select folder.');
				return;
			}
			nodeReadExifInfo();
		}
		// android, ios and ets
		else
		{
			removeFiles();

			if(!allFiles || !allFiles.length)
			{
				AppUtil.showLoader(false);
				alert('Nothig to do. Please select folder.');
				return;
			}
			addKeywords();
		}
		// add by 15 21.05.2015 )
	}

	// ( add by 15 21.05.2015
	function handleAfterReadExifInfo()
	{
		// remove any item that hasn`t exif info
		var i = 0;
		while(i < allFiles.length)
		{
			if(allFiles[i].exif_read_error)
			{
				allFiles.splice(i, 1);
				continue;
			}
			++i;
		}
		nodeAddKeywords();
		AppUtil.showLoader(false);
		setStepTwo();
	}
	// add by 15 21.05.2015 )

	function parseStepOneData(fName, include, isKeyword)
	{
		var files = folders[fName].files;
		if(include == false)
			toRemoveFiles = toRemoveFiles.concat(files);
		else if(isKeyword)
			addKeywordToFiles(files, TextUtil.getWizardKeywordFromDirName(fName));
	}

	function addKeywordToFiles(files, newKeyword)
	{
		var newKeyword = (phonegap.isAndroid()) ? TextUtil.getWizardKeywordFromDirName(newKeyword) : newKeyword;
		keywordObject[newKeyword] = files;
	}

	function addKeywords()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var key in keywordObject)
		{
			var files = keywordObject[key];
			var m = files.length;
			for(var i = 0; i < m; i++)
			{
				var file = files[i];
				for(var j = 0; j < n; j++)
				{
					var allFile = allFiles[j];
					if(allFile.url == file.url)
					{
						if(allFile.iptc_Keywords == undefined)
							allFile.iptc_Keywords = [];
						allFile.iptc_Keywords.push(key);
						break;
					}
				}
			}
		}
	}

	// ( add by 15 21.05.2015
	function nodeAddKeywords()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var key in keywordObject)
		{
			var files = keywordObject[key];
			var m = files.length;
			for(var i = 0; i < m; i++)
			{
				var file = files[i];
				for(var j = 0; j < n; j++)
				{
					var allFile = allFiles[j];
					if(allFile.path == file.path)
					{
						if(allFile.iptc_Keywords == undefined)
							allFile.iptc_Keywords = [];
						allFile.iptc_Keywords.push(key);
						break;
					}
				}
			}
		}
	}
	// add by 15 21.05.2015 )

	function removeFiles()
	{
		var n = (allFiles) ? allFiles.length : 0;
		var m = (toRemoveFiles) ? toRemoveFiles.length : 0;
		for(var i = 0; i < m; i++)
		{
			var file = toRemoveFiles[i];
			for(var j = 0; j < n; j++)
			{
				var allFile = allFiles[j];
				if(allFile.url == file.url)
				{
					allFile.remove = true;
					console.log(allFile.url);
					break;
				}
			}
		}
		var newFiles = [];
		for(var k = 0; k < n; k++)
		{
			var allFile = allFiles[k];
			if(allFile.remove == undefined)
				newFiles.push(allFile);
			else
				console.log(allFile.url);
		}
		allFiles = newFiles;
	}

	// ( add by 15 21.05.2015
	function nodeRemoveFiles()
	{
		var n = (allFiles) ? allFiles.length : 0;
		var m = (toRemoveFiles) ? toRemoveFiles.length : 0;
		for(var i = 0; i < m; i++)
		{
			var file = toRemoveFiles[i];
			for(var j = 0; j < n; j++)
			{
				var allFile = allFiles[j];
				if(allFile.path == file.path)
				{
					allFile.remove = true;
					console.log(allFile.path);
					break;
				}
			}
		}
		var newFiles = [];
		for(var k = 0; k < n; k++)
		{
			var allFile = allFiles[k];
			if(allFile.remove == undefined)
				newFiles.push(allFile);
			else
				console.log(allFile.path);
		}
		allFiles = newFiles;
	}
	// add by 15 21.05.2015 )

	function handleStepTwo()
	{
		var parentDiv = $("#wizardPage #wizBody #wizTwo");
		var selectedItem = $(".wizTwoItem.checked", parentDiv);
		entityTxt = selectedItem.attr("val");
		if(entityTxt == "TXT")
			entityTxt = $("#typeInpt", "#wizardPage #wizBody #wizTwo").val();
		cache.addKeyValue(AppEnum.ENTITY_NAME, entityTxt);
	}

	function updateProgress(progVal)
	{
		var progressWidth = (progVal * maxPx) / 100;
		progressBar.width(progressWidth);
		progressBar.html(progVal + "%");
		autoProgressVal = progVal + 1;
	}

	function handleStepThree()
	{
		var items = $("#wizardPage #wizBody #wizThree .scrollWrapper .stepItems .wizKeywordItem");
		var n = items.length;
		keywordObject = {};
		for(var i = 0; i < n; i++)
		{
			var wizKeywordItem = $(items[i]);
			var keyword = wizKeywordItem.attr("fname");
			var checkRadio = $(".keywordTypeItem.checked", wizKeywordItem);
			var type = checkRadio.attr("val");
			var kObj = keywordItems[keyword];
			addTypedKeywordToFiles(keyword, type, kObj.files);
		}
		// ( add by 15 21.05.2015
		//addTypedKeyword();

		// node or NW
		if((typeof process !== "undefined" && process.versions && !!process.versions.node))
		{
			nodeAddTypedKeyword();
		}
		// android, ios and ets
		else
		{
			addTypedKeyword();
		}
		// add by 15 21.05.2015 )
		
		// test by 15 
		console.log("WizardHelper::handleStepThree allFiles.length: " + allFiles.length);
	}

	function addTypedKeywordToFiles(keyword, type, files)
	{
		keywordObject[keyword] = {type : type, files : files};
	}

	function addTypedKeyword()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var key in keywordObject)
		{
			var files = keywordObject[key].files;
			var type = keywordObject[key].type;
			var m = files.length;
			for(var i = 0; i < m; i++)
			{
				var file = files[i];
				for(var j = 0; j < n; j++)
				{
					var allFile = allFiles[j];
					if(allFile.url == file.url)
					{
						if(allFile.iptc_Keywords == undefined)
							allFile.iptc_Keywords = [];
						var newKey = type + ":" + key;
						allFile.iptc_Keywords.push(newKey);
						break;
					}
				}
			}
		}
	}

	// ( add by 15 21.05.2015
	function nodeAddTypedKeyword()
	{
		var n = (allFiles) ? allFiles.length : 0;
		for(var key in keywordObject)
		{
			var files = keywordObject[key].files;
			var type = keywordObject[key].type;
			var m = files.length;
			for(var i = 0; i < m; i++)
			{
				var file = files[i];
				for(var j = 0; j < n; j++)
				{
					var allFile = allFiles[j];
					if(allFile.path == file.path)
					{
						if(allFile.iptc_Keywords == undefined)
							allFile.iptc_Keywords = [];
						var newKey = type + ":" + key;
						allFile.iptc_Keywords.push(newKey);
						break;
					}
				}
			}
		}
	}

	function nodeReadExifInfo()
	{
		if(!allFiles || !allFiles.length)
		{
			handleAfterReadExifInfo();
			return;
		}

		var exif_tool = require('main/core/utils/nodeExiftool.js');
		if(exif_tool == undefined) return;

		// 'FNumber', 'ExposureTime', 'ISO', 'Model', 'LensType'
		
		// test by 15
		//var reading_tags = [ 'DateTimeOriginal', 'CreateDate', 'DigitalCreationDateTime', 'DateTimeCreated', 'ImageHeight', 'ImageWidth', 'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSPosition', 'Keywords' ];
		var reading_tags = [ 'DateTimeOriginal', 'CreateDate', 'DigitalCreationDateTime', 'DateTimeCreated', 'ImageHeight',
		 'ImageWidth', 'Keywords', 'Orientation', 'ExifImageWidth', 'ExifImageHeight' ];
		if(read_gps)
		{
			reading_tags.push('GPSLatitude');
			reading_tags.push('GPSLongitude');
			reading_tags.push('GPSLatitudeRef');
			reading_tags.push('GPSLongitudeRef');
			reading_tags.push('GPSPosition');
		}
		
		if(!exif_tool.init(reading_tags))
		{
			var props = { focus: true, position: 'mouse', min_height: 240, min_width: 320, toolbar: false };
			var prompt_window = require('nw.gui').Window.open('main/view/wizard/prompt.html', props);
			AppUtil.showLoader(false);
			return;
		}

		var start_index = 0, last_index = 0, count = 0;
		var id = setInterval(
			function readPortionExifInfo()
			{
				if(count) return;

				if(start_index == allFiles.length)
				{
					console.log("nodeReadExifInfo, Files handled: " + allFiles.length);
					clearInterval(id);
					handleAfterReadExifInfo();
					return;
				}
				last_index = (start_index + portion_size <= allFiles.length) ? start_index + portion_size : allFiles.length;

				for(var i = start_index; i < last_index; ++i)
				{
					exif_tool.readTags({ index: i, OriginFileName: allFiles[i].path },
						function nodeReadExifInfoCallBack(error, file_info)
						{
							if(error)
							{
								console.debug(error);
								allFiles[file_info.index].exif_read_error = true;
								--count;
								return;
							}

							var f = allFiles[file_info.index];
							f.exif_DateTimeOriginal = file_info.DateTimeOriginal;
							f.xmpCreateDate = file_info.CreateDate;
							f.exif_DateTimeDigitized = file_info.DigitalCreationDateTime;
							f.exifDateTime = file_info.DateTimeCreated;
							f.url = file_info.OriginFileName;
							f.height = file_info.ImageHeight;
							f.width = file_info.ImageWidth;
							f.Orientation = file_info.Orientation;
							f.ExifImageHeight = file_info.ExifImageHeight;
							f.ExifImageWidth = file_info.ExifImageWidth;
							f.gps_Latitude = file_info.GPSLatitude;
							f.gps_Longitude = file_info.GPSLongitude;
							f.gps_LatitudeRef = file_info.GPSLatitudeRef;
							f.gps_LongitudeRef = file_info.GPSLongitudeRef;
							f.GPSPosition = file_info.GPSPosition;
							f.exif_read_error = false;
							
							// keywords
							if(file_info.Keywords != undefined)
							{
								if(f.iptc_Keywords == undefined) f.iptc_Keywords = [];
								
								if(file_info.Keywords instanceof Array)
								{
									for(var i = 0; i < file_info.Keywords.length; ++i) f.iptc_Keywords.push(file_info.Keywords[i]);
								}
								else if(typeof file_info.Keywords == 'string')
								{
									f.iptc_Keywords.push(file_info.Keywords);
								}
							}
							--count;
						}
					);
				}
				count = last_index - start_index;
				start_index = last_index;
				updateProgress(Math.round(34 + start_index / allFiles.length * 16));
			},
			100
		);
	}
	// add by 15 21.05.2015 )

	helper =
	{
		// test by 15
		setReadGPS: function(l_read_gps)
		{
			read_gps = l_read_gps;
		},
		
		dirScanComplete : function(total)
		{
			stepHeight = LayoutUtil.appHeight - 200 - 150; //100 for top, 100 for bottom, 150 for padding
			picTotal = total;
		},
		fileScanComplete : function(remaining)
		{
			var delta = picTotal - remaining;
			var progressWidth = (delta * stepOneMaxPx) / picTotal;
			progressBar.width(progressWidth);
			var plb = (progressWidth * 100 / maxPx);
			progressBar.html(plb.toFixed(0) + "%");
		},
		scanComplete : function(items)
		{
			AppUtil.showLoader(false);
			allFiles = items;
			keywordObject = {};
			setFolderObject();
			setStepOne();
		},
		// ( add by 15 21.05.2015
		/*
		onStepOneNext : function()
		{
			handleStepOne();
			setStepTwo();
		},
		*/
		onStepOneNext : function()
		{
			// node or NW
			if((typeof process !== "undefined" && process.versions && !!process.versions.node))
			{
				AppUtil.showLoader(true);
				handleStepOne();
			}
			// android, ios and ets
			else
			{
				handleStepOne();
				setStepTwo();
			}
		},
		// add by 15 21.05.2015 )
		onStepTwoNext : function()
		{
			handleStepTwo();
			buildKeywordObject();
			setStepThree();
		},
		// ( add by 15 21.05.2015
		/*
		onStepThreeNext : function()
		{
			AppUtil.showLoader(true);
			updateProgress(95);
			setTimeout(function()
			{
				handleStepThree();
				model.indexItems(allFiles);
			}, 100);
		},
		*/
		onStepThreeNext: function(postWizardCallBack)
		{
			AppUtil.showLoader(true);
			updateProgress(95);

			setTimeout(function()
			{
				handleStepThree();
				model.indexItems(allFiles);
				updateProgress(100);
				//AppUtil.showLoader(false);
				$('#wizardPage').hide();
				if(postWizardCallBack != null) postWizardCallBack();
			}, 100);
		},

		scanStart: function()
		{
			AppUtil.showLoader(true);
		},

		startWizard: function()
		{
			setStepZero();
		},

		onStepZeroSkip: function(postWizardCallBack)
		{
			updateProgress(100);
			model.update();
			$('#wizardPage').hide();
			if(postWizardCallBack != null) postWizardCallBack();
		},
		// add by 15 21.05.2015 )

		setDefault : function()
		{
			progressBar = $("#progressDiv #progressBar", "#wizardPage");
			stepPageTxtDiv = $("#wizardPage #wizBody #stepTxtDiv");

			// ( add by 15 21.05.2015
			$('#folderDialog').attr('hidden', true);
			$('#txt_selected_folder').val('');
			$('#progress').val('');
			// add by 15 21.05.2015 )
		}
	};
	return helper;
});