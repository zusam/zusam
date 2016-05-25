function useFilter(e, filter, viewer, ending) {
	var output = [];
	var node;
	var i;
	var toProcess = [];
	
	for(i=0;i<e.childNodes.length;i++) {
		if(e.childNodes[i].tagName == "DIV") {
			toProcess.push(e.childNodes[i]);
		}
	}
	
	//if(toProcess.length > 0) {
	//	console.log(toProcess);
	//}
	
	for(i=0;i<toProcess.length;i++) {

		node = toProcess[i];
		output = [];
		output[0] = "";
		
		output = filter(node.innerHTML, ending, viewer);
		console.log(output);
		if(output.length > 1 || output[0] != node.innerHTML) {
			hasChanged = true;
		} else {
			hasChanged = false;
		}
		if(hasChanged) {
			for(j = 0; j < output.length; j++) {
				$(node).before(output[j]);
			}
			$(node).remove();
		}
	}
	refreshContent(viewer, e);
}

function applyFilter(args) {
	var callerName = args.callerName;
	var inner = decode(args.inner);
	var regex = args.regex;
	var substitution = args.substitution;
	var callback = args.callback;
	var fail = args.fail;
	var ajax_url = args.ajax_url;
	var ajax_var = args.ajax_var;
	var ajax_method = args.ajax_method || "post";
	var output = [];
	var xhrs = [];
	var m = inner.match(regex);

	if(m !== null && m.length !== 0) {
		var str = inner;
		for(j=0;j<m.length;j++) {
			m[j] = m[j].replace(/[\s]*/gi,'');
			var pos = str.indexOf(m[j]);
			var before = str.slice(0,pos);
			output.push('<div contenteditable="true">'+encode(before)+'</div>');
			output.push(substitution(m[j]));
			str = str.slice(pos+m[j].length);
		}
		output.push('<div contenteditable="true">'+encode(str)+'</div>');
		// send ajax requests
		if(callback !== null) {
			for(j=0;j<m.length;j++) {
				settings = {};
				var param = [];
				if(typeof(ajax_var) != "undefined") {
					param = ajax_var;
				}
				param.url = m[j];
				if(typeof(ajax_url) != "undefined") {
					settings.url = ajax_url;
					settings.data = param;
					settings.method = ajax_method;
					settings.success = function(data){ 
						callback(data); 
					};
					if(fail !== null) {
						settings.error = function(){ fail(m[j]); };
					}
					$.ajax(settings);
				}
			}
		}
	} else {
		output[0] = '<div contenteditable="true">'+encode(inner)+'</div>';
	}
	console.log(callerName);
	return output;
}

function mapDynamicBox(t) {
	var map = [];
	var curr;
	var node;
	
	for(i = 0; i<t.childNodes.length; i++) {
		curr = t.childNodes[i];
		node = {};
		switch(curr.tagName) {
			case 'DIV' :
				node.type = "text";
				node.src = curr.innerHTML;
				node.id = str2md5(curr.innerHTML); // useless for now
				map.push(node);
				break;
			case 'SPAN': 
				node.type = curr.dataset.type;
				node.src = curr.dataset.src;
				node.id = curr.dataset.id;
				map.push(node);
				break;
			default:
		}
	}
	return map;
}

function open_graph_build(data, viewer) {
	base_url = data.base_url;
	var basic_link_button = '';
	//if(typeof(viewer) == "undefined") {
	//	//var basic_link_button = '<button onclick="toBasicLink(this,event)" class="basic_link_button"><i class="icon-eye-off"></i></button>';
	//	var basic_link_button = '';
	//} else {
	//	var basic_link_button = '';
	//}
	var preview = ""; 
	if(typeof(data.image) != "undefined") {
		if(typeof(data.image.url) != "undefined" && !data.image.url.match(/^\s*$/)) {
			var xx = origin_url+'Data/miniature/'+str2md5(data.url)+'.jpg';
			preview = '<div class="preview"><img src="'+xx+'" onerror="error_im(this)"/></div>';
		}
	}
	if(typeof(data.title) != "undefined" && data.title !== "") {
		title = '<div class="title">'+html_entity_decode(data.title)+'</div>';
	} else { title = ""; }
	if(typeof(data.description) != "undefined" && data.description !== "") {
		description = '<div class="description">'+data.description+'</div>';
	} else { description = ""; }
	//console.log(viewer, basic_link_button);
	if(preview !== "" || (title !== "" && description !== "")) {
		e = $('<a class="article_big" href="'+decodeURI(data.url)+'" target="_blank">'+basic_link_button+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
		if(typeof(data.image) != "undefined") {
			if(data.image.url !== "" && data.image.width !== null && data.image.height !== null && parseInt(data.image.width) < 380) {
				e = $('<a class="article_small" href="'+decodeURI(data.url)+'" target="_blank">'+basic_link_button+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
			} 
		}
	} else {
		e = fail_request(data.url);
	}
	return e;
}

function fail_request(url) {
	if(typeof(url) == "undefined") {
		return "";	
	}
	e = $('<a class="b-link" href="'+url.replace(/\s/," ")+'" target="_blank">'+url+'</a>');
	return e;
}


