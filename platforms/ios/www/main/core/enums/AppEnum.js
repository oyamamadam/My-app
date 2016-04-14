if (typeof define !== 'function') { var define = require('amdefine')(module) }

define({
	appId: "NwuVecofpIv1X6U4TFGrwJZp7HdpZ4ciQcIWpo9c",
	jsId: "qBpxX9BEaq8wfPyz6hvgmZbtRwHKcGGKfBfxVT9P",
	emailTxt: "email",
	passwordTxt: "password",
	deviceIDTxt: "deviceID",
	months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
	events: "events",
	places: "locations",
	placesTxt: "places",
	people: "people",
	entities: "entities",
	favorites: "favorites",
	APPDATA: "APPDATA",
	TRASHED: "trashed",
	stared: "*",
	previewState: "isPreview",
	taggingState : "isTagging",
	gridState: "isGrid",
	shareState : "isSharing",
	trashState : "isTrash",
	helpState : "isHelp",
	ENTITY_NAME: "ENTITY_NAME",
	FACEBOOK: "FACEBOOK",
    SHARE:    "SHARE",
	TWITTER: "TWITTER",
	EMAIL: "EMAIL",
	SMS: "SMS",
	API_URL: "http://bibestest.dev.o19s.com/", 
	
	getAllTypes: function()
	{
		return [this.events, this.places, this.people, this.entities, this.favorites];
	}

});