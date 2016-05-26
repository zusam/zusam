function loadVideo(file,id, fileId) {
	if(file.type.match(/mp4|webm|ogg/)) {
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
	var content = $('<span data-filetype="webm" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	content.append('<div class="placeHolderVideo"><i class="icon-video"></i></div>');
	$(id).append(content);
	$(id).append('<div contenteditable="true"></div>');
}

function showVideo(vid, id, fileId) {
	var content = $('<span data-filetype="webm" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
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
	$('#'+fileId).append(progressBar);
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
				content = $('#'+fileId);
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
	var img = new Image();
	img.onload = function() {
		startProcessingFileFromQueue();
		PF.showGif(img, id, fileId);
		PF.sendGif(file, fileId);
	};
	img.src = URL.createObjectURL(file);
	var loading = $('<span data-filetype="webm" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"><div class="spinner"><div class="bg-orange bounce1"></div><div class="bg-orange bounce2"></div><div class="bg-orange bounce3"></div></div></div></span>');
	$(id).append(loading);
}

function showGif(img, id, fileId) {
	var content = $('#'+fileId);
	if(content.length === 0) {
		content = $('<span data-filetype="webm" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	}
	content.html(img);
	$(id).append(content);	
	$(id).append('<div contenteditable="true"></div>');
}

function sendGif(file, fileId) {
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	f.append("image",file);
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addGif");
	var progressBar = $('<div class="progressBar"><div class="progress"></div></div>');
	$('#'+fileId).append(progressBar);
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
				content = $('#'+fileId);
				content.find('.progressBar .progress').css('width', p+"%");

			};
			xhr.upload.onload = function(){ 
				console.log('done !');
				setTimeout(function() {
					content = $('#'+fileId);
					content.find('.progressBar').remove();
				}, 1000);
			};
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}

function loadImage(file, id, fileId) {
	var img = new Image();
	img.onload = function() {
		// find new_width and new_height
		var w = Math.min(this.naturalWidth, 2048);
		var h = Math.min(this.naturalHeight, 2048);
		var g = Math.min(w/this.naturalWidth, h/this.naturalHeight);
		//
		//canvas.width = img.width;
		//canvas.height = img.height;
		//var ctx = canvas.getContext('2d');
		//ctx.drawImage(img, 0, 0);
		//console.log(g);
		//if(g < 0.9) {
		//	canvas = imageAlgs.downScaleCanvas(canvas, g);
		//}

		console.log(g,file.size)
		if(g < 0.9 && file.size > 1024*1024) {
		console.log("yes");
			var nw = Math.floor(this.naturalWidth*g);
			var nh = Math.floor(this.naturalHeight*g);
			var imgdata = imageAlgs.resize_image(this, nw, nh);
			PF.showImage(imgdata, id, fileId);
			startProcessingFileFromQueue();
			PF.sendImage(imgdata, fileId);
		} else {
		console.log("no");
			PF.showImage(this, id, fileId);
			startProcessingFileFromQueue();
			PF.sendImage(file, fileId);
		}
	};
	img.src = URL.createObjectURL(file);
	var loading = $('<span data-filetype="jpg" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false">'+genAjaxLoader()+'</span>');
	$(id).append(loading);
}

function showImage(imgdata, id, fileId) {
	var content = $('#'+fileId);
	if(content.length === 0) {
		content = $('<span data-filetype="jpg" data-type="file" id="'+fileId+'" data-src="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	}
	if(typeof(imgdata) == "string") {
		var img = new Image();
		img.onload = function() {
			//var c = document.createElement('canvas');
			//var w = Math.min(img.naturalWidth, 300);
			//var h = Math.min(img.naturalHeight, 300);
			//var g = Math.min(w/img.naturalWidth, h/img.naturalHeight);
			//var nw = Math.floor(img.naturalWidth*g);
			//var nh = Math.floor(img.naturalHeight*g);
			//c.width = nw;
			//c.height = nh;
			//ctx = c.getContext('2d');
			//ctx.drawImage(img, 0, 0, nw, nh);
			//content.html(c);
			content.attr('data-width',img.naturalWidth);
			content.attr('data-height',img.naturalHeight);
			//$(id).append(content);	
			content.html(this);
			$(id).append(content);	
			$(id).append('<div contenteditable="true"></div>');
			typebox.arrangeDynamicBox($(id)[0]);
		}
		img.src = imgdata;
	} else {
		content.attr('data-width',imgdata.naturalWidth);
		content.attr('data-height',imgdata.naturalHeight);
		content.html(imgdata);
		$(id).append(content);	
		$(id).append('<div contenteditable="true"></div>');
		typebox.arrangeDynamicBox($(id)[0]);
	}
}

function sendImage(imgdata, fileId) {
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	if(typeof(imgdata) == "string") {
		var imageblob = dataURItoBlob(imgdata,'image/jpeg');
		console.log(imageblob.size);
	} else {
		var imageblob = imgdata;
	}
	f.append("image",imageblob);
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
				content = $('#'+fileId);
				content.find('.progressBar .progress').css('width', p+"%");

			};
			xhr.upload.onload = function(){ 
				console.log('done !');
				setTimeout(function() {
					content = $('#'+fileId);
					content.find('.progressBar').remove();
				}, 1000);
			};
			return xhr;
		}
	});
	window.sending = window.sending + 1;
}
