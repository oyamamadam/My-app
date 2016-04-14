// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(["text!wizard/Wizard.html",
        "css!wizard/Wizard",
        'wizard/WizardHelper',
        'util/IchUtil',
        'util/AppUtil',
        'cls',
        'phonegap',
        'wizard/IndexingHelper'],

function(WizardHTML, WizardCSS, WizardHelper, IchUtil, AppUtil, cls, phonegap, IndexingHelper)
{
	var tCount = 5;

	// ( add by 15 21.05.2015
	var postWizardCallBack = null;
	// add by 15 21.05.2015 )

	function addListeners()
	{
		AppUtil.addTouchEvent('#wizardPage #s1', onStepOne);
		AppUtil.addTouchEvent('#wizardPage #s2', onStepTwo);
		AppUtil.addTouchEvent('#wizardPage #s3', onStepThree);

		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent .stepPage .wizFolderItem .checkCan', onCheckTap);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent .stepPage .wizTwoItem', onRadioTap);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizThree .keywordTypeItem', onRadioThreeTap);
		// ( add by 15 21.05.2015
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero #scan_all', onSelectScanAll);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero #scan_folder', onSelectScanFolder);
		//AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero #btn_selected_folder', onSelectFolder);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero .selectBtn', onSelectFolder);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero .nextBtn', onStepZeroNext);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizZero .skipBtn', onStepZeroSkip);
		// add by 15 21.05.2015 )
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizOne .nextBtn', WizardHelper.onStepOneNext);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizTwo .nextBtn', WizardHelper.onStepTwoNext);
		// ( add by 15 21.05.2015
		//AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizThree .nextBtn', WizardHelper.onStepThreeNext);
		AppUtil.addTouchEvent('#wizardPage #wizBody #wizContent #wizThree .nextBtn', onWizardComplete);
		// add by 15 21.05.2015 )
	}

	function onCheckTap()
	{
		var $this = $(this);
		var hasClass = $this.hasClass("checked");
		if(hasClass)
			$this.removeClass('checked');
		else
			$this.addClass('checked');
	}

	function onRadioThreeTap()
	{
		var $this = $(this);
		var parentNode = $(this.parentNode);
		$(".keywordTypeItem", parentNode).removeClass('checked');
		$this.addClass('checked');
	}

	function onRadioTap()
	{
		var $this = $(this);
		$("#wizardPage #wizBody #wizContent .stepPage .wizTwoItem").removeClass('checked');
		$this.addClass('checked');
	}

	function onStepOne()
	{
		$.event.trigger("wizardEvent", {type: "dirScanComplete", total: tCount});
	}
	function onStepTwo()
	{
		$.event.trigger("wizardEvent", {type: "scanComplete"});
	}
	function onStepThree()
	{

	}

	function setTestValue()
	{
		var testData = [];
		var n = 17;
		for(var i = 0; i < n; i++)
		{
			var file = new cls.Pic("id", "Name", 'file:///storage/emulated/o/Pictures/User_testomg_imgs/20110210321.jpg', "MICHAL");
			if(i % 2 == 0)
				file = new cls.Pic("id", "Name", 'file:///storage/emulated/o/Pictures/vacation'+ i +'/mioplop.jpg', "C:\\_michal\\albums\\Peru");
			if(i % 3 == 0)
				file = new cls.Pic("id", "Name", 'file:///storage/emulated/o/Pictures/vacation/Laska/100lat/what_now/dep_deep_deeep_Deeeeep/mioplop.jpg', "LONG PATH TEST LONG PATH TEST LONG PATH TEST LONG PATH TEST");
            testData.push(file);
		}
        setTimeout(function(){
            console.log("SET TIME OUT");
            WizardHelper.scanComplete(testData);
        }, 2000);
	}

	// ( add by 15 21.05.2015
	function onSelectScanAll()
	{
		$('#txt_selected_folder').attr('disabled', 'disabled');
		$('#btn_selected_folder').attr('disabled', 'disabled');
		$('#btn_selected_folder').css('background-color', '#7f7f7f');
	}

	function onSelectScanFolder()
	{
		$('#txt_selected_folder').removeAttr('disabled');
		$('#btn_selected_folder').removeAttr('disabled');
		$('#btn_selected_folder').css('background-color', '#7f91a3');
	}

	function onSelectFolder()
	{
		if($('#btn_selected_folder').attr('disabled') == 'disabled') return;
		
		var fd = document.getElementById('folderDialog');

		fd.onchange = function(e)
		{
			document.getElementById('txt_selected_folder').value = e.target.value;
		};
		fd.click();
	}

	function onWizardComplete()
	{
		WizardHelper.onStepThreeNext(postWizardCallBack);
	}

	// The finded folders with image files.
	var findedFiles = [];

	// Handlers for the find folders function.
	function onNodeEnumFiles(folder, file, modify_time, create_time)
	{
		var slash = (require('os').platform() == 'win32' ? '\\' : '/');
		if(folder.length > 1 && folder[folder.length - 1] == slash) folder = folder.substring(0, folder.length - 1);
		findedFiles.push({ folder: folder, file: file, mtime: modify_time, ctime: create_time });
		$('#progress').text(folder);
	};

	function onNodeEnumComplete()
	{
		$('#progress').val('');
		
		if(!findedFiles.length)
		{
			alert('There is no one file in: \'' + $('#txt_selected_folder').val() + '\', please select another folder.');
			AppUtil.showLoader(false);
			return;
		}
		findedFiles.sort();

		var findData = [];
		var slash = (require('os').platform() == 'win32' ? '\\' : '/');

		for(var i = 0; i < findedFiles.length; ++i)
		{
			var last_slash_pos = findedFiles[i].folder.lastIndexOf(slash);
			var last_slash_pos_at_file = findedFiles[i].file.lastIndexOf(slash);
			var name = (last_slash_pos_at_file == -1 ? findedFiles[i].file : findedFiles[i].file.substring(last_slash_pos_at_file + 1));
			var pic;
			
			if(findedFiles[i].folder == slash)
			{
				pic = new cls.Pic(i, name, findedFiles[i].file, findedFiles[i].folder);
				pic.ctime = findedFiles[i].ctime; 
				pic.mtime = findedFiles[i].mtime; 
				findData.push(pic);
				
				continue;
			}
			pic = new cls.Pic(i , name, findedFiles[i].file, (last_slash_pos != -1 ? findedFiles[i].folder.substring(last_slash_pos + 1) : findedFiles[i].folder));
			pic.ctime = findedFiles[i].ctime; 
			pic.mtime = findedFiles[i].mtime; 
			pic.url = pic.path;
			findData.push(pic);
		}
		console.log("onNodeEnumComplete, Files found: " + findData.length);
		IndexingHelper.urlsLoaded(findData);
	};

	// Find folders with image files on node and NW platforms.
	function nodeFindFiles()
	{
		var supported_file_formats = [ 'jpg', 'jpeg', 'png' ];
		var enum_files = require('main/core/utils/nodeEnumFiles.js');

		findedFiles = [];

		if(enum_files)
		{
			var selected_folder = '/'/*'/home/fifteen/TestPhoto 1/'*/;

			if($('#scan_folder').prop('checked')) selected_folder = $('#txt_selected_folder').val();

			enum_files.init(supported_file_formats);

			if(require('os').platform() == 'win32' && selected_folder === '/')
			{
				selected_folder = [];
				for(var i = 'c'.charCodeAt(); i <= 'z'.charCodeAt(); ++i) selected_folder.push(String.fromCharCode(i) + ':\\');
			}
			enum_files.enumFiles(selected_folder, null, null, onNodeEnumFiles, onNodeEnumComplete);
		}
	}

	function onStepZeroNext()
	{
		// node or NW
		if((typeof process !== "undefined" && process.versions && !!process.versions.node))
		{
			if($('#txt_selected_folder').val() == '')
			{
				alert('Select folder first.');
				return;
			} 
			WizardHelper.setReadGPS($('#read_gps').prop('checked'));
			WizardHelper.scanStart();
			nodeFindFiles();
		}
		// android, ios and ets
		else
		{
		}
	}

	function onStepZeroSkip()
	{
		WizardHelper.onStepZeroSkip(postWizardCallBack);
	}
	// add by 15 21.05.2015 )

	var wiz =
	{
		init:function()
		{
			IchUtil.applyIchTemplate('noname', WizardHTML, $('#wizardPage'));
			addListeners();
		},
		// ( add by 15 21.05.2015
		/*
		showPage:function()
		{
			$('#wizardPage').show();
			WizardHelper.setDefault();
            //FOR TEST ONLY
            //setTestValue();
		}
		*/
		showPage:function(_postWizardCallBack)
		{
			postWizardCallBack = _postWizardCallBack;
			$('#wizardPage').show();
			WizardHelper.setDefault();
			WizardHelper.startWizard();
		}
		// add by 15 21.05.2015 )
	};
	return wiz;
});