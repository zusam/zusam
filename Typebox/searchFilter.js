
function endingDeezer(inner) {
	r1 = /[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/gi;
	substitution = function(str) {
		playlist_id = str.replace(/[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/,'$3');
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		output += '<div class="embed-responsive embed-responsive-16by9"><iframe scrolling="no" frameborder="0" allowTransparency="true" src="http://www.deezer.com/plugins/player?playlist=true&type=playlist&id='+playlist_id+'"></iframe></div>';
		output += '</span>';
		return output;
	}
	output = searchMatch({"callerName":"endingDeezer", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchDeezer(inner) {
	r1 = /[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)[\s]/gi;
	substitution = function(str) {
		playlist_id = str.replace(/[\s]*(https?:\/\/www.deezer.com\/)(playlist)\/(\d+)$/,'$3');
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		output += '<div class="embed-responsive embed-responsive-16by9"><iframe scrolling="no" frameborder="0" allowTransparency="true" src="http://www.deezer.com/plugins/player?playlist=true&type=playlist&id='+playlist_id+'"></iframe></div>';
		output += '</span>';
		return output;
	}
	output = searchMatch({"callerName":"searchDeezer", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingSoundcloud(inner) {
	r1 = /[\s]*(https?:\/\/soundcloud.com\/)([\w\-]+)\/([\w\-]+)(\/[\w\-]+)?$/gi;
	substitution = function(str) {
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img src="'+window.dir+'ajax-loader.gif"/></span>';
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
	output = searchMatch({"callerName":"endingSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchSoundcloud(inner) {
	r1 = /[\s]*(https?:\/\/soundcloud.com\/)([\w\-]+)\/([\w\-]+)(\/[\w\-]+)?[\s]/gi;
	substitution = function(str) {
		output = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img src="'+window.dir+'ajax-loader.gif"/></span>';
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
	output = searchMatch({"callerName":"searchSoundcloud", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingVine(inner) {
	r1 = /[\s]*(https?:\/\/vine.co\/v\/)([\w\-]+)$/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"endingVine", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchVine(inner) {
	r1 = /[\s]*(https?:\/\/vine.co\/v\/)([\w\-]+)[\s]/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"searchVine", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingDailymotion(inner) {
	r1 = /[\s]*(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)$/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(http:\/\/www.dailymotion.com\/video\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://www.dailymotion.com/embed/video/$2" allowfullscreen></iframe></div>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"endingDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchDailymotion(inner) {
	r1 = /[\s]*(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)[\s]/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://www.dailymotion.com/embed/video/$2" allowfullscreen></iframe></div>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"searchDailymotion", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingVimeo(inner) {
	r1 = /[\s]*(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)$/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://player.vimeo.com/video/$3" allowfullscreen></iframe></div>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"endingVimeo", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchVimeo(inner) {
	r1 = /[\s]*(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)[\s]/gi;
	substitution = function(str) {
		var b = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'">';
		var o = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/,'<div class="embed-responsive embed-responsive-16by9"><iframe seamless frameborder="0" class="embed-responsive-item" src="http://player.vimeo.com/video/$3" allowfullscreen></iframe></div>');
		var a = '</span>';
		return b+o+a;
	}
	output = searchMatch({"callerName":"searchVimeo", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingYoutube2(inner) {
	r1 = /[\s]*https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+$/gi;
	substitution = function(str) {
		var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/,"$2");
		var w = 'http://www.youtube.com/embed/'+v+'';
		var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless src="'+w+'"/><iframe></div></span>';
		return o;
	}
	output = searchMatch({"callerName":"endingYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchYoutube2(inner) {
	r1 = /[\s]*https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+[\s]/gi;
	substitution = function(str) {
		var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/,"$2");
		var w = 'http://www.youtube.com/embed/'+v+'?wmode=opaque';
		var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless src="'+w+'"/><iframe></div></span>';
		return o;
	}
	output = searchMatch({"callerName":"searchYoutube2", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingYoutube(inner) {
	r1 = /[\s]*https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+$/gi;
	substitution = function(str) {
		var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/,"$4");
		var w = 'http://www.youtube.com/embed/'+v+'';
		var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless  src="'+w+'"/><iframe></div></span>';
		return o;
	}
	output = searchMatch({"callerName":"endingYoutube", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchYoutube(inner) {
	r1 = /[\s]*https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+[\s]/gi;
	substitution = function(str) {
		var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/,"$4");
		var w = 'http://www.youtube.com/embed/'+v+'?wmode=opaque';
		var o = '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" seamless  src="'+w+'"/><iframe></div></span>';
		return o;
	}
	output = searchMatch({"callerName":"searchYoutube", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
	
}

function endingVideo(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#]+(\.mp4|\.webm)(\?\w*)?$/gi;
	substitution = function(str) {
			return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><video autoplay loop><source src="'+str+'"></video></span>';
	}
	/*
	callback = function(json) {
		$.ajax({
			url: "Ajax/getVideo.php",
			type: "GET",
			data: {"url=":json},
			success: function(data) {
				//console.log(data);
				balise = $('#'+str2md5(decodeURI(json)));
				//console.log(balise);
				balise.find("video").prepend('<source src="'+data+'">');
				balise.find("video").load();
			},
			error: function() {
				//console.log("could not retrieve video");
			}
		});
	};
	*/
	output = searchMatch({"callerName":"endingVideo", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchVideo(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#]+(\.mp4|\.webm)(\?\w*)?[\s]/gi;
	substitution = function(str) {
			return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><video autoplay loop><source src="'+str+'"></video></span>';
	}
	/*
	callback = function(json) {
		$.ajax({
			url: "Ajax/getVideo.php",
			type: "GET",
			data: {"url":json},
			success: function(data) {
				//console.log(data);
				balise = $('#'+str2md5(decodeURI(json)));
				//console.log(balise);
				balise.find("video").prepend('<source src="'+data+'">');
				balise.find("video").load();
			},
			error: function() {
				//console.log("could not retrieve video");
			}
		});
	};
	*/
	output = searchMatch({"callerName":"searchVideo", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
}

function endingImage(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#]+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)(\?\w*)?$/gi;
	substitution = function(str) {
			return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img onerror="this.src=\'http://www.nibou.eu/zusam/web/assets/no_image.png\'" src="'+str+'"/></span>';
	}
	output = searchMatch({"callerName":"endingImage", "inner":inner, "regex":r1, "substitution":substitution});
	return output;

}

function searchImage(inner) {
	r1 = /[\s]*https?:\/\/[\w\/=?~.%&+\-#\!]+(\.png|\.bmp|\.jpg|\.jpeg|\.gif)(\?\w*)?[\s]/gi;
	substitution = function(str) {
			return '<span class="deletable" data-src="'+str+'" contenteditable="false" id="'+str2md5(str)+'"><img onerror="this.src=\'http://www.nibou.eu/zusam/web/assets/no_image.png\'" src="'+str+'"/></span>';
	}
	output = searchMatch({"callerName":"searchImage", "inner":inner, "regex":r1, "substitution":substitution});
	return output;
}
