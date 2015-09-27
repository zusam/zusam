function mergeEditableNodes(e) {
	for(i = 0; i<e.childNodes.length; i++) {
		if(e.childNodes[i].tagName == 'DIV') {
			if(e.childNodes[i-1] != null && e.childNodes[i-1].tagName == 'DIV') {
				e.childNodes[i-1].innerHTML += "<br>"+e.childNodes[i].innerHTML;
				e.removeChild(e.childNodes[i]);
			}
		}
	}
}


//generic search function
function searchFilter(e, filter, viewer) {

	mergeEditableNodes(e);

	toProcess = [];
	// gather the nodes to process
	for(i = 0; i<e.childNodes.length; i++) {
		node = e.childNodes[i];
		if(node.tagName == 'DIV') {
			toProcess.push(node);
		}
	}

	// process them
	for(i = 0; i < toProcess.length; i++) {
		var output = [];
		output[0] = "";
		
		// generate output
		node = toProcess[i];
		
		inner = node.innerHTML.trim();
		output = filter(inner);
		//console.log(filter.name);
		//console.log(output);
		if(output.length > 1 || output[0] != node.innerHTML) {
			hasChanged = true;
		} else {
			hasChanged = false;
		}
		if(output.length > 1) {
			for(j = (output.length-1); j > 0; j--) {
				$(node).after(output[j]);
			}
		}
		if(output[0] == "") {
			$(node).remove();
		} else {
			node.innerHTML = output[0];
		}
	}
	if(viewer == null || viewer == false) {
		if(hasChanged) {
			refocus(e);
		}
	}
	refreshContent(viewer, e);
}


//small code to permit keyboard shortcuts with ctrlKey
var ctrl = false;
$(window).keydown(function(e) {
	if(e.keyCode != 17 && e.ctrlKey) {
		ctrl = true;
	} else {
		ctrl = false;
	}
});

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
	return caretOffset;
}

// set cursor
function setCpos(e, c) {
	
	c = parseInt(c);
	if(c < 0) { c = 0; }
	count = 0;
	for(i=0; i<e.childNodes.length; i++) {
		var node = e.childNodes[i];
		if(node.tagName == null) {
			if(node.length >= (c-count)) {
				var range = document.createRange();
				range.setStart(node, c-count);
				range.setEnd(node, c-count);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				break;
			} else {
				count = parseInt(count) + parseInt(node.length);
			}
		} else {
			if(c-count <= 1) {
				$(node).after(document.createTextNode(' '));
				var range = document.createRange();
				range.setStartAfter(node);
				range.setEndAfter(node); 
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				break;
			}
		}
	} 
}

//replace true with plaintext-only if the browser permits it
function supportPlaintextonly() {
	var d = document.createElement("div");
	try {
		d.contentEditable="PLAINtext-onLY";
	} catch(e) {
		return false;
	}
	return d.contentEditable=="plaintext-only";
}

function refreshContent(viewer, t) {
	t = $(t);
	if(viewer == null || viewer == false) {
		//if(supportPlaintextonly()) {
		//	$('*[contenteditable=true').attr('contenteditable','plaintext-only');
		//}
		//prevent drag and drop into contentEditable
		t.find('*[contenteditable]').on('dragover drop', function(event){
				event.preventDefault();
				return false;
				});

		// activating deletable content
		t.find('.deletable').off();
		t.find('.deletable').on('mouseenter', function(event){
				$(event.currentTarget).append('<div onclick="$(this).parent().remove();" class="delete-btn"><i class="fa fa-times"></i></div>');
				//window.setTimeout(function() {$('.delete-btn').addClass('grow-btn');}, 10);
				});
		t.find('.deletable').on('mouseleave', function(event){
				$(event.currentTarget).children('.delete-btn').remove();
				});

	}
	//erase empty iframes (bug with youtube)
	t.find('iframe:not([src])').remove();
}

function niceFocus(t) {
	if(!$(t).is("[contenteditable]")) {
		refocus(t);
	} else {
		if($(t).html() == "") {
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

function start() {

	// INITIALISATION OF EXTERNAL LIBRARIES
	// SOUNDCLOUD
	if( typeof(SC) != "undefined" ) {
		SC.initialize({
			// zusam client ID
			client_id: '01af1b3315ad8177aefecab596621e09'
		});
	}
}

function decode(input) {
	return br2nl(html_entity_decode(input, "ENT_NOQUOTES"));
}
function encode(input) {
	return nl2br(htmlentities(input, "ENT_NOQUOTES"))

}

function searchMatch(args) {

	var callerName = args['callerName'];
	var inner = args['inner'];
	var regex = args['regex'];
	var substitution = args['substitution'];
	var callback = args['callback'];
	var fail = args['fail'];
	var ajax_url = args['ajax_url'];


	inner = decode(inner);
	var output = [];
	var prem = inner.match(regex);
	m = [];
	xhrs = [];


	if(prem != null) {
		for(j=0;j<prem.length;j++) {
			m.push(prem[j].replace(/[\s]*/gi,''));
		}
	}
	// some log (to delete for production)
	if(m.length > 0) {
		console.log(args);
		console.log("from inner:'"+inner+"'");
	}
	if(m.length != 0) {
		var str = inner;
		for(j=0;j<m.length;j++) {
			var pos = str.indexOf(m[j]);
			var before = str.slice(0,pos);
			if(before.match(/^\s+$/)) {
				before = "";
			}
			// TODO this is necessary because the first output is not processed like the others...
			if(j==0) {
				output.push(encode(before));
			} else {
				output.push('<div contenteditable="true">'+encode(before)+'</div>');
			}
			output.push(substitution(m[j]));
			str = str.slice(pos+m[j].length);
		}
		//report the rest in a new p element only if it matters
		if(!str.match(/^\s*$/)) {
			output.push('<div contenteditable="true">'+encode(str)+'</div>');
		}

		for(j=0;j<m.length;j++) {
			settings = new Object();
			settings.url = ajax_url+"?url="+encodeURI(m[j]);
			if(callback != null) {
				settings.success = function(data){ 
					callback(data); 
				};
			} else {
				settings.success = function(data){ 
					console.log(data); 
				};
			}
			if(fail != null) {
				settings.error = function(){ fail(m[j]); };
			}
			if(callback != null) {
				$.ajax(settings);
			}
		}

	} else {
		output[0] = encode(inner);
	}
	return output;
}
