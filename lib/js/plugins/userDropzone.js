// userDropzone — wraps the third-party Dropzone library, which the site must load itself
// (assumed present as the global `Dropzone`; no-ops if absent).
jDOMplugin('userDropzone', function(config){
	return this.each(function(el){
		if ( typeof Dropzone === 'undefined' ){
			return;
		}

		if ( el.data("dropzone-done") ){
			return;
		}

		el.data("dropzone-done", true);

		var dropzone = new Dropzone("#"+el.id, config);

		dropzone.on("error", function(file, errorMessage, xhr){
			JiZy.log.debug('DZ xhr', xhr);
			JiZy.log.debug('DZ file', file);
			JiZy.log.debug('DZ errorMessage', errorMessage);

			dropzone.removeFile(file);

			config.onError(errorMessage.error, file);
		});

		dropzone.on("success", function(file, response){
			JiZy.log.debug('DZ response', response);
			JiZy.log.debug('DZ file', file);

			dropzone.removeFile(file);

			if ( response.exception ){
				config.onError('Une erreur est survenue.', file);
			}
			else if ( response.error ){
				config.onError(response.error, file);
			}
			else {
				config.onSuccess(file, response);
			}
		});

		jDOM(el).on("dropzone.destroy", function(){
			dropzone.destroy();
		});
	});
});
