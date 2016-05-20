function loadVideo(file,id, fileId) {
	if(file.type.match(/mp4|webm|ogg/)) {
		console.log("load video "+file.name);
		console.log(file);
		var vid = document.createElement('video');
		vid.controls = true;
		vid.autoplay = true;
		vid.onloadeddata = function() {
			startProcessingFileFromQueue();
			$('*[data-id="'+id+'"]').remove();
			var fileId = createId();
			PF.showVideo(vid, id, fileId);
			PF.sendVideo(file, fileId);
		};
		vid.src = URL.createObjectURL(file);
		startProcessingFileFromQueue();
	} else {
		PF.showPlaceHolderVideo(id, fileId);
		PF.sendVideo(file, fileId);
		startProcessingFileFromQueue();
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
	var progressBar = $('<div class="progressBar"><div class="progress"></div></div>');
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
				content.find('.progressBar').remove();
			};
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}

function loadGif(file,id, fileId) {
	console.log("load gif "+file.name);
	var img = new Image();
	img.onload = function() {
		startProcessingFileFromQueue();
		PF.showGif(img, id, fileId);
		PF.sendGif(file, fileId);
	};
	img.src = URL.createObjectURL(file);
	var loading = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"><div class="spinner"><div class="bg-orange bounce1"></div><div class="bg-orange bounce2"></div><div class="bg-orange bounce3"></div></div></div></span>');
	$(id).append(loading);
}

function showGif(img, id, fileId) {
	var content = $('span[data-src="{:'+fileId+':}"]');
	if(content.length === 0) {
		content = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	}
	content.html(img);
	$(id).append(content);	
	$(id).append('<div contenteditable="true"></div>');
}

function sendGif(file, fileId) {
	console.log("send gif "+name);
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	f.append("image",file);
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addGif");
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
			};
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}

function loadImage(file,id, fileId) {
	console.log("load image "+file.name);
	var img = new Image();
	img.onload = function() {
		console.log("img:"+img);
		canvas = document.createElement('canvas');

		// find new_width and new_height
		var w = Math.min(this.width, 2048);
		var h = Math.min(this.height, 2048);
		var g = Math.min(w/img.width, h/img.height);
		
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		console.log(g);
		if(g < 0.9) {
			canvas = imageAlgs.downScaleCanvas(canvas, g);
		}
		
		startProcessingFileFromQueue();
		PF.showImage(canvas, id, fileId);
		PF.sendImage(canvas, fileId);
	};
	img.src = URL.createObjectURL(file);
	var loading = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false">'+typebox.genAjaxLoader()+'</span>');
	$(id).append(loading);
}

function showImage(canvas, id, fileId) {
	var content = $('span[data-src="{:'+fileId+':}"]');
	if(content.length === 0) {
		content = $('<span data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	}
	content.html(canvas);
	$(id).append(content);	
	$(id).append('<div contenteditable="true"></div>');
}

function sendImage(canvas, fileId) {
	console.log("send image "+name);
	var imgURL = canvas.toDataURL("image/png");
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
			};
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}
