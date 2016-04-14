define(['log',
        "ich",
        'util/AppUtil',
        'adptr/ServiceAdaptor',
        "text!content/ContentPage.html",
        "css!content/ContentPage",
        "header/Header",
        "mainPane/MainPane",
        "fav/Fav",
        "bin/Bin",
        "tile/Tile",
        "setting/Setting",
        'util/LayoutUtil',
        'phonegap',
        'model',
        'fs/FullScreen',
        'typeselection/TypeSel',
        "share/SharePopup",
        'wizard/Wizard',
        'wizard/IndexingHelper'],

function(log, ich, AppUtil, ServiceAdaptor, contentHTML, contentCSS, header, mainPane, fav, bin, tile,
		setting, LayoutUtil, phonegap, model, FullScreen, TypeSel, SharePopup, wizard, IndexingHelper)
{
	function addListeners()
	{
		$(document).on("navEvent", onDeepNavEvent);
	    $(document).bind("showContent", onShowContent);
	}

	function onUserHasNoData()
	{
		console.log("onUserHasNoData!!!!!!!!!!!!");
		if(phonegap && phonegap.deviceInfo == undefined)
		{
			//IN BROWSER
            //alert("USER CREATION NOT SUPPORTED!");
			$("#loginPage").hide();
			//AppUtil.showLoader(false);
			wizard.init();
			wizard.showPage();
		}
		else
		{
            alert("invoking wizard");
			$("#loginPage").hide();
			wizard.init();
			wizard.showPage();
			phonegap.getAllPhotos(IndexingHelper.urlsLoaded);
		}
	}

	function onUserHasNoPictures()
	{
		$("#noDataDiv").hide();
		$("#noFilesDiv").show();
	}

	function onDeepNavEvent(e)
	{
		var subContentID = e.subPageID;

		if(subContentID == "#fav")
			fav.setView();

		$("#contentBody > div").hide();
		$("#contentBody > " + subContentID).show();
	}

	function onContentReady()
	{
		if(model.indexingNeeded)
		{
			model.searchTerm = "*";
			onUserHasNoData();
		}
		else
		{
			header.invokeDefaultSearch();
		}
	}

	function onShowContent()
	{
		$('#wizardPage').hide();
		$('#loginPage').hide();
		$('#contentPage').fadeIn(200);
		AppUtil.showLoader(false);
		LayoutUtil.validateContentPageSize();
	}

	var contentPage = {
		init:function()
		{
			AppUtil.showLoader(true);
			AppUtil.applyIchTemplate('contentHTML', contentHTML, $('#contentPage'));
			addListeners();
			header.init();
			mainPane.init();
			onContentReady();
			FullScreen.init();
			TypeSel.init();
			SharePopup.init();
			fav.init();
			//AppUtil.showLoader(false);
		}
	};
	return contentPage;
});