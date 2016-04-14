// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['util/IchUtil',
        'util/AppUtil',
        "text!mainPane/tag/TagItem.html",
        "mainPane/tag/TagSuggestions",
        'enum/AppEnum',
        "m/ModelAssist",
        "iScroll5",
        "model",
        'cache',
        'util/TextUtil',
        "mainPane/view_pane/ViewPaneHelper"],

function(IchUtil, AppUtil, TagItemHTML, TagSuggestions, AppEnum, ModelAssist, iScroll, model, cache, TextUtil, ViewPaneHelper)
{
	// ( add by 15 21.05.2015
	if(typeof iScroll === 'undefined') iScroll = window.IScroll;
	// add by 15 21.05.2015 )

	var tagScroll = undefined;
	var recentTags = undefined;
	var RECENT_TAGS = "RECENT_TAGS";
	var closeEventPendding = false;

	function validateScroll()
	{
		setTimeout(function()
		{
			tagScroll.refresh();
		}, 500);

		if(tagScroll == undefined)
			tagScroll = new iScroll("#mainPane #tag #tagScrollWrapper",{ scrollX: false, scrollY: true, mouseWheel: false, scrollbars: 'custom'});
		tagScroll.refresh();
	}

	function showTags()
	{
		var $tagGroup = $("#mainPane #tag #tagScrollWrapper");
		var $tagSugGroup = $("#tagSuggestionDiv .tagBody", $tagGroup);
		var $tagAllGroup = $("#allTagGroup .tagBody", $tagGroup);
		var $tagRecentGroup = $("#tagRecentDiv .tagBody", $tagGroup);
		$(".tagBody", $tagGroup).empty();

		//SUGGESTIONS:
		addTagSuggestions(TagSuggestions.getTypedSuggestions(AppEnum.events), $tagSugGroup);
		addTagSuggestions(TagSuggestions.getTypedSuggestions(AppEnum.places), $tagSugGroup);
		addTagSuggestions(TagSuggestions.getTypedSuggestions(AppEnum.people), $tagSugGroup);
		addTagSuggestions(TagSuggestions.getTypedSuggestions(AppEnum.entities), $tagSugGroup);
		addTagSuggestions(TagSuggestions.getTypedSuggestions(AppEnum.favorites), $tagSugGroup);

		//Recent Tags:
		var i = 0;
		var n = recentTags.length;
		var recentHash = {};
		for(i = 0; i < n; i++)
		{
			var pair = recentTags[i];
			var piarVal = TextUtil.getKeywordVal(pair);
			var piarType = TextUtil.getKeywordType(pair);
			var keyObj = ModelAssist.getKeywordOnName(piarVal);
			if(keyObj == undefined)
			{
				ModelAssist.addKeywrod(piarVal, piarType);
				keyObj = ModelAssist.getKeywordOnName(piarVal);
				keyObj.newCls = "";
			}
			recentHash[piarVal] = piarVal;
			addTagToGroup(keyObj, $tagRecentGroup);
		}

		var keywords = ModelAssist.getKeywordList();
		n = (keywords) ? keywords.length : 0;
		for(i = 0; i < n; i++)
		{
			var keyObj = keywords[i];
			if(recentHash[keyObj.label] == undefined)
				addTagToGroup(keyObj, $tagAllGroup);
		}
	}

	function addTagSuggestions(suggestions, tagGroup)
	{
		var n = (suggestions) ? suggestions.length : 0;
		for(var i = 0; i < n; i++)
		{
			var keyObj = suggestions[i];
			addTagToGroup(keyObj, tagGroup, true);
		}
	}

	function addTagToGroup(keywordObj, tagGroup, isSuggestion)
	{
		if(keywordObj && keywordObj.label == AppEnum.stared)
			return;

		var fontSize = 10 + keywordObj.count;
		if(fontSize > 18)
			fontSize = 18;
		if(isSuggestion)
			fontSize = 14;
		keywordObj.fontSize = fontSize;
		IchUtil.appendIchTemplate('noname', TagItemHTML, tagGroup, keywordObj);
		keywordObj.newCls = "";
	}

	function tagClickHandle($tag)
	{
		var type = $tag.attr('type');
		var keyword = $tag.attr('val');
		var newId = $tag.attr("id");
		var items = $("#mainPane #tag #tagScrollWrapper .tagBody .tagItemDiv.hl");
		var hlItemId = items.attr("id");

		if(hlItemId == newId)
		{
			$tag.removeClass("hl");
			removeTagsFromSelectedVPItems(keyword, type);
		}
		else
		{
			items.removeClass("hl");
			$tag.addClass("hl");
			if(type == undefined)
				showGetTypePopup(keyword);
			else
				addTagsToSelectedVPItems(keyword, type);
		}
	}

	function showGetTypePopup(keyword)
	{
		$.event.trigger({
			  type:"getTagType",
			  keyword: keyword,
			  callBack: onTagTypeSelected
		});
	}

	function onTagTypeSelected(keyword, newType)
	{
		comp.isVisible = true;
		$('#mainPane #tag #tagInput').val('');

		recentTags.unshift(newType + ":" + keyword);
		if(recentTags.length > 5)
			recentTags.pop();
		var recentTagsStr = recentTags.toString();
		cache.addKeyValue(RECENT_TAGS, recentTagsStr);

		ModelAssist.addKeywrod(keyword, newType);
		addTagsToSelectedVPItems(keyword, newType);

		if(comp.savePending)
		{
			comp.saveDirtyState();
			closeEventPendding = true;
		}
		comp.setView();
	}

	function addTagsToSelectedVPItems(keyword, type)
	{
		var selectedVPItems = ViewPaneHelper.getSelectedItems();
		var n = (selectedVPItems) ? selectedVPItems.length : 0;
		for(var i = 0; i < n; i++)
		{
			var vpItem = selectedVPItems[i];
			var picID = vpItem.id;
			ModelAssist.addKeywordToPicInfo(picID, keyword, type);
		}
		dispatchTagEvent("updateViewPaneAfterTagChange");
	}

	function removeTagsFromSelectedVPItems(keyword, type)
	{
		var selectedVPItems = ViewPaneHelper.getSelectedItems();
		var n = (selectedVPItems) ? selectedVPItems.length : 0;
		for(var i = 0; i < n; i++)
		{
			var vpItem = selectedVPItems[i];
			var picID = vpItem.id;
			ModelAssist.removeKeywordFromPicInfo(picID, keyword, type);
		}
		dispatchTagEvent("updateViewPaneAfterTagChange");
	}

	function dispatchTagEvent(evtType)
	{
		setTimeout(function()
		{
			$.event.trigger(evtType);
		}, 10);
	}

	var comp =
	{
		isVisible:false,
		savePending:false,
		setView: function()
		{
			if(comp.isVisible)
			{
				recentTags = cache.getValue(RECENT_TAGS);
				if(recentTags == undefined || recentTags == "")
					recentTags = [];
				else
					recentTags = recentTags.split(",");
				showTags();
				validateScroll();
			}
		},
		onTagClick : function ()
		{
			tagClickHandle($(this));
		},
		onAddClick : function ()
		{
			var newKeyword = $('#mainPane #tag #tagInput').val();
			// ( add by 15 21.05.2015
			//showGetTypePopup(newKeyword);
			//cordova.plugins.Keyboard.close();

			if(typeof newKeyword !== 'string' || newKeyword.trim().length == 0) return;

			// android, ios and ets
			if((typeof process == "undefined" || !process.versions || !process.versions.node))
			{
				cordova.plugins.Keyboard.close();
			}
			// add by 15 21.05.2015 )
		},
		saveDirtyState : function()
		{
			var newKeyword = $('#mainPane #tag #tagInput').val();
			if(newKeyword && newKeyword.length > 0)
			{
				comp.savePending = true;
				comp.onAddClick();
			}
			else
			{
				comp.savePending = false;
				model.saveDirtyState();
				closeEventPendding = true;
			}
		},
		cancelDirtyState : function()
		{
			model.search("*");
			closeEventPendding = true;
		},
		onTagSwipe : function()
		{
			var thiz = $(this);
			var keyword = thiz.attr("val");
			var type = thiz.attr("type");
			console.log("SWIPE ON: " + keyword);
			ModelAssist.removeKeywordFromAll(keyword, type);
			removeTagsFromSelectedVPItems(keyword, type);
			comp.isVisible = true;
			comp.setView();
		},
		onImgLoaded : function()
		{
			if(closeEventPendding)
			{
				closeEventPendding = false;
				dispatchTagEvent("externalTagToggle");
			}
		}
	};





















	var tagVisible = false;
	var viewSet = false;
	var activeItems = {};
	var visibleTags = {};

	function addListeners()
	{
		AppUtil.addTouchEvent('#tag .typeItemDiv', onTypeItemClick);
		AppUtil.addTouchEvent('#tag #addIcon', onAddTag);
		AppUtil.addTouchEvent('#tag #tagDiv .tagItemDiv .tagItemDiv', onTagItemClick);
	}

	function onTagItemClick()
	{
		var $tagItem = $(this);
		var bgClass = comp.getSelectedType() + 'BGColor';
		if($tagItem.hasClass("tagSelected"))
		{
			$tagItem.removeClass("tagSelected");
			$tagItem.removeClass(bgClass);
		}
		else
		{
			$tagItem.addClass("tagSelected");
			$tagItem.addClass(bgClass);
		}
	}

	function onAddTag()
	{
		var tagVal = $("#tagInput").val();
		var type = $(".typeSelected", "#tagDiv").attr('type');
		prependTag(type, tagVal);
		$("#tagInput").val("");
	}

	function onTypeItemClick()
	{
		$(".typeItemDiv").removeClass("typeSelected");
		$(this).addClass("typeSelected");
		var type = $(this).attr("type");
		setTags(type);
	}

	function setTags(type)
	{
		$("#tagsBody").empty();
		var tags = ModelHelper.getTypedKeywords(type);
		var tagSuggestions = TagSuggestions.getTypedSuggestions(type, activeItems);
		visibleTags = {};
		addTags(tags);
		addTags(tagSuggestions);
	}

	function addTags(tags)
	{
		for (var tag in tags)
		{
			var tagObj = tags[tag];
			visibleTags[tag] = tagObj;
			IchUtil.prependIchTemplate('TagItemHTML', TagItemHTML, $('#tagsBody'), tagObj);
		};
	}

	function prependTag(type, tag)
	{
		var typeObj = visibleTags[tag];
		if(tag.length == 0 || typeObj)
			return;
		var uId = AppUtil.UIID();
		var tagObj = {label: tag, tagId: uId, count: 1};
		visibleTags[tag] = tagObj;
		IchUtil.prependIchTemplate('TagItemHTML', TagItemHTML, $('#tagsBody'), tagObj);
	}

	return comp;
});