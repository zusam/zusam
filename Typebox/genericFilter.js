function fail_request(url) {
	base_url = decodeURI(url).replace(/https?:\/\/(www\.)?([^\/\?\#]+).*/i,"$1$2");
	e = $('<a class="b-link" href="'+decodeURI(url).replace(/\s/," ")+'" target="_blank"></a>');
	container = $('<div>');
	total_width = 0;
	for(i = 0; i < 100; i++) {
		if(total_width > 100) {
			break;
		}
		c = parseInt(Math.random()*100+30);
		w = Math.random()*10;
		total_width += w;
		h = '80px'; 
		d = $('<div>').css({'margin':'0px','display':'inline-block','width':w+'%','padding-bottom':h,'background':'rgba('+c+','+c+','+c+',1)'});
		container.append(d);
	}
	e.append(container);
	e.append('<span><i class="fa fa-external-link-square"></i> '+base_url+'</span>');
	return e;
}

function open_graph_build(data) {
	//base_url = decodeURI(data['url']).replace(/https?:\/\/(www\.)?([^\/\?\#]+).*/i,"$1$2");
	base_url = data['base_url'];
	console.log(data['image']['url']);
	if(data['image']['url'].match(/https?:\/\/.+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)/i)) {
		preview = '<div class="preview"><img src="'+data['image']['url']+'"/></div>';
	} else { 
		console.log("nope");
		preview = ""; 
	}
	if(data['title'] != null && data['title'] != "") {
		title = '<div class="title">'+html_entity_decode(data['title'])+'</div>'
	} else { title = ""; }
	if(data['description'] != null && data['description'] != "") {
		description = '<div class="description">'+html_entity_decode(data['description'])+'</div>';
	} else { description = ""; }
	if(preview != "" || (title != "" && description != "")) {
		if(data['image']['url'] != "" && data['w'] != null && data['h'] != null && parseInt(data['w']) < 380) {
			e = $('<a class="article_small" href="'+decodeURI(data['url'])+'" target="_blank">'+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
		} else {
			e = $('<a class="article_big" href="'+decodeURI(data['url'])+'" target="_blank">'+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
		}
	} else {
		e = fail_request(data['url']);
	}
	return e;
}

/*
function searchGenericImage(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~,.%&+\-#\!]+$/gi;
	substitution = function(str) {
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="'+window.dir+'ajax-loader.gif"/></span>';
		return output;
	};
	callback = function(json) {
		json = JSON.parse(json);
		balise = $('#'+str2md5(decodeURI(json['url'])));
		e = $('<img src="'+decodeURI(json['url'])+'"/>');
		balise.html(e);
	};
	fail = function(url) {
			e = fail_request(url);
			balise = $('#'+str2md5(url));
			balise.html(e);
	}
	output = searchMatch("searchGenericImage", inner, r1, substitution, callback, fail);
	return output;
}
*/

function endingLink(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~,.%&+\-#\!]+$/gi;
	substitution = function(str) {
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="'+window.dir+'ajax-loader.gif"/></span>';
		return output;
	};
	ajax_url = "gen_preview.php";
	callback = function(data) {
		e = open_graph_build(data);
		balise = $('#'+str2md5(decodeURI(data['url'])));
		balise.html(e);
	};
	fail = function(url) {
			e = fail_request(url);
			balise = $('#'+str2md5(url));
			balise.html(e);

	}
	output = searchMatch({"callerName":"endinglink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "callback":callback, "fail":fail});
	return output;
}

function searchLink(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~,.%&+\-#]+[\s]/gi;
	substitution = function(str) {
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="'+window.dir+'ajax-loader.gif"/></span>';
		return output;
	};
	ajax_url = "gen_preview.php";
	callback = function(data) {
		e = open_graph_build(data);
		balise = $('#'+str2md5(decodeURI(data['url'])));
		balise.html(e);
	};
	fail = function(url) {
		e = fail_request(url);
		balise = $('#'+str2md5(url));
		balise.html(e);
	}
	output = searchMatch({"callerName":"searchLink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url,"callback":callback, "fail":fail});
	return output;
}
