//get the cursor position
function getCpos(element) {
	var caretOffset = 0;
	var doc = element.ownerDocument || element.document;
	var win = doc.defaultView || doc.parentWindow;
	var sel;
	if (typeof win.getSelection != "undefined") {
		sel = win.getSelection();
		if (sel.rangeCount > 0) {
			var range = win.getSelection().getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
	} else if ( (sel = doc.selection) && sel.type != "Control") {
		var textRange = sel.createRange();
		var preCaretTextRange = doc.body.createTextRange();
		preCaretTextRange.moveToElementText(element);
		preCaretTextRange.setEndPoint("EndToEnd", textRange);
		caretOffset = preCaretTextRange.text.length;
	}
	var lignes = $(element).find("br").length;
	caretOffset = caretOffset + lignes;
	//console.log("getpos:"+caretOffset);
	return caretOffset;
}

// set cursor
function setCpos(e, c) {
	var node;
	var range;
	var sel;
	var placed = false;
	c = parseInt(c);
	if(c < 0) { c = 0; }
	var count = 0;
	for(i=0; i<e.childNodes.length; i++) {
		node = e.childNodes[i];
		if(typeof(node.tagName) == "undefined") {
			if(node.length >= (c-count)) {
				range = document.createRange();
				range.setStart(node, c-count);
				range.setEnd(node, c-count);
				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				placed = true;
				break;
			} else {
				count = parseInt(count) + parseInt(node.length);
			}
		} else {
			if(c-count <= 1) {
				$(node).after(document.createTextNode(' '));
				range = document.createRange();
				range.setStartAfter(node);
				range.setEndAfter(node); 
				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				placed = true;
				break;
			} else {
				count++;
			}
		}
	} 
	if(!placed) {
		node = e.childNodes[e.childNodes.length-1];
		range = document.createRange();
		range.setStart(node, node.length);
		range.setEnd(node, node.length);
		sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

function refreshContent(viewer, t) {
	if(viewer === null || viewer === false) {
		// flush eventListeners
		$(t).find('*[contenteditable]').off();
		$(t).find('.deletable').off();

		//prevent drag and drop into contentEditable
		$(t).find('*[contenteditable]').on('dragover drop', function(event){
			event.preventDefault();
			return false;
		});

		// activating deletable content
		$(t).find('.deletable').children('.delete-btn').remove();
		$(t).find('.deletable').append(genDelBtn());

	}
	//erase empty iframes (bug with youtube)
	$(t).find('iframe:not([src])').remove();
	
	// remap the dynamicBox
	typebox.arrangeDynamicBox(t);
}

function removeDeletable(t) {
	var dbox = $(t).closest('.dynamicBox')[0];
	console.log(dbox);
	$(t).closest('.deletable').remove();
	typebox.arrangeDynamicBox(dbox);
}

function niceFocus(t) {
	if(!$(t).is("[contenteditable]")) {
		refocus(t);
	} else {
		if($(t).html() === "") {
			t = t.parentNode;
			refocus(t);
		}
	}
}

function refocus(t) {
	t = $(t);
	if(!t.children().last().is('div')) {
		t.append('<div contenteditable="true"> </div>');
		refreshContent(t);
	}
	// place cursor at the end of last div
	e = t.children().last()[0];
	e.focus();
	var range = document.createRange();
	range.selectNodeContents(e);
	range.collapse(false);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function filter_out_search(t, viewer, ending) {
	var filters = Object.keys(typebox.Filter);
	for(var i=0; i<filters.length; i++) {
		var f = typebox.Filter[filters[i]];
		useFilter(t, f, viewer, ending);
		//console.log(t.outerHTML);
	}
}

function filter_out_all(t, viewer) {
	filter_out_search(t, viewer, true);
	filter_out_search(t, viewer, false);
}

