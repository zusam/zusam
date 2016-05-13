var Filter = {

	searchGfycat : function(inner, ending) {
		var r1 = new RegExp(regex.gfycat ,'gi');
		if(!ending) {
			r1 = new RegExp(regex.gfycat+'[\s]','gi');
		}
		substitution = function(str) {
			var url = str.replace(/(.*)\?.*$/,'$1');
			console.log(url);
			var id = url.replace(/.*\/([a-zA-Z]+)$/,"$1");
			console.log(id);
			var w = "https://gfycat.com/ifr/"+id;
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			console.log(xx);
			var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			//var o = '<div style="position:relative;padding-bottom:calc(100% / 1.78)"><iframe src="'+url+'" frameborder="0" scrolling="no" width="100%" height="100%" style="position:absolute;top:0;left:0;" allowfullscreen></iframe></div>';
			var o = '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div>';
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchGfycat", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchFacebook_video : function(inner, ending) {
		var r1 = new RegExp(regex.facebook_video ,'gi');
		if(!ending) {
			r1 = new RegExp(regex.facebook_video+'[\s]','gi');
		}
		substitution = function(str) {
			var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = '<iframe src="https://www.facebook.com/plugins/video.php?href='+str+'&show_text=0&width=600" width="600" height="337" style="border:none;overflow:hidden" onload="keepFormat(this, 16/9)" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>';
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchFacebook_video", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},
	
	searchImgur : function(inner, ending) {
		var baliseId = createId();
		var r1 = new RegExp(regex.imgur,'gi');
		if(!ending) {
			r1 = new RegExp(regex.imgur+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+typebox.genAjaxLoader()+'</span>';
			return output;
		}
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getImgur"};
		callback = function(data) {
			console.log(data);
			e = $(data['html']);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = Filter.fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		}
		output = Control.searchMatch({"callerName":"searchImgur", "inner":inner, "regex":r1, "ajax_url":ajax_url, "ajax_var":ajax_var, "substitution":substitution, "callback":callback, "fail":fail});
		return output;
	},

	searchInstagram : function(inner, ending) {
		var baliseId = createId();
		var r1 = new RegExp(regex.instagram,'gi');
		if(!ending) {
			r1 = new RegExp(regex.instagram+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+typebox.genAjaxLoader()+'</span>';
			return output;
		}
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getInstagram"};
		callback = function(data) {
			console.log(data);
			e = $('<a class="mediaLink material-shadow" href="'+data['url']+'" target="_blank"><i class="fa fa-instagram"></i></a><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+data['thumbnail_url']+'"/>');
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = Filter.fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		}
		output = Control.searchMatch({"callerName":"searchInstagram", "inner":inner, "regex":r1, "ajax_url":ajax_url, "ajax_var":ajax_var, "substitution":substitution, "callback":callback, "fail":fail});
		return output;
	},

	//searchOnedrive : function(inner, ending) {
	//	var r1 = new RegExp(regex.onedrive,'gi');
	//	if(!ending) {
	//		r1 = new RegExp(regex.onedrive+'[\s]','gi');
	//	}
	//	substitution = function(str) {
	//		if(str.match(/resid=/)) {
	//			var id = str.replace(/(https?:\/\/onedrive.live.com\/).*resid=([\!\%\w]+).*/,'$2');
	//		} else {
	//			var id = str.replace(/(https?:\/\/onedrive.live.com\/).*id=([\!\%\w]+).*/,'$2');
	//		}
	//		console.log(id);
	//		if(id.match(/^[\!\%\w]+$/)) {
	//			var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
	//			var o = '<iframe seamless src="https://onedrive.live.com/embed?resid='+id+'" frameborder="0"></iframe>';
	//			var a = '</span>';
	//			return b+o+a;
	//		} else {
	//			return Filter.fail_request(str);
	//		}
	//	}
	//	output = Control.searchMatch({"callerName":"searchOnedrive", "inner":inner, "regex":r1, "substitution":substitution});
	//	return output;
	//},

	searchGoogleDrive : function(inner, ending) {
		var r1 = new RegExp(regex.googleDrive,'gi');
		if(!ending) {
			r1 = new RegExp(regex.googleDrive+'[\s]','gi');
		}
		substitution = function(str) {
			if(str.match(/open\?id=/)) {
				var id = str.replace(/(https?:\/\/drive.google.com\/open\?id=)(\w+)/,'$2');
			} else {
				var id = str.replace(/(https?:\/\/drive.google.com\/file\/d\/)([\w]+)(\/)([^\s]+)/,'$2');
			}
			if(id.match(/^\w+$/)) {
				var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				var o = '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="https://drive.google.com/file/d/'+id+'/preview" frameborder="0"></iframe></div>';
				var a = '</span>';
				return b+o+a;
			} else {
				return Filter.fail_request(str);
			}
		}
		output = Control.searchMatch({"callerName":"searchGoogleDrive", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},
	
	searchSoundcloud : function(inner, ending) {
		var r1 = new RegExp(regex.soundcloud,'gi');
		if(!ending) {
			r1 = new RegExp(regex.soundcloud+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">'+typebox.genAjaxLoader()+'</span>';
			setTimeout( function() {
				SC.oEmbed(str, { auto_play: true }, function(oEmbed) {
					song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,'$1');
					var w = song_url.replace(/auto_play=false/,"auto_play=true");
					var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
					var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
					o += '<div class="embed-responsive embed-responsive-16by9">';
					o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
					o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
					o += '</div></div></span>';
					$('#'+str2md5(str)).html(o);
				});
			}, 50);
			var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
			return output;
		}
		output = Control.searchMatch({"callerName":"searchSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchVine : function(inner, ending) {
		var r1 = new RegExp(regex.vine ,'gi');
		if(!ending) {
			r1 = new RegExp(regex.vine+'[\s]','gi');
		}
		substitution = function(str) {
			var b = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
		}
		output = Control.searchMatch({"callerName":"searchVine", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchDailymotion : function(inner, ending) {
		var r1 = new RegExp(regex.dailymotion,'gi');
		if(!ending) {
			r1 = new RegExp(regex.dailymotion+'[\s]','gi');
		}
		substitution = function(str) {
			var w = str.replace(/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/,'https://www.dailymotion.com/embed/video/$2?autoplay=1');
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchVimeo : function(inner, ending) {
		var r1 = new RegExp(regex.vimeo,'gi');
		if(!ending) {
			r1 = new RegExp(regex.vimeo+'[\s]','gi');
		}
		substitution = function(str) {
			var w = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/,'https://player.vimeo.com/video/$3?autoplay=1');
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchVimeo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchYoutube2 : function(inner, ending) {
		var r1 = new RegExp(regex.youtube2,'gi');
		if(!ending) {
			r1 = new RegExp(regex.youtube2+'[\s]','gi');
		}
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/,"$2");
			var w = 'https://www.youtube.com/embed/'+v+'?autoplay=1&controls=2&wmode=opaque';
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchYoutube : function(inner, ending) {
		var r1 = new RegExp(regex.youtube,'gi');
		if(!ending) {
			r1 = new RegExp(regex.youtube+'[\s]','gi');
		}
		substitution = function(str) {
			var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/,"$4");
			var w = 'https://www.youtube.com/embed/'+v+'?autoplay=1&controls=2&wmode=opaque';
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		}
		output = Control.searchMatch({"callerName":"searchYoutube", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchVideo : function(inner, ending) {
		var r1 = new RegExp(regex.video,'gi');
		if(!ending) {
			r1 = new RegExp(regex.video+'[\s]','gi');
		}
		substitution = function(str) {
				var video_link = str;
				if(str.match(/\.gifv/)) {
					video_link = str.replace(/\.gifv/,".webm");
				}
				var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
				var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				o += '<div onclick="loadVideo(this)" data-src="'+video_link+'" class="launcher">';
				o += '<img src="'+xx+'" onerror="loadVideo(this)"/>';
				o += '</div></span>';
				return o;
		}
		output = Control.searchMatch({"callerName":"searchVideo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchImage : function(inner, ending) {
		var r1 = new RegExp(regex.image,'gi');
		if(!ending) {
			r1 = new RegExp(regex.image+'[\s]','gi');
		}
		substitution = function(str) {
				return '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+str+'"/></span>';
		}
		output = Control.searchMatch({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchGif : function(inner, ending) {
		var r1 = new RegExp(regex.gif,'gi');
		if(!ending) {
			r1 = new RegExp(regex.gif+'[\s]','gi');
		}
		substitution = function(str) {
				var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
				var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				o += '<div onclick="loadImage(this)" data-src="'+str+'" class="launcher">';
				o += '<img src="'+xx+'" onerror="loadImage(this)"/>';
				o += '</div></span>';
				return o;
		}
		output = Control.searchMatch({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchFile : function(inner, ending, viewer) {
		var r1 = new RegExp(regex.file,'gi');
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'">'+typebox.genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getFile", "viewer":viewer};
		callback = function(data) {
			console.log(data);
			console.log(data['html']);
			balise = $('#'+str2md5(decodeURI(data['url'])));
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(data['html']);
			} else {
				balise.html(data['html']);
				balise.append(Control.genDelBtn());
			}
			console.log(viewer);
			if(viewer != false) {
				$('img.lazyload').each(function(){
					console.log(this.dataset.src);
					this.src = this.dataset.src;
					this.style.opacity = 1;
				});
			}
		};
		fail = function(url) {
				balise = $('#'+str2md5(url));
				if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
					balise.html("error");
				} else {
					balise.html("error");
					balise.append(Control.genDelBtn());
				}
		};
		output = Control.searchMatch({"callerName":"searchFile", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "ajax_var":ajax_var, "callback":callback, "fail":fail});
		return output;
	},

	fail_request : function(url) {
		if(typeof(url) == "undefined") {
			return "";	
		}
		e = $('<a class="b-link" href="'+url.replace(/\s/," ")+'" target="_blank">'+url+'</a>');
		return e;
	},

	open_graph_build : function(data, viewer) {
		base_url = data['base_url'];
		if(typeof(viewer) == "undefined") {
			//var basic_link_button = '<button onclick="toBasicLink(this,event)" class="basic_link_button"><i class="icon-eye-off"></i></button>';
			var basic_link_button = '';
		} else {
			var basic_link_button = '';
		}
		var preview = ""; 
		if(typeof(data['image']) != "undefined") {
			if(typeof(data['image']['url']) != "undefined" && !data['image']['url'].match(/^\s*$/)) {
				var xx = origin_url+'Data/miniature/'+str2md5(data['url'])+'.jpg';
				preview = '<div class="preview"><img src="'+xx+'" onerror="error_im(this)"/></div>';
			}
		}
		if(typeof(data['title']) != "undefined" && data['title'] != "") {
			title = '<div class="title">'+html_entity_decode(data['title'])+'</div>'
		} else { title = ""; }
		if(typeof(data['description']) != "undefined" && data['description'] != "") {
			description = '<div class="description">'+data['description']+'</div>';
		} else { description = ""; }
		console.log(viewer, basic_link_button);
		if(preview != "" || (title != "" && description != "")) {
			e = $('<a class="article_big" href="'+decodeURI(data['url'])+'" target="_blank">'+basic_link_button+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
			if(typeof(data['image']) != "undefined") {
				if(data['image']['url'] != "" && data['image']['width'] != null && data['image']['height'] != null && parseInt(data['image']['width']) < 380) {
					e = $('<a class="article_small" href="'+decodeURI(data['url'])+'" target="_blank">'+basic_link_button+preview+title+description+'<div class="base_url">'+base_url+'</div></a>');
				} 
			}
		} else {
			e = Filter.fail_request(data['url']);
		}
		return e;
	},

	searchLink : function(inner, ending, viewer) {
		var baliseId = createId();
		var r1 = new RegExp(regex.link,'gi');
		if(!ending) {
			r1 = new RegExp(regex.link+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+typebox.genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"gen_preview"};
		callback = function(data) {
			console.log(data);
			e = Filter.open_graph_build(data, viewer);
			balise = $('*[data-src="'+data['url']+'"]');
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = Filter.fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(Control.genDelBtn());
			}
		}
		output = Control.searchMatch({"callerName":"searchLink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_var":ajax_var, "ajax_url":ajax_url, "callback":callback, "fail":fail});
		return output;
	}
}
