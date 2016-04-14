define(['m/ModelHelper',
        'adptr/DeviceAdaptor',
        'model',
        'util/AppUtil'],
        
function(ModelHelper, DeviceAdaptor, model, AppUtil)
{
	var validationTimerRunning = false;
	function validateDirtyState()
	{
		validationTimerRunning = false;
		var dirtyItems = ModelHelper.getDirtyItems();			
		var documents = [];
		var n = (dirtyItems) ? dirtyItems.length : 0;
				
		for(var i = 0; i < n; i++)
		{			
			var item = dirtyItems[i];
			documents.push(getDirtyObject(item));
		}
		
		if(n > 0)
		{
			var updateObj = {};
			updateObj["UserToken"] = model.userEmail;
			updateObj["DeviceId"] = DeviceAdaptor.deviceId;
			updateObj["Documents"] = documents;
			model.update(updateObj);
			AppUtil.showLoader(true);
		}	
	}
	
	function getDirtyObject(item)
	{
		var obj = {};
		obj.SourceFile = item.source_file;
		obj.CreateDate = item.create_date;
		obj.GPSPosition = item.gps_position;
		obj.Keywords = item.keyword_pairs;
		obj.id = item.serverSideId;
        //console.log("item.create_date: " + item.create_date);
		return obj;
	}

	
	var helper = 
	{
		dirtyStateChangeHandler: function()
		{
			validateDirtyState();		
		}
	};
	
	return helper;
		
});