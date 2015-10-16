function loadImage(file,id) {
	console.log("load image "+file.name);
	var img = new Image();
	img.onload = function() {
		console.log("img:"+img);
		canvas = document.createElement('canvas');
		w = Math.min(this.width, 1024);
		h = Math.min(this.height, 1024);
		g = Math.min(w/img.width, h/img.height);
		canvas.width = this.width*g;
		canvas.height = this.height*g;
		ctx = canvas.getContext('2d');
		ctx.drawImage(img,0,0,this.width*g,this.height*g);
		delete img;
		$('*[data-id='+id+']').remove();
		var fileId = Math.random().toString(36).slice(2)+Date.now().toString(36); 
		PI.showImage(canvas,id, fileId);
		PI.sendImage(canvas, fileId);
	};
	img.src = URL.createObjectURL(file);
}

function showImage(canvas, id, fileId) {
	var content = $('<span data-src="{:'+fileId+':}" class="deletable" contenteditable="false"></span>');
	content.append(canvas);
	$(id).append(content);	
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
	var progressBar = $('<div id="progressBar" class="progressBar"><div class="progress"></div></div>');
	$('*[data-src="{:'+fileId+':}"]').append(progressBar);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data);
				window.sending = false;
			},
		error: function(){ 
				console.log("fail"); 
				window.sending = false;
			},
		processData: false,
		contentType: false,
		xhr: function(){
			var xhr = $.ajaxSettings.xhr();
			xhr.upload.onprogress = function(evt){ 
				console.log('progress', evt.loaded/evt.total*100);
				$('#progressBar progress').css('width', (100*evt.loaded/evt.total)+"%");

			};
			xhr.upload.onload = function(){ 
				console.log('done !');
				//$('#progressBar').remove();
			}
			return xhr;
		}
	});
	window.sending = true;
}
