if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['ich'],
function(ich)
{	
	var ichUtil = {
		appendIchTemplate: function(templateName, templateHTML, divForTemplate, templateData)
		{
			ich.addTemplate(templateName, templateHTML);			
			var template = $(ich[templateName](templateData));		
			$(divForTemplate).append(template).trigger("create");		
			ich.clearAll(); // remove template from memory
		},
		prependIchTemplate: function(templateName, templateHTML, divForTemplate, templateData)
		{
			ich.addTemplate(templateName, templateHTML);			
			var template = $(ich[templateName](templateData));		
			$(divForTemplate).prepend(template).trigger("create");		
			ich.clearAll(); // remove template from memory
		},
		applyIchTemplate: function(templateName, templateHTML, divForTemplate, templateData)
		{
			ich.addTemplate(templateName, templateHTML);			
			var template = $(ich[templateName](templateData));		
			$(divForTemplate).html(template).trigger("create");		
			ich.clearAll(); // remove template from memory
		},		
		applyAfter: function(templateName, templateHTML, afterDivId, templateData)
		{
			ich.addTemplate(templateName, templateHTML);			
			var template = $(ich[templateName](templateData));		
			$("#" + afterDivId + ':after').append(template).trigger("create");		
			ich.clearAll(); // remove template from memory
		}		
	};
	return ichUtil;
});