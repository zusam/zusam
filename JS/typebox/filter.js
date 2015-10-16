var Filter = {

	endingDeezer : function(inner) {
		r1 = /[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/gi;
		substitution = function(str) {
			playlist_id = str.replace(/[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/,'$3');
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			output += '<div class="embed-responsive embed-responsive-16by9"><iframe scrolling="no" frameborder="0" allowTransparency="true" src="http://www.deezer.com/plugins/player?playlist=true&type=playlist&id='+playlist_id+'"></iframe></div>';
			output += '</span>';
			return output;
		}
		output = Control.searchMatch({"callerName":"endingDeezer", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchDeezer : function(inner) {
		r1 = /[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)[\s]/gi;
		substitution = function(str) {
			playlist_id = str.replace(/[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/,'$3');
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			output += '<div class="embed-responsive embed-responsive-16by9"><iframe scrolling="no" frameborder="0" allowTransparency="true" src="http://www.deezer.com/plugins/player?playlist=true&type=playlist&id='+playlist_id+'"></iframe></div>';
			output += '</span>';
			return output;
		}
		output = Control.searchMatch({"callerName":"searchDeezer", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingSoundcloud : function(inner) {
		r1 = /[\s]*(https?:\/\/soundcloud.com\/)([\w\-]+)\/([\w\-]+)(\/[\w\-]+)?$/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img src="'+'Assets/ajax-loader.gif"/></span>';
			if( typeof(SC) != "undefined" ) {
				setTimeout( function() {
					SC.oEmbed(str, { auto_play: true }, function(oEmbed) {
						song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,'$1');
						song_url = song_url.replace(/auto_play=true/,"auto_play=false");
						output = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" scrolling="no" frameborder="0" src="'+song_url+'"></iframe></div>';
						$('#'+str2md5(str)).html(output);
					});
				}, 50);
			}
			return output;
		}
		output = Control.searchMatch({"callerName":"endingSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchSoundcloud : function(inner) {
		r1 = /[\s]*(https?:\/\/soundcloud.com\/)([\w\-]+)\/([\w\-]+)(\/[\w\-]+)?[\s]/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img src="'+'Assets/ajax-loader.gif"/></span>';
			setTimeout( function() {
				SC.oEmbed(str, { auto_play: true }, function(oEmbed) {
					song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,'$1');
					song_url = song_url.replace(/auto_play=true/,"auto_play=false");
					output = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" scrolling="no" frameborder="0" src="'+song_url+'"></iframe></div>';
					$('#'+str2md5(str)).html(output);
				});
			}, 50);
			return output;
		}
		output = Control.searchMatch({"callerName":"searchSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingVine : function(inner) {
		r1 = /[\s]*(https?:\/\/vine.co\/v\/)([\w\-]+)$/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"endingVine", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchVine : function(inner) {
		r1 = /[\s]*(https?:\/\/vine.co\/v\/)([\w\-]+)[\s]/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchVine", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingDailymotion : function(inner) {
		r1 = /[\s]*(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)$/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(http:\/\/www.dailymotion.com\/video\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://www.dailymotion.com/embed/video/$2" allowfullscreen></iframe></div>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"endingDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchDailymotion : function(inner) {
		r1 = /[\s]*(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)[\s]/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://www.dailymotion.com/embed/video/$2" allowfullscreen></iframe></div>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingVimeo : function(inner) {
		r1 = /[\s]*(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)$/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://player.vimeo.com/video/$3" allowfullscreen></iframe></div>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"endingVimeo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchVimeo : function(inner) {
		r1 = /[\s]*(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)[\s]/gi;
		substitution = function(str) {
			var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://player.vimeo.com/video/$3" allowfullscreen></iframe></div>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchVimeo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingYoutube2 : function(inner) {
		r1 = /[\s]*https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+$/gi;
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/,"$2");
			var w = 'http://www.youtube.com/embed/'+v+'';
			var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless src="'+w+'"/><iframe></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"endingYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchYoutube2 : function(inner) {
		r1 = /[\s]*https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+[\s]/gi;
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/,"$2");
			var w = 'http://www.youtube.com/embed/'+v+'?wmode=opaque';
			var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless src="'+w+'"/><iframe></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingYoutube : function(inner) {
		r1 = /[\s]*https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+$/gi;
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/,"$4");
			var w = 'http://www.youtube.com/embed/'+v+'';
			var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless  src="'+w+'"/><iframe></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"endingYoutube", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchYoutube : function(inner) {
		r1 = /[\s]*https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+[\s]/gi;
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/,"$4");
			var w = 'http://www.youtube.com/embed/'+v+'?wmode=opaque';
			var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless  src="'+w+'"/><iframe></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchYoutube", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	endingVideo : function(inner) {
		r1 = /[\s]*https?:\/\/[^\s]+(\.mp4|\.webm)(\?\w*)?$/gi;
		substitution = function(str) {
				return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><video autoplay loop><source src="'+str+'"></video></span>';
		}
		output = Control.searchMatch({"callerName":"endingVideo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;

	},

	searchVideo : function(inner) {
		r1 = /[\s]*https?:\/\/[^\s]+(\.mp4|\.webm)(\?\w*)?[\s]/gi;
		substitution = function(str) {
				return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><video autoplay loop><source src="'+str+'"></video></span>';
		}
		output = Control.searchMatch({"callerName":"searchVideo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	endingImage : function(inner) {
		r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#\'\!]+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)(\?\w*)?$/gi;
		substitution = function(str) {
				return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+str+'"/></span>';
		}
		output = Control.searchMatch({"callerName":"endingImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchImage : function(inner) {
		r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#\!\']+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)(\?\w*)?[\s]/gi;
		substitution = function(str) {
				return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+str+'"/></span>';
		}
		output = Control.searchMatch({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},
	
	endingFile : function(inner) {
		r1 = /\{\:[a-zA-Z0-9]+\:\}/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="Assets/ajax-loader.gif"/></span>';
			return output;
		};
		var ajax_url = "Ajax/get.php";
		var ajax_var = {"action":"getFile"};
		callback = function(data) {
			console.log(data);
			console.log(data['html']);
			balise = $('#'+str2md5(decodeURI(data['url'])));
			balise.html(data['html']);
		};
		fail = function(url) {
				balise = $('#'+str2md5(url));
				balise.html("error");

		}
		output = Control.searchMatch({"callerName":"endingFile", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "ajax_var":ajax_var, "callback":callback, "fail":fail});
		return output;
	},

	searchFile : function(inner) {
		r1 = /\{\:[a-zA-Z0-9]+\:\}/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="Assets/ajax-loader.gif"/></span>';
			return output;
		};
		var ajax_url = "Ajax/get.php";
		var ajax_var = {"action":"getFile"};
		callback = function(data) {
			console.log(data);
			console.log(data['html']);
			balise = $('#'+str2md5(decodeURI(data['url'])));
			balise.html(data['html']);
		};
		fail = function(url) {
				balise = $('#'+str2md5(url));
				balise.html("error");

		}
		output = Control.searchMatch({"callerName":"endingFile", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "ajax_var":ajax_var, "callback":callback, "fail":fail});
		return output;
	},

	fail_request : function(url) {
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
	},

	open_graph_build : function(data) {
		console.log(data);
		//base_url = decodeURI(data['url']).replace(/https?:\/\/(www\.)?([^\/\?\#]+).*/i,"$1$2");
		base_url = data['base_url'];
		console.log(data['image']['url']);
		if(data['image']['url'].match(/https?:\/\/.+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)/i)) {
			preview = '<div class="preview"><img src="'+data['image']['url']+'" onerror="error_im(this)"/></div>';
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
			e = Filter.fail_request(data['url']);
		}
		return e;
	},

	/*
	function searchGenericImage(inner) {
		r1 = /[\s]*https?:\/\/[\w\/=?~,.%&+\-#\!]+$/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="Assets/ajax-loader.gif"/></span>';
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
		output = Control.searchMatch("searchGenericImage", inner, r1, substitution, callback, fail);
		return output;
	}
	*/

	endingLink : function(inner) {
		r1 = /[\s]*https?:\/\/[^\s]+$/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="Assets/ajax-loader.gif"/></span>';
			return output;
		};
		ajax_url = "Ajax/gen_preview.php";
		callback = function(data) {
			e = Filter.open_graph_build(data);
			balise = $('#'+str2md5(decodeURI(data['url'])));
			balise.html(e);
		};
		fail = function(url) {
				e = Filter.fail_request(url);
				balise = $('#'+str2md5(url));
				balise.html(e);

		}
		output = Control.searchMatch({"callerName":"endinglink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "callback":callback, "fail":fail});
		return output;
	},

	searchLink : function(inner) {
		r1 = /[\s]*https?:\/\/[^\s]+[\s]/gi;
		substitution = function(str) {
			output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'"><img src="Assets/ajax-loader.gif"/></span>';
			return output;
		};
		ajax_url = "Ajax/gen_preview.php";
		callback = function(data) {
			e = Filter.open_graph_build(data);
			balise = $('#'+str2md5(decodeURI(data['url'])));
			balise.html(e);
		};
		fail = function(url) {
			e = Filter.fail_request(url);
			balise = $('#'+str2md5(url));
			balise.html(e);
		}
		output = Control.searchMatch({"callerName":"searchLink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url,"callback":callback, "fail":fail});
		return output;
	}
}
