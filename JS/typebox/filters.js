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
			var b = '<span class="deletable deletable-block" data-type="gfycat" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div>';
			var a = '</span>';
			return b+o+a;
		};
		output = applyFilter({"callerName":"searchGfycat", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchFacebook_video : function(inner, ending) {
		var r1 = new RegExp(regex.facebook_video ,'gi');
		if(!ending) {
			r1 = new RegExp(regex.facebook_video+'[\s]','gi');
		}
		substitution = function(str) {
			var b = '<span class="deletable deletable-block" data-type="facebook_video" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = '<iframe src="https://www.facebook.com/plugins/video.php?href='+str+'&show_text=0&width=600" width="600" height="337" style="border:none;overflow:hidden" onload="keepFormat(this, 16/9)" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>';
			var a = '</span>';
			return b+o+a;
		};
		output = applyFilter({"callerName":"searchFacebook_video", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},
	
	searchImgur : function(inner, ending) {
		var baliseId = createId();
		var r1 = new RegExp(regex.imgur,'gi');
		if(!ending) {
			r1 = new RegExp(regex.imgur+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-type="imgur" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getImgur"};
		callback = function(data) {
			console.log(data);
			e = $(data.html);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		output = applyFilter({"callerName":"searchImgur", "inner":inner, "regex":r1, "ajax_url":ajax_url, "ajax_var":ajax_var, "substitution":substitution, "callback":callback, "fail":fail});
		return output;
	},

	searchInstagram : function(inner, ending) {
		var baliseId = createId();
		var r1 = new RegExp(regex.instagram,'gi');
		if(!ending) {
			r1 = new RegExp(regex.instagram+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-type="instagram" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getInstagram"};
		callback = function(data) {
			console.log(data);
			e = $('<a class="mediaLink material-shadow" href="'+data.url+'" target="_blank"><i class="fa fa-instagram"></i></a><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+data.thumbnail_url+'"/>');
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		output = applyFilter({"callerName":"searchInstagram", "inner":inner, "regex":r1, "ajax_url":ajax_url, "ajax_var":ajax_var, "substitution":substitution, "callback":callback, "fail":fail});
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
	//			return fail_request(str);
	//		}
	//	}
	//	output = applyFilter({"callerName":"searchOnedrive", "inner":inner, "regex":r1, "substitution":substitution});
	//	return output;
	//},

	searchGoogleDrive : function(inner, ending) {
		var r1 = new RegExp(regex.googleDrive,'gi');
		if(!ending) {
			r1 = new RegExp(regex.googleDrive+'[\s]','gi');
		}
		substitution = function(str) {
			var id;
			if(str.match(/open\?id=/)) {
				id = str.replace(/(https?:\/\/drive.google.com\/open\?id=)(\w+)/,'$2');
			} else {
				id = str.replace(/(https?:\/\/drive.google.com\/file\/d\/)([\w]+)(\/)([^\s]+)/,'$2');
			}
			if(id.match(/^\w+$/)) {
				var b = '<span class="deletable deletable-block" data-type="googleDrive" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				var o = '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="https://drive.google.com/file/d/'+id+'/preview" frameborder="0"></iframe></div>';
				var a = '</span>';
				return b+o+a;
			} else {
				return fail_request(str);
			}
		};
		output = applyFilter({"callerName":"searchGoogleDrive", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},
	
	searchSoundcloud : function(inner, ending) {
		var r1 = new RegExp(regex.soundcloud,'gi');
		if(!ending) {
			r1 = new RegExp(regex.soundcloud+'[\s]','gi');
		}
		substitution = function(str) {
			setTimeout( function() {
				SC.oEmbed(str, { auto_play: false }, function(oEmbed) {
					song_url = oEmbed.html.replace(/.*src="([^"]+)".*/,'$1');
					var w = song_url.replace(/auto_play=false/,"auto_play=true");
					var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
					var o = '<span class="deletable deletable-block" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
					o += '<div class="embed-responsive embed-responsive-16by9">';
					o += '<div onclick="loadIframe(this)" data-src="'+w+'" data-srcnoplay="'+song_url+'" class="launcher">';
					o += '<img src="'+xx+'" onerror="loadIframeNoPlay(this)"/>';
					o += '</div></div></span>';
					$('#'+str2md5(str)).html(o);
				});
			}, 50);
			var b = '<span class="deletable deletable-block" data-type="soundcloud" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
		};
		output = applyFilter({"callerName":"searchSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchVine : function(inner, ending) {
		var r1 = new RegExp(regex.vine ,'gi');
		if(!ending) {
			r1 = new RegExp(regex.vine+'[\s]','gi');
		}
		substitution = function(str) {
			var b = '<span class="deletable deletable-block" data-type="vine" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
			var a = '</span>';
			return b+o+a;
		};
		output = applyFilter({"callerName":"searchVine", "inner":inner, "regex":r1, "substitution":substitution});
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
			var o = '<span class="deletable deletable-block" data-type="dailymotion" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		};
		output = applyFilter({"callerName":"searchDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
		
	},

	searchVimeo : function(inner, ending) {
		var r1 = new RegExp(regex.vimeo,'gi');
		if(!ending) {
			r1 = new RegExp(regex.vimeo+'[\s]','gi');
		}
		console.log(r1);
		substitution = function(str) {
			var vid = str.replace(/(https?:\/\/vimeo.com\/)([^\s]+\/)?([0-9]+)$/,'$3');
			console.log(vid);
			var w = 'https://player.vimeo.com/video/'+vid+'?autoplay=1';
			var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
			var o = '<span class="deletable deletable-block" data-type="vimeo" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		};
		output = applyFilter({"callerName":"searchVimeo", "inner":inner, "regex":r1, "substitution":substitution});
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
			var o = '<span class="deletable deletable-block" data-type="youtube2" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		};
		output = applyFilter({"callerName":"searchYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
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
			var o = '<span class="deletable deletable-block" data-type="youtube" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
			o += '<div class="embed-responsive embed-responsive-16by9">';
			o += '<div onclick="loadIframe(this)" data-src="'+w+'" class="launcher">';
			o += '<img src="'+xx+'" onerror="loadIframe(this)"/>';
			o += '</div></div></span>';
			return o;
		};
		output = applyFilter({"callerName":"searchYoutube", "inner":inner, "regex":r1, "substitution":substitution});
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
				var o = '<span class="deletable deletable-block" data-type="video" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				o += '<div onclick="loadVideo(this)" data-src="'+video_link+'" class="launcher">';
				o += '<img src="'+xx+'" onerror="loadVideo(this)"/>';
				o += '</div></span>';
				return o;
		};
		output = applyFilter({"callerName":"searchVideo", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchImage : function(inner, ending) {
		var r1 = new RegExp(regex.image,'gi');
		if(!ending) {
			r1 = new RegExp(regex.image+'[\s]','gi');
		}
		substitution = function(str) {
				return '<span class="deletable deletable-block" data-type="image" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img class="inlineImage zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="'+str+'"/></span>';
		};
		output = applyFilter({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchGif : function(inner, ending) {
		var r1 = new RegExp(regex.gif,'gi');
		if(!ending) {
			r1 = new RegExp(regex.gif+'[\s]','gi');
		}
		substitution = function(str) {
				var xx = origin_url+'Data/miniature/'+str2md5(str)+'.jpg';
				var o = '<span class="deletable deletable-block" idata-type="gif" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
				o += '<div onclick="loadImage(this)" data-src="'+str+'" class="launcher">';
				o += '<img src="'+xx+'" onerror="loadImage(this)"/>';
				o += '</div></span>';
				return o;
		};
		output = applyFilter({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
		return output;
	},

	searchFile : function(inner, ending, viewer) {
		var r1 = new RegExp(regex.file,'gi');
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-type="file" data-src="'+str+'" contenteditable="false" id="'+str2md5(str.replace(/#.+$/,''))+'">'+genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"getFile", "viewer":viewer};
		callback = function(data) {
			console.log(data);
			console.log(data.html);
			balise = $('#'+str2md5(decodeURI(data.url)));
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.attr('data-filetype',data.filetype);
				balise.html(data.html);
			} else {
				balise.html(data.html);
				balise.append(genDelBtn());
			}
			console.log(viewer);
			if(viewer !== false) {
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
					balise.append(genDelBtn());
				}
		};
		output = applyFilter({"callerName":"searchFile", "inner":inner, "regex":r1, "substitution":substitution, "ajax_url":ajax_url, "ajax_var":ajax_var, "callback":callback, "fail":fail});
		return output;
	},

	searchLink : function(inner, ending, viewer) {
		var baliseId = createId();
		var r1 = new RegExp(regex.link,'gi');
		if(!ending) {
			r1 = new RegExp(regex.link+'[\s]','gi');
		}
		substitution = function(str) {
			output = '<span class="deletable deletable-block" data-type="link" data-src="'+str+'" contenteditable="false" id="'+baliseId+'">'+genAjaxLoader()+'</span>';
			return output;
		};
		var ajax_url = "Ajax/post.php";
		var ajax_var = {"action":"gen_preview"};
		callback = function(data) {
			console.log(data);
			e = open_graph_build(data, viewer);
			balise = $('*[data-src="'+data.url+'"]');
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		fail = function(url) {
			console.log("fail");
			e = fail_request(url);
			balise = $('#'+baliseId);
			if(balise.closest('.dynamicBox').hasClass('viewerBox')) {
				balise.html(e);
			} else {
				balise.html(e);
				balise.append(genDelBtn());
			}
		};
		output = applyFilter({"callerName":"searchLink", "inner":inner, "regex":r1, "substitution":substitution, "ajax_var":ajax_var, "ajax_url":ajax_url, "callback":callback, "fail":fail});
		return output;
	}
};
