function evaluate(id) {
	var t = $(id)[0];
	filter_out_all(t);
	console.log('----evaluate----');
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

		if(e.clipboardData) {
			text = e.clipboardData.getData('text/plain');
		} else { 
			if(window.clipboardData) {
				text = window.clipboardData.getData('Text');
			} else { 
				if(e.originalEvent.clipboardData) {
					text = $('<div></div>').text(e.originalEvent.clipboardData.getData('text'));
				}
			}
		}
		typebox.pasteHtmlAtCaret($(text).html(), false);
		// following line should not work in ie11 (replaced with the line before this one)
		//document.execCommand('insertHTML', false, $(text).html());
		filter_out_all(t, false, false);
		console.log('----paste----');
		return false;
	});

	// TODO verify and maintain
	// I'm here trying to control the creation of div by the browser
	tt.on("keydown", function(e) {
		// trap the return key being pressed
		if(e.keyCode === 13) {
			e.preventDefault()
			e.stopPropagation();
			if(e.ctrlKey) {
				// submit if ctrl+enter
				tt.parent().find('.menu .send').click(); 
			} else {
				cpos = getCpos(document.activeElement);
				//console.log("cpos before :"+cpos);
				if(e.target.innerHTML.trim().match(/<br>$/)) {
					typebox.pasteHtmlAtCaret('<br>', false);
				} else {
					//console.log(e.target.innerHTML.trim().match(/<br>$/));
					//console.log(e.target.innerHTML);
					typebox.pasteHtmlAtCaret('<br>', false);
					e.target.innerHTML = e.target.innerHTML+'<br>';
				}
				setCpos(document.activeElement, parseInt(cpos+1));
				cpos = getCpos(document.activeElement);
				//console.log("cpos after :"+cpos);
				return false;
			}
		}
	});


	// on each keyup we trigger the manipulation of the dynamicBox
	tt.on("keyup", function(e) {

		//exception for ctrl+v which is paste most of the time
		if((e.ctrlKey || e.keyCode == 17 || window.ctrl) && (e.keyCode == 86)) {
			return true;
		}
			
		// is the focus on the dynamicBox ?
		if($(":focus").parent().is(id).length == 0) {
			return true;
		}

		//prevent deselecting when erasing nothing (with backspace) 
		if(e.keyCode == 8) {
			if($(":focus").html() === "") {
				e.preventDefault();
				e.stopPropagation();
				return false;
			} else {
				return true;
			}
		}
				
		// window.typed is the last state of the typebox (if it did not change, do nothing)
		if(window.typed !== null || window.typed == $(id).html()) {
			return true;
		}

		// if there's nothing to do, do nothing
		if(e.target.textContent.match(/https?:\/\/[^\s]+/i) === null && e.target.textContent.match(/\{\:[A-Za-z0-9]+\:\}/i) === null) {
			return true;
		}
		
		// we get the cursor position (in order to control it)
		cpos = getCpos(document.activeElement);

		// we decide here what type of filters we use
		if(e.keyCode == 13) {
			filter_out_search(t, false, true);
		} else {
			filter_out_search(t, false, false);
		}
		console.log('----typebox up----');

		if(cpos !== false) {
			//re-set the cursor position to the right place
			if(e.keyCode == 13) {
				bias = 1;
			} else {
				bias = 0;
			}
			bias = 0;
			setCpos(document.activeElement, parseInt(cpos+bias));
		}
		//save the state of the typeBox
		window.typed = $(id).html();
	});

	// focus after click on dynamicBox
	tt.on('click', function(e) {
		if(e.currentTarget == e.target) {
			niceFocus(e.currentTarget);
		}
	});
}

// TODO remplacer dynamicBox par viewerBox ?
function view() {
	$('.post .dynamicBox').each(function() {
		console.log(this);
		filter_out_all(this, true);
		console.log('----view----');
		$(this).find('*[contenteditable=true]').removeAttr('contenteditable');
		lazyload($(this).closest('.nano-content')[0]);
		limitHeight($(this).closest('.post-text'));
	});
}

// ref : http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div/6691294#6691294
// This is a replacement for insertHTML that doesn't exists in ie11
function pasteHtmlAtCaret(html, selectPastedContent) {
	var sel, range;
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
		while( (node = el.firstChild) ) {
			lastNode = frag.appendChild(node);
		}
		var firstNode = frag.firstChild;
		range.insertNode(frag);

		// Preserve the selection
		if(lastNode) {
			range = range.cloneRange();
			range.setStartAfter(lastNode);
			if(selectPastedContent) {
				range.setStartBefore(firstNode);
			} else {
				range.collapse(true);
			}
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
}
