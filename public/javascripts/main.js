$( document ).ready(function() {
    $('#inputBody').summernote({
        height: "300px",
        styleWithSpan: false
    });
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