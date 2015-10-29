function stop(id) {
	$(id).off();
}

function start(id) {

	var t = $(id)[0];
	var tt = $(id);

	tt.off();

	// causes bug in firefox with the first charcter. Is it really needed ?
	//Control.filter_out_all(t);

	// track pasting events
	tt.on("paste", function(e) {
		e.preventDefault();
		e.stopPropagation();

		// solution from http://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
		var text = '';
		var that = $(this);

		if (e.clipboardData)
		text = e.clipboardData.getData('text/plain');
		else if (window.clipboardData)
		text = window.clipboardData.getData('Text');
		else if (e.originalEvent.clipboardData)
		text = $('<div></div>').text(e.originalEvent.clipboardData.getData('text'));

		if (document.queryCommandSupported('insertText')) {
			document.execCommand('insertHTML', false, $(text).html());
			t = $(id)[0];
			Control.filter_out_all(t);
			return false;
		} else { // IE > 7
			that.find('*').each(function () {
				$(this).addClass('within');
			});
		setTimeout(function () {
				// nochmal alle durchlaufen
				that.find('*').each(function () {
						// wenn das element keine klasse 'within' hat, dann unwrap
						$(this).not('.within').contents().unwrap();
						});
				}, 1);
		}
		return false;
	});

	//lance les fonctions de recherche à chaque pression du clavier si le focus est dans la typeBox
	tt.on("keyup", function(e) {
		//exception for ctrl+v which is paste most of the time
		if((e.ctrlKey || e.keyCode == 17 || window.ctrl) && (e.keyCode != 86)) {
		} else {
			if($(":focus").parent().is(id)) {
				//prevent deselecting
				if(e.keyCode == 8 && $(":focus").html() == "") {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				if(window.typed == null || window.typed != $(id).html()) {
					t = $(id)[0];
					cpos = Control.getCpos(document.activeElement);
					if(e.keyCode == 13) {
						Control.filter_out_ending(t)
					} else {
							Control.filter_out_search(t);
					}
					if(cpos != false) {
						//re-set the cursor position to the right place
						if(e.keyCode == 13) {
							bias = 1;
						} else {
							bias = 0;
						}
						Control.setCpos(document.activeElement, parseInt(cpos+bias));
					}
					//save the state of the typeBox
					window.typed = $(id).html();
				}
			}
		}
	});

	$(id).on('click', function(e) {
		Control.niceFocus(e.target);
	});
}

function view() {
	$('.post .dynamicBox').each(function() {
		Control.filter_out_all(this, true);
		$(this).find('*[contenteditable=true]').removeAttr('contenteditable');
	});
}
