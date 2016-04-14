define(['util/AppUtil', 
        'log',
        'util/TextUtil',
        'enum/AppEnum',
        'phonegap',
        'adptr/DeviceAdaptor',
        "m/ModelAssist",
        'sync/Sync',
        'wizard/Wizard',
        'wizard/IndexingHelper'],
        
function(AppUtil, log, TextUtil, AppEnum, phonegap, DeviceAdaptor, ModelAssist, Sync, wizard, IndexingHelper)
{       
	var pictureFiles = undefined;
	
	function invokeSyncProcess()
	{
		if(DeviceAdaptor.inBrowser == false)
		{
			if(phonegap)
			{
				console.log("invokeSyncProcess");
//				phonegap.getPicturesForSyncing(onScanComplete);
       
       $("#contentPage").hide();
       wizard.init();
       wizard.showPage();
       phonegap.getAllPhotos(IndexingHelper.urlsLoaded);

			}	
		}	
	}
	
	function onScanComplete(data) // data -> array of pic objects. 
	{
		var n = data.length;
		var objsByPath = ModelAssist.getObjectsByPath();
		var newFiles = [];
		for(var i = 0; i < n; i++)
		{
			var fileEntry = data[i];			
			var itemOnModel = objsByPath[fileEntry.fullPath];
			if(itemOnModel == undefined)
				newFiles.push(fileEntry);
    	}
		Sync.showSyncPopup(newFiles, comp.invokeSyncing);
	}
	
	var comp = {	
		init : function()
		{
			Sync.init();
		},
		
		startSyncProcess: function()
		{
			if(DeviceAdaptor.inBrowser == false)
			{
				invokeSyncProcess();
			}
			else
			{	 			
				var newImgs = getNewImgs();
				Sync.showSyncPopup(newImgs, comp.invokeSyncing);
			}
		}, 
		
		invokeSyncing : function(fileEntries)
		{
			if(DeviceAdaptor.inBrowser == false)
			{
				var n = fileEntries.length;
				if(n > 0)
				{
					wizard.init();
					wizard.showPage();
					$("#contentPage").hide();	
					phonegap.indexSelectedFiles(fileEntries);
				}	
			}
		}
	};
	
	function getNewImgs()
	{
		var n = 10;
		var pics = [];
		for(var i = 0; i < n; i++)
		{
			var item = {fullPath: "c:/laska.jpg"};
			pics.push(item);
		}	
		return pics;
	}
	
	return comp;
});