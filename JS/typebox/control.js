var Control = {
	mergeEditableNodes : function(e) {
		for(i = 0; i<e.childNodes.length; i++) {
			if(e.childNodes[i].tagName == 'DIV') {
				if(e.childNodes[i-1] != null && e.childNodes[i-1].tagName == 'DIV') {
					e.childNodes[i-1].innerHTML += "<br>"+e.childNodes[i].innerHTML;
					e.removeChild(e.childNodes[i]);
				}
			}
		}
	},

	//generic search function
	searchFilter : function(e, filter, viewer) {

		Control.mergeEditableNodes(e);

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
			//console.log(filter);
			//console.log(typeof(filter));
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
				Control.refocus(e);
			}
		}
		Control.refreshContent(viewer, e);
	},

	//get the cursor position
	getCpos : function(element) {
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
	},

	// set cursor
	setCpos : function(e, c) {
		
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
	},

	////replace true with plaintext-only if the browser permits it
	//supportPlaintextonly : function() {
	//	var d = document.createElement("div");
	//	try {
	//		d.contentEditable="PLAINtext-onLY";
	//	} catch(e) {
	//		return false;
	//	}
	//	return d.contentEditable=="plaintext-only";
	//}

	refreshContent : function(viewer, t) {
		t = $(t);
		if(viewer == null || viewer == false) {
			// flush eventListeners
			t.find('*[contenteditable]').off();
			t.find('.deletable').off();

			//if(supportPlaintextonly()) {
			//	$('*[contenteditable=true').attr('contenteditable','plaintext-only');
			//}

			//debug XXX
			t.find('*[contenteditable]').on('mouseenter', function(event){
				$(event.currentTarget).css('outline','1px solid red');	
			});
			t.find('*[contenteditable]').on('mouseleave', function(event){
				$(event.currentTarget).css('outline','none');	
			});

			//prevent drag and drop into contentEditable
			t.find('*[contenteditable]').on('dragover drop', function(event){
					event.preventDefault();
					return false;
					});

			// activating deletable content
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
	},

	niceFocus : function(t) {
		if(!$(t).is("[contenteditable]")) {
			Control.refocus(t);
		} else {
			if($(t).html() == "") {
				t = t.parentNode;
				Control.refocus(t);
			}
		}
	},

	refocus : function(t) {
		t = $(t);
		if(!t.children().last().is('div')) {
			t.append('<div contenteditable="true"> </div>');
			Control.refreshContent(t);
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
	},

	filter_out_ending : function(t, viewer) {
		Control.searchFilter(t, Filter.endingYoutube, viewer);
		Control.searchFilter(t, Filter.endingYoutube2, viewer);
		Control.searchFilter(t, Filter.endingVimeo, viewer);
		Control.searchFilter(t, Filter.endingDailymotion, viewer);
		Control.searchFilter(t, Filter.endingVine, viewer);
		Control.searchFilter(t, Filter.endingDeezer, viewer);
		Control.searchFilter(t, Filter.endingSoundcloud, viewer);
		Control.searchFilter(t, Filter.endingImage, viewer);
		Control.searchFilter(t, Filter.endingVideo, viewer);
		Control.searchFilter(t, Filter.endingLink, viewer);
		Control.searchFilter(t, Filter.endingFile, viewer);
	},

	filter_out_search : function(t, viewer) {
		Control.searchFilter(t, Filter.searchYoutube, viewer);
		Control.searchFilter(t, Filter.searchYoutube2, viewer);
		Control.searchFilter(t, Filter.searchVimeo, viewer);
		Control.searchFilter(t, Filter.searchDailymotion, viewer);
		Control.searchFilter(t, Filter.searchVine, viewer);
		Control.searchFilter(t, Filter.searchDeezer, viewer);
		Control.searchFilter(t, Filter.searchSoundcloud, viewer);
		Control.searchFilter(t, Filter.searchImage, viewer);
		Control.searchFilter(t, Filter.searchVideo, viewer);
		Control.searchFilter(t, Filter.searchLink, viewer);
		Control.searchFilter(t, Filter.searchFile, viewer);
	},
	
	filter_out_all : function(t, viewer) {
		Control.filter_out_ending(t, viewer);
		Control.filter_out_search(t, viewer);
	},

	searchMatch : function(args) {

		var callerName = args['callerName'];
		var inner = args['inner'];
		var regex = args['regex'];
		var substitution = args['substitution'];
		var callback = args['callback'];
		var fail = args['fail'];
		var ajax_url = args['ajax_url'];
		var ajax_var = args['ajax_var'];


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
				if(typeof(ajax_var) != "undefined") {
					var param = Object.keys(ajax_var).reduce(function(p,k){
						return p+"&"+k+"="+ajax_var[k];
					}, "");
				} else {
					var param = "";
				}
				settings.url = ajax_url+"?url="+encodeURI(m[j])+param;
				console.log(settings.url);
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
}
