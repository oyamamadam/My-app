// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['cordova', 'cls', 'adptr/DeviceAdaptor', 'scanDroid', 'scanIOS', 'photodb'],
function(cordovaModule, cls, DeviceAdaptor, scanDroid, scanIOS, photodb) {

    console.debug("phonegap2.js");

	var me = {
        deviceInfo:undefined,     // phonegap device information, when changed "deviceInfoChange" even is fired
        littleEndian:undefined,
        scan:undefined,
        callBack:undefined,

        initialize: function() {
        	console.log("phonegap2 initialize....................");
            me.bindEvents();
        },

        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },

        onDeviceReady: function() {
            console.log('phonegap.onDeviceReady');
            me.checkDevice();
            var littleEndian = (function() {
              var buffer = new ArrayBuffer(2);
              new DataView(buffer).setInt16(0, 256, true);
              return new Int16Array(buffer)[0] === 256;
            })();
            console.debug("littleEndian = " + littleEndian); // true or false
            me.littleEndian = littleEndian;
            $.event.trigger("phonegapReady", [me]);
        },

        isAndroid:function(){
            return me.deviceInfo ? me.deviceInfo.platform == "Android" : false;
        },

        isIOS:function(){
            return me.deviceInfo ? me.deviceInfo.platform == "iOS" : false;
        },

		// ( add by 15 21.05.2015
        isNode:function(){
        	return (typeof process !== "undefined" && process.versions && !!process.versions.node) ? true : false;
        },
		// add by 15 21.05.2015 )

        checkDevice:function(){
            if (typeof device == "undefined") {
                console.debug("phonegap.checkDevice > device feature is unsupported");
            	DeviceAdaptor.inBrowser = true;
            } else {
                var infoText =  'Device Model: '    + device.model    + '\n' +
                                'Device Cordova: '  + device.cordova  + '\n' +
                                'Device Platform: ' + device.platform + '\n' +
                                'Device UUID: '     + device.uuid     + '\n' +
                                'Device Version: '  + device.version  + '\n';
                console.log('PHONE GAP 2 Device Info: ' + infoText);
                DeviceAdaptor.deviceId = device.uuid;
                this.deviceInfo = device;
                $.event.trigger("deviceInfoChange", [me.deviceInfo, infoText]);
            }
        },

        getScan:function(){
            if(!me.scan){
                if(me.isAndroid())
                    me.scan = scanDroid;
				// ( add by 15 21.05.2015
                //else if(me.isIOS() || 1==1)
                //    me.scan = scanIOS;
                else if(me.isIOS())
                    me.scan = scanIOS;
                else if(me.isNode())
                    me.scan = null; //scanNode;
				// add by 15 21.05.2015 )
                else
                    console.log("SCAN OBJECT IS undefined!!!!!");
            }
            return me.scan;
        },

       getThumbnails:function(urls, cb)
       {
       scan = me.getScan();
       callBack = cb;
//       console.log("phonegap2.getThumbnails for " + list.length + " picture urls");
       if(scan) scan.getThumbnails(urls, me.getThumbnailsCallback);
       },

       getThumbnailsCallback:function(data)
       {
       console.debug("phonegap2.getThumbnailsCallback > " + data.length);
       callBack(data);
       },


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getAllPhotos:function(cb)
        {
            console.log("phonegap2.getAllPhotos");
            scan = me.getScan();
            callBack = cb;
            if(scan) scan.getPictures(me.getAllPhotosCallback);
        },

        getAllPhotosCallback:function(data)
        {
            console.debug("phonegap2.getAllPhotosCallback > " + data.length);
            callBack(data);
        },

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        getPhotoMetadata:function(urls, cb)
        {
            console.log("phonegap.getPhotoMetadata");
            callBack = cb;
            scan = me.getScan();
            //if(scan) scan.getPhotoMetadata(urls, me.getPhotoMetadataCallback);
        },

        getPhotoMetadataCallback:function(data)
        {
            console.debug("phonegap.getPhotoMetadataCallback > " + data.length);
            callBack(data);
        }
    };
    return me;
});