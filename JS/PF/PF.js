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

function fastLoadImage(file, id, fileId) {
	//if(positionInQueue == 1) {
	//	var img = new Image();
	//	img.onload = function() {
	//		var balise = $(id).find('.loading-balise');
	//		balise.find('.uploading-img').html(img);
	//	};
	//	img.src = URL.createObjectURL(file);
	//}
	PF.fastSendImage(file, fileId, id);
}

function fastSendImage(imgdata, fileId, id) {
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	f.append("image",imgdata);
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addImage");
	var progressBar = $('<div class="progressBar"><div class="progress"></div></div>');
	$('#'+fileId).append(progressBar);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data);
				window.sending = window.sending - 1;
				PF.startProcessingFileFromQueue();
				PF.fastShowImage(data.url, id, fileId);
			},
		error: function(){ 
				console.log("fail"); 
				window.sending = window.sending - 1;
				PF.startProcessingFileFromQueue();
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

function fastShowImage(imgdata, id, fileId) {
	var balise = $(id).find('.loading-balise');
	balise.find('.info-title').html("Envoi d'images en cours...");
	balise.find('.uploading-img').html('<img src="'+imgdata+'"/>');
	balise.find('.info-text').html(positionInQueue+'/'+(fileQueue.length+positionInQueue));
	balise.find('.progressBar .progress').css('width',100*positionInQueue/(fileQueue.length+positionInQueue)+"%");
	balise.find('span')[0].innerHTML += ' {:'+fileId+':} ';
}

function loadImage(file, id, fileId) {
	var img = new Image();
	img.onload = function() {
		//if(file.size > 3*1024*1024) {
			var w = Math.min(this.naturalWidth, 2048);
			var h = Math.min(this.naturalHeight, 2048);
			var g = Math.min(w/this.naturalWidth, h/this.naturalHeight);
			var nw = Math.floor(this.naturalWidth*g);
			var nh = Math.floor(this.naturalHeight*g);
			var imgdata = imageAlgs.resize_image(this, nw, nh);
			PF.showImage(imgdata, id, fileId);
			startProcessingFileFromQueue();
			PF.sendImage(imgdata, fileId);
		//} else {
		//	PF.showImage(this, id, fileId);
		//	startProcessingFileFromQueue();
		//	PF.sendImage(file, fileId);
		//}
	};
	img.src = URL.createObjectURL(file);
	var loading = $('<span data-filetype="jpg" data-type="file" id="'+fileId+'" data-txt="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false">'+genAjaxLoader()+'</span>');
	$(id).append(loading);
}

function showImage(imgdata, id, fileId) {
	var content = $('#'+fileId);
	if(content.length === 0) {
		content = $('<span data-filetype="jpg" data-type="file" id="'+fileId+'" data-txt="{:'+fileId+':}" class="deletable deletable-block" contenteditable="false"></span>');
	}
	if(typeof(imgdata) == "string") {
		var img = new Image();
		img.onload = function() {
			content.attr('data-width',img.naturalWidth);
			content.attr('data-height',img.naturalHeight);
			content.html(this);
			$(id).append(content);	
			$(id).append('<div contenteditable="true"></div>');
			typebox.refreshContent(false, $(id)[0]);
			
			//scroll to image
			var node = img;
			var yy = node.offsetTop - 10;
			console.log(node.parentNode);
			while(node.parentNode !== null && !node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
				node = node.parentNode;
				yy += node.offsetTop; 
			}
			// TODO select nano-content more precisely
			$('.nano-content')[0].scrollTop = yy;
		};
		img.src = imgdata;
	} else {
		content.attr('data-width',imgdata.naturalWidth);
		content.attr('data-height',imgdata.naturalHeight);
		content.html(imgdata);
		$(id).append(content);	
		$(id).append('<div contenteditable="true"></div>');
		typebox.refreshContent(false, $(id)[0]);
		//scroll to image
		var node = imgdata;
		var yy = node.offsetTop - 10;
		console.log(node.parentNode);
		while(node.parentNode !== null && !node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
			node = node.parentNode;
			yy += node.offsetTop; 
		}
		// TODO select nano-content more precisely
		$('.nano-content')[0].scrollTop = yy;
	}
}

function sendImage(imgdata, fileId) {
	var f = new FormData();
	var uid = $('#info').attr('data-uid');
	var imageblob;
	if(typeof(imgdata) == "string") {
		imageblob = dataURItoBlob(imgdata,'image/jpeg');
	} else {
		imageblob = imgdata;
	}
	console.log("sending file, size : "+imageblob.size);
	f.append("image",imageblob);
	f.append("fileId",fileId);
	f.append("uid",uid);
	f.append("action","addImage");
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
