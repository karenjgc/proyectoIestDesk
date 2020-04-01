export class FroalaOptions {
    private key: string = '';

    public opciones: Object = {
        key: this.key,
        charCounterCount: true,
        toolbarSticky: false,
        language: 'es',
		linkAlwaysBlank: true,
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
        toolbarButtons: ['bold', 'italic', 'underline', 'align', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'quote', 'formatOL', 'formatUL', 'insertTable', 'undo', 'redo'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'emoticons', 'entities', 'fontFamily', 'fontSize', 'fullscreen', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quote', 'table', 'url', 'wordPaste' ],
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesBasico: Object = {
        key: this.key,
        height: 120,
        width: 230,
        charCounterCount: true,
        toolbarSticky: false,
        language: 'es',
		pastePlain: true,
		linkAlwaysBlank: true,
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
        toolbarButtons: ['bold', 'italic', 'underline'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'entities', 'fullscreen', 'inlineStyle', 'lineBreaker' ],
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesSimple: Object = {
        key: this.key,
        charCounterCount: true,
        toolbarSticky: false,
        language: 'es',
		pastePlain: true,
		linkAlwaysBlank: true,
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
        toolbarButtons: ['bold', 'italic', 'underline'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'entities', 'fullscreen', 'inlineStyle', 'lineBreaker', 'wordPaste' ],
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesEmojis: Object = {
        key: this.key,
        charCounterCount: true,
        toolbarSticky: false,
        pastePlain: true,
        language: 'es',
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
		linkAlwaysBlank: true,
        toolbarButtons: ['bold', 'italic', 'underline', 'align', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'quote', 'formatOL', 'formatUL', 'insertTable', /*'emoticons',*/ 'undo', 'redo'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'emoticons', 'entities', 'fontFamily', 'fontSize', 'fullscreen', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quote', 'table', 'url', 'emoticons' ],
        emoticonsUseImage: false,
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesForo: Object = {
        key: this.key,
        charCounterCount: true,
        autofocus: true,
        toolbarSticky: false,
        pastePlain: true,
        imageSplitHTML: false,
        language: 'es',
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
		linkAlwaysBlank: true,
        toolbarButtons: ['bold', 'italic', 'underline', 'align', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'quote', 'formatOL', 'formatUL', /*'emoticons',*/ 'undo', 'redo'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'emoticons', 'entities', 'fontFamily', 'fontSize', 'fullscreen', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quote', 'table', 'url', 'emoticons', 'wordPaste' ],
        emoticonsUseImage: false,
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					console.log(dropEvent);
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesCompleto: Object = {
        key: this.key,
        charCounterCount: true,
        autofocus: true,
        toolbarSticky: false,
        //imageUploadURL: 'https://sie.iest.edu.mx/api/idesk/archivos_editor.php',
        //imageUploadMethod: 'POST',
        language: 'es',
		pastePlain: true,
		linkAlwaysBlank: true,
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
        toolbarButtons: ['bold', 'italic', 'underline', 'align', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'quote', 'formatOL', 'formatUL', /*'emoticons', */'insertLink', /*'insertImage',*/ 'undo', 'redo'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'entities', 'fontFamily', 'fontSize', 'fullscreen', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quote', 'table', 'url', 'emoticons', 'wordPaste' ],
        emoticonsUseImage: false,
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };

    public opcionesTexto: Object = {
        key: this.key,
        charCounterCount: true,
        toolbarSticky: false,
        language: 'es',
		imageUpload: false,
		imagePaste: false,
		pasteDeniedTags: ['img'],
		linkAlwaysBlank: true,
        toolbarButtons: ['bold', 'italic', 'underline', 'align', 'fontFamily', 'fontSize', 'color', 'paragraphFormat', 'quote','specialCharacters', 'formatOL', 'formatUL', 'insertTable', 'embedly', 'undo', 'redo'],
        pluginsEnabled: [ 'align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'emoticons', 'entities', 'fontFamily', 'fontSize', 'fullscreen', 'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quote', 'specialCharacters', 'table', 'url', 'wordPaste', 'embedly'],
		events: {
			'froalaEditor.initialized': function (e, editor) {
				let evento = e;
				editor.events.on('drop', function (dropEvent) {
					dropEvent.preventDefault();
					dropEvent.stopPropagation();
				}),
				editor.events.on('blur', function (blurEvt) {
					let t = document.createElement('div');
					t.innerHTML = this.html.get();
					let trimmedText = t.innerText.trim();
					if (!trimmedText) {
						this.html.set('');
						this.events.trigger('charCounter.update');
					}
				});
				
            }
		}
    };
}