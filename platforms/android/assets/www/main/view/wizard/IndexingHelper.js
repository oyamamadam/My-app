define(['wizard/WizardHelper',
        'util/AppUtil',
        'phonegap'],

function(WizardHelper, AppUtil, phonegap)
{
	var urlItems = undefined;
	var chunkSize = 55;
	var currentChunkIndex = 0;
	var dataLength = 0;
	var items = [];
	var urlToAlbum = undefined;

	function getUrlsInChunk()
	{
		var urls = [];
		var counter = 0;
		for(var i = currentChunkIndex; i < dataLength; i++)
		{
			urls.push(urlItems[i].url);
			counter++;
			if(counter >= chunkSize)
				break;
		}
		currentChunkIndex = currentChunkIndex + chunkSize;
		return urls;
	}

	function invokeDataLoad()
	{
		var urls = getUrlsInChunk();
		// ( add by 15 21.05.2015
		// node or NW
		if((typeof process !== "undefined" && process.versions && !!process.versions.node))
		{
			chunkDataLoaded(urlItems);
		}
		// android, ios and ets
		else
		{
			phonegap.getPhotoMetadata(urls, chunkDataLoaded);
		}
		// add by 15 21.05.2015 )
	}

	function chunkDataLoaded(data)
	{
		items = items.concat(data);
		var l = items.length;
		WizardHelper.fileScanComplete(dataLength - l);
		if(l == dataLength)
			dataLoadComplete();
		else
			setTimeout(invokeDataLoad, 100);
	}

	function dataLoadComplete()
	{
		var n = (items) ? items.length : 0;
		for(var i = 0; i < n; i++)
		{
			var item = items[i];
			var albumName = urlToAlbum[item.url];
			//console.log("URL = " + item.url + ", albumName = " + albumName + ", i = " + i);
			item.albumName = albumName;
		}
		WizardHelper.scanComplete(items);
		items = [];
	}

	var comp =
	{
		urlsLoaded : function(data)
		{
			var photos = [];
			var n = data.length;
			currentChunkIndex = 0;
			urlToAlbum = {};
			urlItems = [];

			for(var i = 0; i < n; i++)
			{
				var item = data[i];
				if(urlToAlbum[item.url] == undefined)
				{
					urlToAlbum[item.url] = item.albumName;
					urlItems.push(item);
				}
			}

			dataLength = urlItems.length;
			items = [];
			WizardHelper.dirScanComplete(dataLength);
			invokeDataLoad();
		}
	};
	return comp;
});