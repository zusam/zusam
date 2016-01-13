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
	searchFilter : function(e, filter, viewer, ending) {

		//Control.mergeEditableNodes(e);

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
			
			//inner = node.innerHTML.trim();
			inner = node.innerHTML;
			output = filter(inner, ending, viewer);
			if(output.length > 1 || output[0] != node.innerHTML) {
				hasChanged = true;
			} else {
				hasChanged = false;
			}
			if(output.length > 1) {
				for(j = (output.length-1); j > 0; j--) {
					node.insertAdjacentHTML('afterend', output[j]);
				}
			}
			if(output[0] == "") {
				if(viewer) {
					$(node).remove();
				} else {
					$(node).attr('data-placeholder','').html("");
				}
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
		var lignes = $(element).find("br").length
		caretOffset = caretOffset + lignes;
		//console.log("getpos:"+caretOffset);
		return caretOffset;
	},

	// set cursor
	setCpos : function(e, c) {
		
		//console.log("-----");
		var placed = false;
		c = parseInt(c);
		if(c < 0) { c = 0; }
		count = 0;
		for(i=0; i<e.childNodes.length; i++) {
			var node = e.childNodes[i];
			//console.log("node:"+node);
			//console.log("node tagname:"+node.tagName);
			if(typeof(node.tagName) == "undefined") {
			//console.log(c,count)
				if(node.length >= (c-count)) {
					var range = document.createRange();
					range.setStart(node, c-count);
					range.setEnd(node, c-count);
					//console.log(range)
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
			//		console.log(sel);
					placed = true;
					break;
				} else {
					//console.log("coucou");
					count = parseInt(count) + parseInt(node.length);
				}
			} else {
			//console.log(c,count)
				if(c-count <= 1) {
					$(node).after(document.createTextNode(' '));
					var range = document.createRange();
					range.setStartAfter(node);
					range.setEndAfter(node); 
					var sel = window.getSelection();
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
			//console.log("non placé");
			node = e.childNodes[e.childNodes.length-1];
			var range = document.createRange();
			range.setStart(node, node.length);
			range.setEnd(node, node.length);
			//console.log(range)
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			//console.log(sel);

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
			//t.find('*[contenteditable]').on('mouseenter', function(event){
			//	$(event.currentTarget).css('outline','1px solid red');	
			//});
			//t.find('*[contenteditable]').on('mouseleave', function(event){
			//	$(event.currentTarget).css('outline','none');	
			//});

			//prevent drag and drop into contentEditable
			t.find('*[contenteditable]').on('dragover drop', function(event){
					event.preventDefault();
					return false;
					});

			// activating deletable content
			t.find('.deletable').on('mouseenter', function(event){
					$(event.currentTarget).append('<div onclick="$(this).parent().remove();" class="delete-btn"><i class="fa fa-times"></i></div>');
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
		Control.filter_out_search(t, viewer, true);
	},

	filter_out_search : function(t, viewer, ending) {
		Control.searchFilter(t, Filter.searchSoundcloud, viewer, ending);
		Control.searchFilter(t, Filter.searchYoutube, viewer, ending);
		Control.searchFilter(t, Filter.searchYoutube2, viewer, ending);
		Control.searchFilter(t, Filter.searchVimeo, viewer, ending);
		Control.searchFilter(t, Filter.searchDailymotion, viewer, ending);
		Control.searchFilter(t, Filter.searchVine, viewer, ending);
		Control.searchFilter(t, Filter.searchImage, viewer, ending);
		Control.searchFilter(t, Filter.searchGif, viewer, ending);
		Control.searchFilter(t, Filter.searchVideo, viewer, ending);
		Control.searchFilter(t, Filter.searchLink, viewer, ending);
		Control.searchFilter(t, Filter.searchFile, viewer, ending);
		//Control.searchFilter(t, Filter.searchAlbum, viewer, ending);
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
			console.log(m);
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
					//var param = Object.keys(ajax_var).reduce(function(p,k){
					//	return p+"&"+k+"="+ajax_var[k];
					//}, "");
					var param = ajax_var;
					//console.log(param);
					param['url'] = m[j];
					//console.log(m[j]);
				} else {
					var param = "";
				}
				//console.log(param);
				if(typeof(ajax_url) != "undefined") {
					//settings.url = ajax_url+"?url="+encodeURI(m[j])+param;
					settings.url = ajax_url;
					settings.data = param;
					settings.method = "post";
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
						//console.log(settings);
						$.ajax(settings);
					}
				}
			}

		} else {
			output[0] = encode(inner);
		}
		return output;
	}
}
