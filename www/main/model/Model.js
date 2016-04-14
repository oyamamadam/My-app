define(["adptr/ServiceAdaptor",
        "main/model/Class",
        'util/ModelUtil',
        'enum/AppEnum',
        'adptr/DeviceAdaptor',
        'phonegap',
        "m/ModelHelper",
        "m/ModelAssist",
        'util/AppUtil'],

function(service, Class, ModelUtil, AppEnum, DeviceAdaptor, phonegap, ModelHelper, ModelAssist, AppUtil)
{
	var model = undefined;
	var indexingNeeded = true;

	function successIndexHandler()
	{
		console.log("**************** Model :: indexing Success *************");
		// WE NEED TO WAIT BECAUSE THE SERVICE IS NOT READY RIGHT AWAY
		setTimeout(onWaitDone, 2000);
	}

	function onWaitDone()
	{
		 console.log("DONE WITING LETS CALL SEARCH NOW");
	     model.search(model.searchTerm);
	}

	function successHandler(data)
	{
        if(DeviceAdaptor.inBrowser)
        {
            //data = data.slice(13, data.length - 1);
            //console.log(data[data.length - 1]);
            data = JSON.parse(data);
        }

		var rs = data ? data.results : [];
		console.log("Model ::searchSuccess " + rs.length);
		ModelAssist.parseData(rs);
		$.event.trigger("searchComplete");

		if(model.updating)
		{
			model.updating = false;

			if(model.updatePending)
			{
				model.updatePending = false;
				model.saveDirtyState();
			}
			AppUtil.showLoader(false);
		}
	}

	function errorHandler(error)
	{
		console.log("Model::searchError > " + error);
		$.event.trigger("searchFailed");
	}

	var Model = Class.extend(
	{
		// Constructor
        init: function()
        {
        	//console.log("Model::init > model instance created");
        },

        user_token:undefined,
		searchTerm:undefined,     // last search term
		page:1,
		pageSize:10000,
		searchResults:[],  // search results
		facets:[],
		root_categories:{},
		events_Facet:{}, // added by Alex 8-Feb
		all_catgs:{}, // added by Alex 9 Feb
		keywords:[],
		typedKeywords:{},
		userEmail: undefined,
		updating: false,
		updatePending : false,

		search: function(keyword)
		{
			console.log("Model::search > " + keyword + " page = " + this.page + " pageSize = " + this.pageSize);
			this.searchTerm = keyword;
			var page = this.page; // save page, to check if correct page is retrieved in results handler
			service.search(keyword, this.page, this.pageSize, DeviceAdaptor.deviceId, this.userEmail, successHandler, errorHandler);
		},

		index: function()
		{
			var allFiles = phonegap.pictureFiles;
			var l = allFiles.length;
			console.log("Model::index allFiles.length: " + allFiles.length);
			if(l > 0 || l == 0)
			{
				var indexObj = ModelUtil.getIndexObject(DeviceAdaptor.deviceId, this.userEmail, allFiles);
				service.postJson(indexObj, successIndexHandler);
			}
			else
			{
				console.log("INDEXING FAILED");
			}
		},

		indexItems : function(items)
		{
			// test by 15
			console.log("Model::indexItems items.length: " + items.length);

			// ( add by 15 21.05.2015
			// just for watch a result of search
			//if(items.length) this.searchTerm = items[0].albumName;
			// add by 15 21.05.2015 )

			//var l = items.length;
			//console.log("Model::Indexing > " + l);
			var indexObj = ModelUtil.getIndexObj(DeviceAdaptor.deviceId, this.userEmail, items);

			// test by 15
			console.log("Model::indexItems indexObj['Documents'].length: " + indexObj["Documents"].length);
			
			service.postJson(indexObj, successIndexHandler);
		},

		update: function(updateObj)
		{
			// ( add by 15 21.05.2015
			//return;
			AppUtil.showLoader(true);
			// add by 15 21.05.2015 )
			model.updating = true;
			service.postJson(updateObj, successIndexHandler);
		},

		saveDirtyState : function()
		{
			if(model.updating)
			{
				updatePending = true;
				return;
			}
			AppUtil.showLoader(true);
			model.updating = true;
			var dirtyObject = ModelAssist.getDirtyObject();
			dirtyObject["UserToken"] = model.userEmail;
			dirtyObject["DeviceId"] = DeviceAdaptor.deviceId;
			service.postJson(dirtyObject, successIndexHandler);
		},

		modelIsDirty : function ()
		{
			return ModelAssist.isDirty;
		}
	});
	model = new Model();
    return model;
});