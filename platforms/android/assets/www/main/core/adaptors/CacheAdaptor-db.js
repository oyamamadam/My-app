// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(function() {  

    console.debug("CacheAdaptor-db.js");
    var db = window.openDatabase("BiblioSmartDB", "1.0", "Biblio Smart DB", 200000);
    db.transaction(setupDb, onDbError, onDbSuccess);
    var cache = {};

    function onDbError(error){
    	console.error('onDbError ' + error.message);
    }
    
    function onDbSuccess(tx, results){
		console.debug('onDbSuccess');
    }

    function onSelectKeyValuesSuccess(tx, results) {
		var len = results.rows.length;
		var msg = len == 0 ? "No KEY_VALUE's in the database" : "";
		for (var i = 0; i < len; i++) {
			var row = results.rows.item(i);
			msg += row.key + " - " + row.value + (i < len-1 ? "\n" : "");
			cache[row.key] = row.value;
		}
		console.debug(msg);
	}

	function onDbGetValueSuccess(tx, results) {
		console.debug("onDbGetValueSuccess 1 " + tx);
		console.debug("onDbGetValueSuccess 2 " + results);
	}

    function setupDb(tx){
		tx.executeSql("CREATE TABLE IF NOT EXISTS KEY_VALUE (key UNIQUE, value)");
		tx.executeSql("SELECT * FROM KEY_VALUE", [], onSelectKeyValuesSuccess, onDbError);    	
    }

    function upsertRow(key, value){
    	cache[key] = value;
		db.transaction(
			function(tx){
				tx.executeSql("REPLACE INTO KEY_VALUE (key, value) VALUES (?, ?)",[key, value]);
			}, 
			onDbError, onDbSuccess);
    }

    function deleteRow(key){
    	cache[key] = undefined;
    	delete cache[key];
		db.transaction(
			function(tx){
				tx.executeSql("DELETE FROM KEY_VALUE where key=?",[key]);
			}, 
			onDbError, onDbSuccess);
    }

    function getValue(key){
    	return cache[key];
		// db.transaction(
		// 	function(tx){
		// 		tx.executeSql("SELECT * FROM KEY_VALUE where key=?",[key]);
		// 	}, 
		// 	onDbError, onDbGetValueSuccess);
    }

    // TESTs
    // upsertRow("key1","value1");
    // upsertRow("key2","value2");
    // upsertRow("key3","value3");
    // deleteRow("key2");
    // setTimeout(function(){console.debug("getValue " + getValue("key3"))},5000);


    var me = {
		addValue: function(key, value)
		{
			upsertRow(key, value);
		},
		getValue: function(key)
		{
			return getValue(key);
		},
		removeUser: function()
		{
			deleteRow("email");
			deleteRow("password");
		},
		addUser: function(email, password)
		{
			upsertRow("email", email);
			upsertRow("password", password);
		},
		addKeyValue:function(key, value)
		{
			upsertRow(key, value);
		}
	};
	return me;
});