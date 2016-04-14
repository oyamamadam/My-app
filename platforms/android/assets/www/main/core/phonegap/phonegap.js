define(['cordova', 'cls', 'adptr/DeviceAdaptor', 'scanDroid', 'scanIOS', 'photodb'], 
function(cordovaModule, cls, DeviceAdaptor, scanDroid, scanIOS, photodb) {

	var phonegap = {
        deviceInfo:undefined,     // phonegap device information, when changed "deviceInfoChange" even is fired
        pictureFiles:[],
        littleEndian:undefined,

        initialize: function() 
        {
            phonegap.bindEvents();
        },

        bindEvents: function() 
        {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },

        onDeviceReady: function() 
        {
            console.log('phonegap.onDeviceReady');
            phonegap.checkDevice();
            var littleEndian = (function() {
              var buffer = new ArrayBuffer(2);
              new DataView(buffer).setInt16(0, 256, true);
              return new Int16Array(buffer)[0] === 256;
            })();
            //console.log("littleEndian = " + littleEndian); // true or false
            phonegap.littleEndian = littleEndian;
            $.event.trigger("phonegapReady", [phonegap]);
        },

        isAndroid:function()
        {
            return phonegap.deviceInfo ? phonegap.deviceInfo.platform == "Android" : false;
        },

        isIOS:function()
        {
            return phonegap.deviceInfo ? phonegap.deviceInfo.platform == "iOS" : false;
        },

        checkDevice:function()
        {
            if (typeof device == "undefined") {
                //console.log("phonegap.checkDevice > device feature is unsupported");
            	DeviceAdaptor.inBrowser = true;
            } else {
                var infoText =  'Device Model: '    + device.model    + '\n' +
                                'Device Cordova: '  + device.cordova  + '\n' +
                                'Device Platform: ' + device.platform + '\n' +
                                'Device UUID: '     + device.uuid     + '\n' +
                                'Device Version: '  + device.version  + '\n';
                console.log('Device Info: ' + infoText);
                DeviceAdaptor.deviceId = device.uuid;
                this.deviceInfo = device;
                $.event.trigger("deviceInfoChange", [phonegap.deviceInfo, infoText]);
            }
        },

        getPictures:function(isSync)
        {
        	console.log("phonegap.getPictures");
        	var scan = phonegap.getScanObject(); 
        	if(scan)
        		scan.getPictures(phonegap.getPicturesCallback);
        	else
        		console.log("SCAN OBJECT IS undefined!!!!!");
        },
        
        getPicturesForSyncing:function(callBack)
        {
        	var scan = phonegap.getScanObject();        	
        	if(scan)
        	{
        		scan.isSyncing = true;
        		scan.getPictures(callBack);
        	}	        
        },
        
        indexSelectedFiles : function(fileEntries)
        {
        	console.log("PHONEGAP: indexSelectedFiles");
        	var scan = phonegap.getScanObject();        	
        	if(scan)
        	{
        		scan.isSyncing = true;
        		scan.validateFiles(fileEntries, phonegap.getPicturesCallback);
        	}	        
        },
        
        getScanObject : function()
        {
        	var scan = undefined;
        	if(phonegap.isAndroid())
        		scan = scanDroid;
        	else if(phonegap.isIOS())
        		scan = scanIOS;
        	return scan;
        },

        getPicturesCallback:function(data)
        {
        	//console.debug("phonegap.getPicturesCallback > " + data.length);
        	phonegap.pictureFiles = data;
        	for(var i=0; i<data.length;i++){
        		//console.debug(data[i].toString());
        	}
        	$.event.trigger("onPictureFilesChange", [data]);
        },

        getThumbnails:function(list)
        {
        	var scan = phonegap.getScanObject();    
            console.log("phonegap.getThumbnails for " + list.length + " picture urls");
            if(scan)
            	scan.getThumbnails(list);
        },

        getFullPictures:function(list)
        {
        	var scan = undefined;
        	if(phonegap.isAndroid())
        		scan = scanDroid;
        	else if(phonegap.isIOS())
        		scan = scanIOS;
            console.log("phonegap.getFullPictures for " + list.length + " picture urls");
            scan.getFullScreenPhotos(list);
        },
        
        addKeywordToFiles : function(files, keyword)
        {
        	var n = files.length;
        	for(var i = 0; i < n; i++)
        	{
        		var file = files[i];
        		var fPath = file.path;
        		var m = phonegap.pictureFiles.length;
        		for(var j = 0; j < m; j++)
        		{
        			var pgFile = phonegap.pictureFiles[j];
        			if(pgFile)
        			{
            			var pgFilePath = pgFile.path;
            			if(pgFilePath == fPath)
            			{
            				pgFile.addKeyword(keyword);
            				break;
            			}	
        			}	
        		}	
        	}	   
        },
        
        removeFiles : function(files)
        {
        	var n = files.length;
        	for(var i = 0; i < n; i++)
        	{
        		var file = files[i];
        		var fPath = file.path;
        		var m = phonegap.pictureFiles.length;
        		for(var j = 0; j < m; j++)
        		{
        			var pgFile = phonegap.pictureFiles[j];
        			if(pgFile)
        			{
            			var pgFilePath = pgFile.path;
            			if(pgFilePath == fPath)
            			{
            				delete phonegap.pictureFiles[j];
            				break;
            			}	
        			}	
        		}	
        	}	        	
        },
        
        addTypedKeywordToFiles : function(keyword, type, files)
        {
        	var n = files.length;
        	for(var i = 0; i < n; i++)
        	{
        		var file = files[i];
        		var fPath = file.path;
        		var m = phonegap.pictureFiles.length;
        		for(var j = 0; j < m; j++)
        		{
        			var pgFile = phonegap.pictureFiles[j];
        			if(pgFile)
        			{
            			var pgFilePath = pgFile.path;
            			if(pgFilePath == fPath)
            			{
            				file.addTypedKeyword(keyword, type);
            				break;
            			}	
        			}	
        		}	
        	}	        	
        },
        
        traceFiles : function()
        {
        	console.log("REACING FILES:");
        	var m = phonegap.pictureFiles.length;
    		for(var j = 0; j < m; j++)
    		{
    			var pgFile = phonegap.pictureFiles[j];
    			if(pgFile)
    			{
        			console.log("PATH: " + pgFile.path);
        			if(pgFile.metadata && pgFile.metadata.keywords)
        				console.log(pgFile.metadata.keywords);
    			}	
    		}	
        } 
    };
    return phonegap;
});