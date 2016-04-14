define(['util/AppUtil',
        'util/IchUtil',
        "text!header/Header.html",
        "css!header/Header",
        "header/SyncHelper",
        "model",
        "header/SuggestionBoxHelper",
        "m/AppModel"],

function(AppUtil, IchUtil, headerHTML, headerCSS, SyncHelper, model, SuggestionBoxHelper, AppModel)
{
	var lastSearchTerm = "";
	var keyBox = undefined;

	function addListeners()
	{
		$("#header").bind( "keyup", onSearchTextChange);
		$("#searchInput", "#header").bind( "focusin", onFocusIn);
		AppUtil.addTouchEvent('#header .iconWrap', onHeaderIconClick);
		AppUtil.addTouchEvent('#header #searchIconDiv', onSearch);
		AppUtil.addTouchEvent('#header #searchXIconDiv', onReset);
		AppUtil.addTouchEvent('#contentPage #header #keywordsBox #suggestionBox .suggestItem', onSuggestionItemClick);
		AppUtil.addTouchEvent(document, onDocClick);
        AppUtil.addSubmitEvent('#header form#searchForm', onSearch);

        //Make return key trigger search
//        AppUtil.addSubmitEvent('#searchButtonForm', onSearch);

		$(document).on("externalTagToggle", onExternalTagToggle);
		$(document).on("headerEvent", onHeaderEvent);
		keyBox = $("#contentPage #header #keywordsBox");
	}

	function onExternalTagToggle()
	{
		onHeaderIconClick(null);
	}

	function onHeaderEvent(e, data)
	{
		var navId = data.navId;
		headerOptionChangeHandler(navId);
	}

	function onSuggestionItemClick()
	{
		var $this = $(this);
		$("#searchInput", "#header").val($this.attr("term"));
		onSearch();
	}

	function onDocClick()
	{
		keyBox.css("visibility", "hidden");
	}

	function onFocusOut()
	{
        console.log("onFocusOut");
		onSearch();
		// ( add by 15 21.05.2015
		//cordova.plugins.Keyboard.close();
		// android, ios and ets
		if((typeof process == "undefined" || !process.versions || !process.versions.node))
		{
			cordova.plugins.Keyboard.close();
		}
		// add by 15 21.05.2015 )
	}

	function onFocusIn()
	{
		$("#searchInput", "#header").val("");
		onSearch();
		$('#header #searchXIconDiv').hide();
		$('#header #searchIconDiv').show();
	}

	function onSearch()
	{
		var sTxt = $("#searchInput", "#header").val();
		if(sTxt && sTxt.length > 0)
		{
			$('#header #searchXIconDiv').show();
			$('#header #searchIconDiv').hide();
			// ( add by 15 21.05.2015
			//cordova.plugins.Keyboard.close();
			// android, ios and ets
			if((typeof process == "undefined" || !process.versions || !process.versions.node))
			{
				cordova.plugins.Keyboard.close();
			}
			// add by 15 21.05.2015 )
		}
		else
		{
			sTxt = "*";
		}
		$("#contentPage #header #keywordsBox").css("visibility", "hidden");
		model.search(sTxt);
		lastSearchTerm = sTxt;
		AppUtil.showLoader(true);
	}

	function onReset()
	{
		onFocusIn();
	}

	function onSearchTextChange(event, ui)
	{
		var sTxt = $("#searchInput", "#header").val();
		SuggestionBoxHelper.onSearchTextChange(sTxt);
	}

	function onHeaderIconClick(e)
	{
		var targetID = (e) ? e.currentTarget.id : undefined;
		headerOptionChangeHandler(targetID, e);
	}

	function headerOptionChangeHandler(targetID)
	{
		var hlId = $("#header .iconWrap.hl").attr("id");
		$("*", "#header .iconWrap").removeClass("hl");
		$(".iconWrap", "#header").removeClass("hl");
		if(targetID != hlId)
		{
			var $navIcon = $("#" + targetID, "#header");
			$navIcon.addClass("hl");
			$("*", $navIcon).addClass("hl");
		}
		hlId = $("#header .iconWrap.hl").attr("id");
		AppModel.headerSelectionChange(hlId);
		if(hlId == "syncNav")
			SyncHelper.startSyncProcess();
       //cordova.plugins.Keyboard.close();
	}

	function onHomeClick()
	{
		dispatchNavEvent("#mainPane");
		$.event.trigger("defaultStateRequest");
	}

	function onIndexClick()
	{
		$.event.trigger("syncRequest");
	}

	function dispatchNavEvent(contentSubPageID)
	{
		$.event.trigger({type: "navEvent", subPageID: contentSubPageID});
	}

	function dispatchDeepNavEvent(contentSubPageID, subSectionID)
	{
		dispatchNavEvent(contentSubPageID);
		$.event.trigger({type: "deepNavEvent", subPageID: contentSubPageID, sectionID: subSectionID});
	}

	function dispatchSearchNotification(sTerm)
	{
		$.event.trigger("refinerChange", {type: "search", term: sTerm});
	}

	function dispatchLogoutEvent(contentSubPageID)
	{
		$.event.trigger({type: "logoutEvent", from: "logout Click!"});
	}

	var comp = {
		init:function()
		{
			IchUtil.applyIchTemplate('headerHTML', headerHTML, $('#header'));
			addListeners();
			SyncHelper.init();
		},
		invokeDefaultSearch:function()
		{
			model.search("*");
		},
		externalOptionSelection : function(optId)
		{
			headerOptionChangeHandler(optId);
		},
		getLastSearchTerm : function()
		{
			return lastSearchTerm;
		}
	};
	return comp;
});