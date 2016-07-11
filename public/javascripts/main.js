$( document ).ready(function() {
    $('.ui.dropdown').dropdown();
    $('#inputTags').selectize({
    	delimiter: ',',
    	persist: false,
    	create: function(input) {
        	return {
            	value: input,
            	text: input
            }
        }
    });
});