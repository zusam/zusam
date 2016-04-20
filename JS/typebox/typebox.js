function genAjaxLoader() {
	//var loader = '<img src="Assets/ajax-loader.gif"/>';
	var loader = '<div class="ajax-loader"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>';
	return loader;
}

function evaluate(id) {
	var t = $(id)[0];
	Control.filter_out_all(t);
}

function stop(id) {
	$(id).off();
}

function start(id) {

	var t = $(id)[0];
	var tt = $(id);

	tt.off();

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

	// TODO verify and maintain
	// I'm here trying to control the creation of div by the browser
	tt.on("keydown", function(e) {
		// trap the return key being pressed
		if(e.keyCode === 13) {
			if(e.ctrlKey) {
				tt.parent().find('.menu .send').click(); 
			} else {
				//document.execCommand('insertHTML', false, '<br><br>');
				//console.log(e);
				cpos = Control.getCpos(document.activeElement);
				console.log("cpos before :"+cpos);
				if(e.target.innerHTML.trim().match(/\<br\>$/)) {
					typebox.pasteHtmlAtCaret('<br>', false);
				} else {
					console.log(e.target.innerHTML.trim().match(/\<br\>$/));
					console.log(e.target.innerHTML);
					typebox.pasteHtmlAtCaret('<br>', false);
					e.target.innerHTML = e.target.innerHTML+'<br>';
				}
				Control.setCpos(document.activeElement, parseInt(cpos+1));
				cpos = Control.getCpos(document.activeElement);
				console.log("cpos after :"+cpos);
				// prevent the default behaviour of return key pressed
				return false;
			}
		}
		
		// TODO evaluate if necessary, &nbsp; causes word wrap issues

		//if(e.keyCode === 32) {
		//	//document.execCommand('insertHTML', false, '&nbsp;');
		//	//typebox.pasteHtmlAtCaret('  ', false);
		//	//typebox.pasteHtmlAtCaret(' ', false);
		//	// prevent the default behaviour of return key pressed
		//	//return false;
		//}
	});


	// on each keyup we trigger the manipulation of the typebox
	tt.on("keyup", function(e) {

		//exception for ctrl+v which is paste most of the time
		if((!e.ctrlKey && e.keyCode != 17 && !window.ctrl) || (e.keyCode == 86)) {
			
			// is the focus on the typebox ?
			if($(":focus").parent().is(id)) {

				//prevent deselecting when erasing nothing (with backspace) // TODO still needed ? -- yes
				if(e.keyCode == 8 && $(":focus").html() == "") {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				
				// window.typed is the last state of the typebox (if it did not change, do nothing)
				if(window.typed == null || window.typed != $(id).html()) {

					// if there's nothing to do, do nothing
					//console.log(e.target.textContent);
					if(e.target.textContent.match(/https?:\/\/[^\s]+/i) || e.target.textContent.match(/\{\:[A-Za-z0-9]+\:\}/i)) {
					
						// TODO is this line still needed ? (the definition is made at the start)
						t = $(id)[0];
						// we get the cursor position (in order to control it)
						cpos = Control.getCpos(document.activeElement);

						// we decide here what type of filters we use
						if(e.keyCode == 13) {
							//document.execCommand('insertHTML', false, '<br>');
							Control.filter_out_ending(t)
							//return false;
						} else {
							Control.filter_out_search(t);
						}

						if(cpos != false) {
							//re-set the cursor position to the right place
							// TODO still necessary ? (when we pass a line, everything was already evaluated right ?)
							if(e.keyCode == 13) {
								bias = 1;
							} else {
								bias = 0;
							}
							bias = 0;
							Control.setCpos(document.activeElement, parseInt(cpos+bias));
						}
						//save the state of the typeBox
						window.typed = $(id).html();
					}
				}
			}
		}
	});

	$(id).on('click', function(e) {
		if(e.currentTarget == e.target) {
			Control.niceFocus(e.currentTarget);
		}
	});
}

function view() {
	$('.post .dynamicBox').each(function() {
		Control.filter_out_all(this, true);
		$(this).find('*[contenteditable=true]').removeAttr('contenteditable');
		lazyload($(this).closest('.nano-content')[0]);
	});
}

// TODO read and understand.
// ref : http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div/6691294#6691294
// This is a replacement for insertHTML that doesn't exists in ie11
function pasteHtmlAtCaret(html, selectPastedContent) {
	var sel, range;
	if (window.getSelection) {
		// IE9 and non-IE
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			range.deleteContents();

			// Range.createContextualFragment() would be useful here but is
			// only relatively recently standardized and is not supported in
			// some browsers (IE9, for one)
			var el = document.createElement("div");
			el.innerHTML = html;
			var frag = document.createDocumentFragment(), node, lastNode;
			while ( (node = el.firstChild) ) {
				lastNode = frag.appendChild(node);
			}
			var firstNode = frag.firstChild;
			range.insertNode(frag);

			// Preserve the selection
			if (lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				if (selectPastedContent) {
					range.setStartBefore(firstNode);
				} else {
					range.collapse(true);
				}
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	} else if ( (sel = document.selection) && sel.type != "Control") {
		// IE < 9
		var originalRange = sel.createRange();
		originalRange.collapse(true);
		sel.createRange().pasteHTML(html);
		if (selectPastedContent) {
			range = sel.createRange();
			range.setEndPoint("StartToStart", originalRange);
			range.select();
		}
	}
}
