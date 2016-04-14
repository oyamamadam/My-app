// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(["text!typeselection/TypeSel.html",
        "css!typeselection/TypeSel",
        'util/IchUtil',
        'util/AppUtil'],

function(TypeHTML, TypeCSS, IchUtil, AppUtil)
{
	var isVisible = false;
	var callBack = undefined;
	var keyword = undefined;

	function addListeners()
	{
		$(document).on("getTagType", toggleView);
		AppUtil.addTouchEvent('#typePage #typeScreen .link', toggleView);
		AppUtil.addTouchEvent('#typePage #typeScreen .typeItem', onTypeSelected);
	}

	function onTypeSelected()
	{
		var newType = $(this).attr('type');
		callBack(keyword, newType);
		toggleView();
	}

	function toggleView(e)
	{
		if(e &&  e.keyword)
		{
			callBack = e.callBack;
			keyword = e.keyword;
			$('#typePage').empty();
			IchUtil.applyIchTemplate('noname', TypeHTML, $('#typePage'), e);
		}

		if(isVisible)
			$('#typePage').fadeOut(200);
		else
			$('#typePage').fadeIn(200);
		isVisible = !isVisible;
	}

	var typePage =
	{
		init:function()
		{
			addListeners();
		}
	};
	return typePage;
});