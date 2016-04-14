define(['log'],
function(log)
{
	var comp = 
	{
		open: {
			events: true,
			locations: false,
			people: false,
			entities: false
		},
		selectedUID: 0,
		selectedDataId: undefined,
		selectedTerm: "*",
		isTopLevel: false,
		canClose: function(id)
		{
			var openCount = 0;
			for (var property in this.open) 
			{
			    var isOpen = this.open[property];
			    if(isOpen)
			    	openCount++;
			}
			if(this.open[id] == true && openCount == 1)
				return false;
			return true;
		}
	};
	return comp;
});