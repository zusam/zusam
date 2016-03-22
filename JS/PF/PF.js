function loadVideo(file,id) {
	if(file.type.match(/mp4|webm|ogg/)) {
		console.log("load video "+file.name);
		console.log(file);
		var vid = document.createElement('video');
		vid.controls = true;
		vid.autoplay = true;
		vid.onloadeddata = function() {
			$('*[data-id="'+id+'"]').remove();
			var fileId = createId();
			PF.showVideo(vid, id, fileId);
			PF.sendVideo(file, fileId);
		};
		vid.src = URL.createObjectURL(file);
	} else {
		var fileId = createId();
		PF.showPlaceHolderVideo(id, fileId);
		PF.sendVideo(file, fileId);
	}
}

function showPlaceHolderVideo(id, fileId) {
	var content = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	content.append('<div class="placeHolderVideo"><i class="icon-video"></i></div>');
	$(id).append(content);
	$(id).append('<div contenteditable="true"></div>');
}

function showVideo(vid, id, fileId) {
	var content = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	content.append(vid);
	$(id).append(content);
	$(id).append('<div contenteditable="true"></div>');
}

function sendVideo(vidBlob, fileId) {
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	f.append("video",vidBlob);
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addVideo");
	var progressBar = $('<div class="progressBar"><div class="progress"></div><div class="conversion"></div></div>');
	$('*[data-src="{:'+fileId+':}"]').append(progressBar);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data);
				console.log("sent !");
				window.sending = window.sending - 1;
			},
		error: function(){ 
				console.log("fail"); 
				window.sending = window.sending - 1;
			},
		processData: false,
		contentType: false,
		xhr: function(){
			var xhr = $.ajaxSettings.xhr();
			xhr.upload.onprogress = function(evt){ 
				var p = parseInt(evt.loaded/evt.total*100);
				//console.log('progress', p);
				content = $('*[data-src="{:'+fileId+':}"]');
				content.find('.progressBar .progress').css('width', p+"%");
			};
			xhr.upload.onload = function(){ 
				console.log('done !');
				setTimeout(function() {
					trackProgress(fileId);
				}, 500);
			}
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}

function trackProgress(fileId) {
	pid = setInterval(function() {
		console.log("Ajax/get.php?action=getProgess&fileId="+fileId);
		$.ajax({
			url: "Ajax/get.php",
			type: "GET",
			data: {"fileId":fileId, "action":"getProgress"},
			success: function(data){ 
					console.log(data);
					if(!data['progress']) {
						console.log("endTrack"); 
						clearInterval(pid);
						content = $('*[data-src="{:'+fileId+':}"]');
						content.find('.progressBar').remove();
					} else {
						content = $('*[data-src="{:'+fileId+':}"]');
						var duration = content.find('video')[0].duration;
						var time = (data['progress'].replace(/\r?\n|\r/g,""))/1000000;
						var p = time/duration*100;
						console.log(p);
						content.find('.progressBar .conversion').css('width',p+"%");
					}
				},
			error: function(){ 
					console.log("endTrack"); 
					clearInterval(pid);
					content = $('*[data-src="{:'+fileId+':}"]');
					content.find('.progressBar').remove();
				}
		});
	}, 1000);
}

function loadImage(file,id) {
	console.log("load image "+file.name);
	var img = new Image();
	img.onload = function() {
		console.log("img:"+img);
		canvas = document.createElement('canvas');

		//w = Math.min(this.width, 1024);
		//h = Math.min(this.height, 1024);
		//g = Math.min(w/img.width, h/img.height);
		//canvas.width = this.width*g;
		//canvas.height = this.height*g;
		//ctx = canvas.getContext('2d');
		//ctx.drawImage(img,0,0,this.width*g,this.height*g);
		//delete img;
		
		// find new_width and new_height
		var w = Math.min(this.width, 1024);
		var h = Math.min(this.height, 1024);
		var g = Math.min(w/img.width, h/img.height);
		//var new_width = this.width*g;
		//var new_height = this.height*g
		
		// hermite canvas
		canvas.width = img.width;
		canvas.height = img.height;
		//canvas.style.display = "none";
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		//retouche.resample_hermite(canvas, img.width, img.height, new_width, new_height);
		canvas = retouche.downScaleCanvas(canvas, g);
		
		var fileId = createId();
		PF.showImage(canvas, id, fileId);
		PF.sendImage(canvas, fileId);
	};
	img.src = URL.createObjectURL(file);
}

function showImage(canvas, id, fileId) {
	var content = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	content.append(canvas);
	$(id).append(content);	
	$(id).append('<div contenteditable="true"></div>');
}

function sendImage(canvas, fileId) {
	console.log("send image "+name);
	var imgURL = canvas.toDataURL("image/png");
	delete canvas;
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	f.append("image",dataURItoBlob(imgURL));
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addImage");
	var progressBar = $('<div class="progressBar"><div class="progress"></div></div>');
	$('*[data-src="{:'+fileId+':}"]').append(progressBar);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data);
				window.sending = window.sending - 1;
			},
		error: function(){ 
				console.log("fail"); 
				window.sending = window.sending - 1;
			},
		processData: false,
		contentType: false,
		xhr: function(){
			var xhr = $.ajaxSettings.xhr();
			xhr.upload.onprogress = function(evt){ 
				var p = parseInt(evt.loaded/evt.total*100);
				console.log('progress', p);
				content = $('*[data-src="{:'+fileId+':}"]');
				content.find('.progressBar .progress').css('width', p+"%");

			};
			xhr.upload.onload = function(){ 
				console.log('done !');
				setTimeout(function() {
					content = $('*[data-src="{:'+fileId+':}"]');
					content.find('.progressBar').remove();
				}, 1000);
			}
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}
