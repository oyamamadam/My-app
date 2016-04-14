// ( add by 15 21.05.2015
if(typeof define !== 'function') { var define = require('amdefine')(module); }
// add by 15 21.05.2015 )

define(['log', 
        'util/TextUtil',
        'util/DateUtil',
        'util/AppUtil'],
        
function(log, TextUtil, DateUtil, AppUtil)
{
	var cls = {		
		Pic : function (id, name, path, albumName, metadata)
		{
			this.id = id;
			this.name = name;
			this.path = path;
			this.albumName = albumName;
			this.metadata = metadata;
			this.width = undefined;
			this.height = undefined;

			this.addKeyword = function(keyword)
			{
				if(this.metadata == undefined)
					this.metadata = {keywords: []};
				this.metadata.keywords.push(keyword);
			};
			
			this.getUntypedKeywords = function()
			{
				var keys = [];
				var n = (this.metadata && this.metadata.keywords) ? this.metadata.keywords.length : 0;
				for(var i = 0; i < n; i++)
				{
					var keyword = this.metadata.keywords[i];
					if(keyword.indexOf(':') < 0)
						keys.push(keyword);
				}	
				return keys;
			};
			
			this.addTypedKeyword = function(keyword, type)
			{
				if(this.metadata == undefined)
					this.metadata = {keywords:[]};
				if(this.metadata.keywords == undefined)
					this.metadata.keywords = [];
				var newKeyword = type + ":" + keyword;
				var n = this.metadata.keywords.length;
				for(var i = 0; i < n; i++)
				{
					var keyword = this.metadata.keywords[i];
					if(keyword == newKeyword)
						return; // keyword is already there. Do Not Add						
				}	
				this.metadata.keywords.push(newKeyword);
			};
			
			
			this.getJSONObj = function()
			{
				var kys = (this.metadata) ? this.metadata.keywords : [];
				var newKeys = [];
				if(!kys || kys.length == 0) //default
				{
					// do nothing?
					return;
				}
				else// lets make sure its all TYPE:KEYWORD
				{
					var n = kys.length;
					for(var i = 0; i < n; i++)
					{
						var key = kys[i];
						if(key.indexOf(':') < 0)
						{
							continue; // discard
						}	
						else if(key.toUpperCase().indexOf('PLACES') > -1)
						{
							key = TextUtil.searchAndReplaceNoCase(key, 'places', 'locations');
						}	
						//Make sure it has correct casing:
						var pair = key.split(':');
						var typeStr = TextUtil.capitaliseFirstLetter(pair[0]);
						newKeys.push(typeStr + ':' +pair[1]);	
					}	
				}	
				
				newKeys.push("APPDATA:WIDTH|" + this.width);
				newKeys.push("APPDATA:HEIGHT|" + this.height);
								
				var exifDateTimeOriginal = DateUtil.getDateString2(this.metadata.exifDateTimeOriginal);
				var xmpCreateDate = this.metadata.xmpCreateDate;
				var exifDateTimeDigitized = DateUtil.getDateString2(this.metadata.exifDateTimeDigitized);
				var exifDateTime =  DateUtil.getDateString2(this.metadata.exifDateTime);
				
//				console.log("exifDateTimeOriginal: " + exifDateTimeOriginal);
//				console.log("xmpCreateDate: " + xmpCreateDate);
//				console.log("exifDateTimeDigitized: " + exifDateTimeDigitized);
//				console.log("exifDateTime: " + exifDateTime);
//				console.log("INDEXING KEYWORDS: " + newKeys);
//				console.log(this.path);
//				console.log('');
								
				var picIndexDateString = exifDateTimeOriginal;
				
				if(DateUtil.isValidCreationDate(picIndexDateString) == false)
					picIndexDateString = xmpCreateDate;
								
				if(DateUtil.isValidCreationDate(picIndexDateString) == false)
					picIndexDateString = exifDateTimeDigitized;

				if(DateUtil.isValidCreationDate(picIndexDateString) == false)
					picIndexDateString = exifDateTime;
													
				if(DateUtil.isValidCreationDate(picIndexDateString) == false) // default it to 
					picIndexDateString = DateUtil.getDateString(new Date());
											
				var sObj = {"SourceFile" : this.path, 
							"CreateDate" : picIndexDateString,
							//"GPSPosition" : this.metadata.gpsPosition, 
							"Keywords" : newKeys};								
				return sObj;
			};
			
			this.compare = function(pic1,pic2){
				if (pic1.path < pic2.path) return -1;
				else if (pic1.path > pic2.path) return 1;
				return 0;
			};

			this.toString = function() {
                return this.name + " (" + this.path + ") META: " + this.metadata;
            }; 		
		},
		
		TagSuggestion : function(startDate, endDate, dateFormat, keywords, type, uid)
		{
			this.startDate = startDate;
			this.endDate = endDate;
			this.dateFormat = dateFormat;
			this.keywords = keywords;
			this.type = type;
			this.uId = uid;
		},
		
		Metadata : function(keywords, lastModifiedDate, gpsPosition)
		{
			this.keywords = keywords;                 // instance of Array
			this.gpsPosition = gpsPosition;           // instance of cls.GPSPosition object
			this.lastModifiedDate = lastModifiedDate; // instance of Date object

            this.xmpCreateDate = undefined;           // "2014-01-24T14:32:10-05:00"
            this.xmpMetadataDate = undefined;         // "2014-01-24T14:32:10-05:00"
            this.exifDateTimeOriginal = undefined;    // "2014:03:16 10:26:48"
            this.exifDateTimeDigitized = undefined;   // "2014:03:16 10:26:48"
            this.exifDateTime = undefined;	          // "2014:03:16 10:26:48"
			
			this.toString = function() {
				return "keywords=" + this.keywords + 
					   " lastModifiedDate=" + this.lastModifiedDate + 
					   " gpsPosition=" + this.gpsPosition;
			};            
		},

		GPSPosition: function(latitude, longitude)
		{
			this.latitude = latitude;
			this.longitude = longitude;
			this.toString = function() {
				return "[" + this.latitude + ";" + this.longitude + "]";
			}; 			
		},
		
		PicInfo : function(rawItem)
		{
			this.uid = AppUtil.UIID(); // a unique Id that identifies this picture info. 
			this.id = rawItem.id;  // bWlrZUdsbzc1MjBjOGY4NDQ5YjYyOTRiNQ==
			this.create_date = rawItem.create_date;// 2009-11-22T22:13:16
			this.creationDate = DateUtil.parse(rawItem.create_date);
			this.fullYear = this.creationDate.getFullYear();
			this.month = this.creationDate.getMonth();
			this.dayOfMonth = this.creationDate.getDate();
			this.dateLabel = this.fullYear + '_' + this.month + '_' + this.dayOfMonth;
			this.creationTime = this.creationDate.getTime();
			this.device_id = rawItem.device_id;  //520c8f8449b6294b
			this.gps_position = rawItem.gps_position;  // ???????????	
			this.source_file = rawItem.source_file; // file:///storage/emulated/0/Pictures/20091122-20091122-DSC_2057.jpg
			this.user_token = rawItem.user_token; // mikeGlo7	
			this.isDirty = false;
			this.isFav = false;
			this.width = undefined;
			this.height = undefined;
			this.orgWidth = undefined;
			this.orgHeight = undefined;
			this.vpWidth = undefined;
			this.vpIdx = undefined;
			this.vpPrevIdx = undefined;
			this.vpNextIdx = undefined;
			this.selected = false;
			this.gpWidth = undefined;
			this.gpHeight = undefined;
			this.trashWidth = undefined;
			this.trashHeight = undefined;
			this.isDeleted = false;
				
			this.update = function(rawItem)
			{			
				var changed = false;
				if(this.keyword_pairs != rawItem.keyword_pairs || this.keywords != rawItem.keywords || this.root_categories != rawItem.root_categories)
					changed = true;				
				this.changed = changed;
				this.keyword_pairs = []; // Entities:Jack, Entities:dogs, Entities:pets, People:family
				this.keywords = []; // Jack, dogs, pets, family
				this.root_categories = []; // Entities, People		
				this.isDeleted = false;
				var i = 0;
				// ( add by 15 21.05.2015
				//var n = rawItem.keyword_pairs.length;
				var n = (rawItem.keyword_pairs && rawItem.keyword_pairs.length ? rawItem.keyword_pairs.length : 0);
				// add by 15 21.05.2015 )
				for(i = 0; i < n; i++)
				{
					var pair = rawItem.keyword_pairs[i];
					var pairType = TextUtil.getKeywordType(pair);
					if(pairType == "APPDATA")
					{
						var pairVal = TextUtil.getKeywordVal(pair);
						var subType = TextUtil.getSubKeywordType(pairVal);
						var subValue = TextUtil.getSubKeywordVal(pairVal);
						//console.log(pairVal);
						if(subType == "trashed")
							console.log(subValue + " -> " + subType);
						switch(subType)
						{
							case "WIDTH": this.width = this.orgWidth = subValue; break;
							case "HEIGHT": this.height = this.orgHeight = subValue; break;
							case "trashed": this.isDeleted = true; break;
						}
					}	
					else
					{
						this.keyword_pairs.push(pair);
					}	
				}	
				// ( add by 15 21.05.2015
				//n = rawItem.keywords.length;
				n = (rawItem.keywords && rawItem.keywords.length ? rawItem.keywords.length : 0);
				// add by 15 21.05.2015 )
				for(i = 0; i < n; i++)
				{
					var pair = rawItem.keywords[i];
					var pairType = TextUtil.getKeywordType(pair);
					if(pairType != "APPDATA")
						this.keywords.push(pair);
				}
				// ( add by 15 21.05.2015
				//n = rawItem.root_categories.length;
				n = (rawItem.root_categories && rawItem.root_categories.length ? rawItem.root_categories.length : 0);
				// add by 15 21.05.2015 )
				for(i = 0; i < n; i++)
				{
					var pair = rawItem.root_categories[i];
					var pairType = TextUtil.getKeywordType(pair);
					if(pairType != "APPDATA")
						this.root_categories.push(pair);
				}
				//console.log("isDeleted = " + isDeleted);
			};
		},
		
		RefinerItem : function(label, level, displayOrder, type)
		{
			this.uid = AppUtil.UIID();
			this.level = level;
			this.label = label;
			this.charLb = "";
			this.displayOrder = displayOrder;											
			this.dateTime = 0; // most recent picInfo Date Time. 
			this.type = type;
					
			this.count = 0;	
			
			this.children = {}; //HASH
			this.stacks = {}; //HASH
			this.picIds = []; //LIST
			
			this.setTime = function(timeInt)
			{
				if(timeInt > this.dateTime)
					this.dateTime = timeInt;
			};
		},

		RefinerItemStack : function(label, type)
		{
			this.uid = AppUtil.UIID();		
			this.label = label;
			this.count = 0;
			this.eventsCount = 0;
			this.placesCount = 0;
			this.peopleCount = 0;
			this.entitiesCount = 0;
			this.picIds = [];
			this.type = type.toLowerCase();
		},
		StackItem : function(stackLb, count, type, stackType, picIds)
		{
			this.uid = AppUtil.UIID();		
			this.label = stackLb;
			this.count = count;
			this.type = type;
			this.stackType = stackType;
			this.picIds = picIds;
		}
	};
	
	return cls;
});