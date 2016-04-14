// Platform: browser
// 69ae6c979bd30697c04d6200535b1878da4311c4
// browserify
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var PLATFORM_VERSION_BUILD_LABEL = '3.6.0';
var define = {moduleMap: []};
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var cordova = require("/home/fifteen/projects/Node.JS/cordova-js/src/cordova_b");

var execProxy = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/exec/proxy");

module.exports = function(success, fail, service, action, args) {
    var proxy = execProxy.get(service, action);
    if (proxy) {
        var callbackId = service + cordova.callbackId++;
        if (typeof success == "function" || typeof fail == "function") {
            cordova.callbacks[callbackId] = {
                success: success,
                fail: fail
            };
        }
        try {
            proxy(success, fail, args);
        } catch (e) {
            var msg = "Exception calling :: " + service + " :: " + action + " ::exception=" + e;
            console.log(msg);
        }
    } else {
        fail && fail("Missing Command Error");
    }
};
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/exec/proxy":5,"/home/fifteen/projects/Node.JS/cordova-js/src/cordova_b":9}],2:[function(require,module,exports){
module.exports = {
    id: "browser",
    cordovaVersion: "3.4.0",
    bootstrap: function() {
        var modulemapper = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/modulemapper");
        var channel = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/channel");
        window.cordova.commandProxy = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/exec/proxy");
        channel.onNativeReady.fire();
        window.document.addEventListener("webkitvisibilitychange", function() {
            if (window.document.webkitHidden) {
                channel.onPause.fire();
            } else {
                channel.onResume.fire();
            }
        }, false);
    }
};
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/channel":4,"/home/fifteen/projects/Node.JS/cordova-js/src/common/exec/proxy":5,"/home/fifteen/projects/Node.JS/cordova-js/src/common/modulemapper":7}],3:[function(require,module,exports){
var utils = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/utils");

function each(objects, func, context) {
    for (var prop in objects) {
        if (objects.hasOwnProperty(prop)) {
            func.apply(context, [ objects[prop], prop ]);
        }
    }
}

function clobber(obj, key, value) {
    exports.replaceHookForTesting(obj, key);
    var needsProperty = false;
    try {
        obj[key] = value;
    } catch (e) {
        needsProperty = true;
    }
    if (needsProperty || obj[key] !== value) {
        utils.defineGetter(obj, key, function() {
            return value;
        });
    }
}

function assignOrWrapInDeprecateGetter(obj, key, value, message) {
    if (message) {
        utils.defineGetter(obj, key, function() {
            console.log(message);
            delete obj[key];
            clobber(obj, key, value);
            return value;
        });
    } else {
        clobber(obj, key, value);
    }
}

function include(parent, objects, clobber, merge) {
    each(objects, function(obj, key) {
        try {
            var result = obj.path ? require(obj.path) : {};
            if (clobber) {
                if (typeof parent[key] === "undefined") {
                    assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                } else if (typeof obj.path !== "undefined") {
                    if (merge) {
                        recursiveMerge(parent[key], result);
                    } else {
                        assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                    }
                }
                result = parent[key];
            } else {
                if (typeof parent[key] == "undefined") {
                    assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                } else {
                    result = parent[key];
                }
            }
            if (obj.children) {
                include(result, obj.children, clobber, merge);
            }
        } catch (e) {
            utils.alert("Exception building Cordova JS globals: " + e + ' for key "' + key + '"');
        }
    });
}

function recursiveMerge(target, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            if (target.prototype && target.prototype.constructor === target) {
                clobber(target.prototype, prop, src[prop]);
            } else {
                if (typeof src[prop] === "object" && typeof target[prop] === "object") {
                    recursiveMerge(target[prop], src[prop]);
                } else {
                    clobber(target, prop, src[prop]);
                }
            }
        }
    }
}

exports.buildIntoButDoNotClobber = function(objects, target) {
    include(target, objects, false, false);
};

exports.buildIntoAndClobber = function(objects, target) {
    include(target, objects, true, false);
};

exports.buildIntoAndMerge = function(objects, target) {
    include(target, objects, true, true);
};

exports.recursiveMerge = recursiveMerge;

exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;

exports.replaceHookForTesting = function() {};
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/utils":8}],4:[function(require,module,exports){
var utils = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/utils"), nextGuid = 1;

var Channel = function(type, sticky) {
    this.type = type;
    this.handlers = {};
    this.state = sticky ? 1 : 0;
    this.fireArgs = null;
    this.numHandlers = 0;
    this.onHasSubscribersChange = null;
}, channel = {
    join: function(h, c) {
        var len = c.length, i = len, f = function() {
            if (!--i) h();
        };
        for (var j = 0; j < len; j++) {
            if (c[j].state === 0) {
                throw Error("Can only use join with sticky channels.");
            }
            c[j].subscribe(f);
        }
        if (!len) h();
    },
    create: function(type) {
        return channel[type] = new Channel(type, false);
    },
    createSticky: function(type) {
        return channel[type] = new Channel(type, true);
    },
    deviceReadyChannelsArray: [],
    deviceReadyChannelsMap: {},
    waitForInitialization: function(feature) {
        if (feature) {
            var c = channel[feature] || this.createSticky(feature);
            this.deviceReadyChannelsMap[feature] = c;
            this.deviceReadyChannelsArray.push(c);
        }
    },
    initializationComplete: function(feature) {
        var c = this.deviceReadyChannelsMap[feature];
        if (c) {
            c.fire();
        }
    }
};

function forceFunction(f) {
    if (typeof f != "function") throw "Function required as first argument!";
}

Channel.prototype.subscribe = function(f, c) {
    forceFunction(f);
    if (this.state == 2) {
        f.apply(c || this, this.fireArgs);
        return;
    }
    var func = f, guid = f.observer_guid;
    if (typeof c == "object") {
        func = utils.close(c, f);
    }
    if (!guid) {
        guid = "" + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;
    if (!this.handlers[guid]) {
        this.handlers[guid] = func;
        this.numHandlers++;
        if (this.numHandlers == 1) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

Channel.prototype.unsubscribe = function(f) {
    forceFunction(f);
    var guid = f.observer_guid, handler = this.handlers[guid];
    if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

Channel.prototype.fire = function(e) {
    var fail = false, fireArgs = Array.prototype.slice.call(arguments);
    if (this.state == 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        var toCall = [];
        for (var item in this.handlers) {
            toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
            toCall[i].apply(this, fireArgs);
        }
        if (this.state == 2 && this.numHandlers) {
            this.numHandlers = 0;
            this.handlers = {};
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

channel.createSticky("onDOMContentLoaded");

channel.createSticky("onNativeReady");

channel.createSticky("onCordovaReady");

channel.createSticky("onPluginsReady");

channel.createSticky("onDeviceReady");

channel.create("onResume");

channel.create("onPause");

channel.waitForInitialization("onCordovaReady");

channel.waitForInitialization("onDOMContentLoaded");

module.exports = channel;
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/utils":8}],5:[function(require,module,exports){
var CommandProxyMap = {};

module.exports = {
    add: function(id, proxyObj) {
        console.log("adding proxy for " + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
    },
    remove: function(id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
    },
    get: function(service, action) {
        return CommandProxyMap[service] ? CommandProxyMap[service][action] : null;
    }
};
},{}],6:[function(require,module,exports){
var channel = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/channel");

var cordova = require("/home/fifteen/projects/Node.JS/cordova-js/src/cordova_b");

var platform = require("/home/fifteen/projects/Node.JS/cordova-js/src/browser/platform");

var utils = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/utils");

var platformInitChannelsArray = [ channel.onDOMContentLoaded, channel.onNativeReady ];

cordova.exec = require("/home/fifteen/projects/Node.JS/cordova-js/src/browser/exec");

function logUnfiredChannels(arr) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].state != 2) {
            console.log("Channel not fired: " + arr[i].type);
        }
    }
}

window.setTimeout(function() {
    if (channel.onDeviceReady.state != 2) {
        console.log("deviceready has not fired after 5 seconds.");
        logUnfiredChannels(platformInitChannelsArray);
        logUnfiredChannels(channel.deviceReadyChannelsArray);
    }
}, 5e3);

function replaceNavigator(origNavigator) {
    var CordovaNavigator = function() {};
    CordovaNavigator.prototype = origNavigator;
    var newNavigator = new CordovaNavigator();
    if (CordovaNavigator.bind) {
        for (var key in origNavigator) {
            if (typeof origNavigator[key] == "function") {
                newNavigator[key] = origNavigator[key].bind(origNavigator);
            } else {
                (function(k) {
                    utils.defineGetterSetter(newNavigator, key, function() {
                        return origNavigator[k];
                    });
                })(key);
            }
        }
    }
    return newNavigator;
}

if (window.navigator) {
    window.navigator = replaceNavigator(window.navigator);
}

if (!window.console) {
    window.console = {
        log: function() {}
    };
}

if (!window.console.warn) {
    window.console.warn = function(msg) {
        this.log("warn: " + msg);
    };
}

channel.onPause = cordova.addDocumentEventHandler("pause");

channel.onResume = cordova.addDocumentEventHandler("resume");

channel.onDeviceReady = cordova.addStickyDocumentEventHandler("deviceready");

if (window.document.readyState == "complete" || window.document.readyState == "interactive") {
    channel.onDOMContentLoaded.fire();
} else {
    window.document.addEventListener("DOMContentLoaded", function() {
        channel.onDOMContentLoaded.fire();
    }, false);
}

if (window._nativeReady) {
    channel.onNativeReady.fire();
}

platform.bootstrap && platform.bootstrap();

channel.join(function() {
    platform.initialize && platform.initialize();
    channel.onCordovaReady.fire();
    channel.join(function() {
        require("/home/fifteen/projects/Node.JS/cordova-js/src/cordova_b").fireDocumentEvent("deviceready");
    }, channel.deviceReadyChannelsArray);
}, platformInitChannelsArray);
},{"/home/fifteen/projects/Node.JS/cordova-js/src/browser/exec":1,"/home/fifteen/projects/Node.JS/cordova-js/src/browser/platform":2,"/home/fifteen/projects/Node.JS/cordova-js/src/common/channel":4,"/home/fifteen/projects/Node.JS/cordova-js/src/common/utils":8,"/home/fifteen/projects/Node.JS/cordova-js/src/cordova_b":9}],7:[function(require,module,exports){
var builder = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/builder"), moduleMap = define.moduleMap, symbolList, deprecationMap;

exports.reset = function() {
    symbolList = [];
    deprecationMap = {};
};

function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
    if (!(moduleName in moduleMap)) {
        throw new Error("Module " + moduleName + " does not exist.");
    }
    symbolList.push(strategy, moduleName, symbolPath);
    if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
    }
}

exports.clobbers = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry("c", moduleName, symbolPath, opt_deprecationMessage);
};

exports.merges = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry("m", moduleName, symbolPath, opt_deprecationMessage);
};

exports.defaults = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry("d", moduleName, symbolPath, opt_deprecationMessage);
};

exports.runs = function(moduleName) {
    addEntry("r", moduleName, null);
};

function prepareNamespace(symbolPath, context) {
    if (!symbolPath) {
        return context;
    }
    var parts = symbolPath.split(".");
    var cur = context;
    for (var i = 0, part; part = parts[i]; ++i) {
        cur = cur[part] = cur[part] || {};
    }
    return cur;
}

exports.mapModules = function(context) {
    var origSymbols = {};
    context.CDV_origSymbols = origSymbols;
    for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var module = require(moduleName);
        if (strategy == "r") {
            continue;
        }
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf(".");
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);
        var deprecationMsg = symbolPath in deprecationMap ? "Access made to deprecated symbol: " + symbolPath + ". " + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];
        if (strategy == "m" && target) {
            builder.recursiveMerge(target, module);
        } else if (strategy == "d" && !target || strategy != "d") {
            if (!(symbolPath in origSymbols)) {
                origSymbols[symbolPath] = target;
            }
            builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
    }
};

exports.getOriginalSymbol = function(context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && symbolPath in origSymbols) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split(".");
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

exports.reset();
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/builder":3}],8:[function(require,module,exports){
var utils = exports;

utils.defineGetterSetter = function(obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

utils.defineGetter = utils.defineGetterSetter;

utils.arrayIndexOf = function(a, item) {
    if (a.indexOf) {
        return a.indexOf(item);
    }
    var len = a.length;
    for (var i = 0; i < len; ++i) {
        if (a[i] == item) {
            return i;
        }
    }
    return -1;
};

utils.arrayRemove = function(a, item) {
    var index = utils.arrayIndexOf(a, item);
    if (index != -1) {
        a.splice(index, 1);
    }
    return index != -1;
};

utils.typeName = function(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
};

utils.isArray = function(a) {
    return utils.typeName(a) == "Array";
};

utils.isDate = function(d) {
    return utils.typeName(d) == "Date";
};

utils.clone = function(obj) {
    if (!obj || typeof obj == "function" || utils.isDate(obj) || typeof obj != "object") {
        return obj;
    }
    var retVal, i;
    if (utils.isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
            retVal.push(utils.clone(obj[i]));
        }
        return retVal;
    }
    retVal = {};
    for (i in obj) {
        if (!(i in retVal) || retVal[i] != obj[i]) {
            retVal[i] = utils.clone(obj[i]);
        }
    }
    return retVal;
};

utils.close = function(context, func, params) {
    if (typeof params == "undefined") {
        return function() {
            return func.apply(context, arguments);
        };
    } else {
        return function() {
            return func.apply(context, params);
        };
    }
};

utils.createUUID = function() {
    return UUIDcreatePart(4) + "-" + UUIDcreatePart(2) + "-" + UUIDcreatePart(2) + "-" + UUIDcreatePart(2) + "-" + UUIDcreatePart(6);
};

utils.extend = function() {
    var F = function() {};
    return function(Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}();

utils.alert = function(msg) {
    if (window.alert) {
        window.alert(msg);
    } else if (console && console.log) {
        console.log(msg);
    }
};

function UUIDcreatePart(length) {
    var uuidpart = "";
    for (var i = 0; i < length; i++) {
        var uuidchar = parseInt(Math.random() * 256, 10).toString(16);
        if (uuidchar.length == 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}
},{}],9:[function(require,module,exports){
if ("cordova" in window) {
    throw new Error("cordova already defined");
}

var channel = require("/home/fifteen/projects/Node.JS/cordova-js/src/common/channel");

var platform = require("/home/fifteen/projects/Node.JS/cordova-js/src/browser/platform");

var m_document_addEventListener = window.document.addEventListener;

var m_document_removeEventListener = window.document.removeEventListener;

var m_window_addEventListener = window.addEventListener;

var m_window_removeEventListener = window.removeEventListener;

var documentEventHandlers = {}, windowEventHandlers = {};

window.document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof documentEventHandlers[e] != "undefined") {
        documentEventHandlers[e].subscribe(handler);
    } else {
        m_document_addEventListener.call(window.document, evt, handler, capture);
    }
};

window.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof windowEventHandlers[e] != "undefined") {
        windowEventHandlers[e].subscribe(handler);
    } else {
        m_window_addEventListener.call(window, evt, handler, capture);
    }
};

window.document.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof documentEventHandlers[e] != "undefined") {
        documentEventHandlers[e].unsubscribe(handler);
    } else {
        m_document_removeEventListener.call(window.document, evt, handler, capture);
    }
};

window.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof windowEventHandlers[e] != "undefined") {
        windowEventHandlers[e].unsubscribe(handler);
    } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
    }
};

function createEvent(type, data) {
    var event = window.document.createEvent("Events");
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

var cordova = {
    platformVersion: PLATFORM_VERSION_BUILD_LABEL,
    version: PLATFORM_VERSION_BUILD_LABEL,
    require: function(module) {
        console.log(module);
        if (symbolList) {
            for (var i = 0; i < symbolList.length; i++) {
                if (module === symbolList[i].symbol) {
                    return require(symbolList[i].path);
                }
            }
        } else {
            console.log("else");
            return require(module);
        }
    },
    platformId: platform.id,
    addWindowEventHandler: function(event) {
        return windowEventHandlers[event] = channel.create(event);
    },
    addStickyDocumentEventHandler: function(event) {
        return documentEventHandlers[event] = channel.createSticky(event);
    },
    addDocumentEventHandler: function(event) {
        return documentEventHandlers[event] = channel.create(event);
    },
    removeWindowEventHandler: function(event) {
        delete windowEventHandlers[event];
    },
    removeDocumentEventHandler: function(event) {
        delete documentEventHandlers[event];
    },
    getOriginalHandlers: function() {
        return {
            document: {
                addEventListener: m_document_addEventListener,
                removeEventListener: m_document_removeEventListener
            },
            window: {
                addEventListener: m_window_addEventListener,
                removeEventListener: m_window_removeEventListener
            }
        };
    },
    fireDocumentEvent: function(type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] != "undefined") {
            if (bNoDetach) {
                documentEventHandlers[type].fire(evt);
            } else {
                setTimeout(function() {
                    if (type == "deviceready") {
                        window.document.dispatchEvent(evt);
                    }
                    documentEventHandlers[type].fire(evt);
                }, 0);
            }
        } else {
            window.document.dispatchEvent(evt);
        }
    },
    fireWindowEvent: function(type, data) {
        var evt = createEvent(type, data);
        if (typeof windowEventHandlers[type] != "undefined") {
            setTimeout(function() {
                windowEventHandlers[type].fire(evt);
            }, 0);
        } else {
            window.dispatchEvent(evt);
        }
    },
    callbackId: Math.floor(Math.random() * 2e9),
    callbacks: {},
    callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
    },
    callbackSuccess: function(callbackId, args) {
        this.callbackFromNative(callbackId, true, args.status, [ args.message ], args.keepCallback);
    },
    callbackError: function(callbackId, args) {
        this.callbackFromNative(callbackId, false, args.status, [ args.message ], args.keepCallback);
    },
    callbackFromNative: function(callbackId, isSuccess, status, args, keepCallback) {
        try {
            var callback = cordova.callbacks[callbackId];
            if (callback) {
                if (isSuccess && status == cordova.callbackStatus.OK) {
                    callback.success && callback.success.apply(null, args);
                } else if (!isSuccess) {
                    callback.fail && callback.fail.apply(null, args);
                }
                if (!keepCallback) {
                    delete cordova.callbacks[callbackId];
                }
            }
        } catch (err) {
            var msg = "Error in " + (isSuccess ? "Success" : "Error") + " callbackId: " + callbackId + " : " + err;
            console && console.log && console.log(msg);
            this.fireWindowEvent("cordovacallbackerror", {
                message: msg
            });
            throw err;
        }
    },
    addConstructor: function(func) {
        channel.onCordovaReady.subscribe(function() {
            try {
                func();
            } catch (e) {
                console.log("Failed to run constructor: " + e);
            }
        });
    }
};

window.cordova = module.exports = cordova;
},{"/home/fifteen/projects/Node.JS/cordova-js/src/browser/platform":2,"/home/fifteen/projects/Node.JS/cordova-js/src/common/channel":4}],10:[function(require,module,exports){
require("/home/fifteen/projects/Node.JS/cordova-js/src/common/init_b");
},{"/home/fifteen/projects/Node.JS/cordova-js/src/common/init_b":6}]},{},[1,2,10]);
