function start(id) {
	var aid = createNewAlbum();
	input = $('<input class="hidden" multiple="multiple" type="file" data-id="'+id+'" data-aid="'+aid+'"></input>');
	input.on('change', album.handleFileSelect);
	$('body').append(input);
	input.click();
}

function showAlbum(id, aid, max) {
	var content = $('<span data-src="{::'+aid+'::}" class="deletable slideshow" contenteditable="false"></span>');
	var img = $('<img class="current"/>');
	var progression = $('<span class="progression" data-max="'+max+'">1/'+max+'</span>');
	content.append(img).append(progression);
	$(id).append(content);	
}

// this function should be used when starting a new album
function createNewAlbum() {
	var albumId = createId();		
	window.albumFiles[albumId] = [];
	return albumId;
}

function handleFileSelect(evt) {
	var files = evt.target.files;
	var id = evt.target.dataset.id;
	var aid = evt.target.dataset.aid;
	album.showAlbum(id, aid, files.length);
	//console.log("change!");
	//console.log("nb files : "+files.length);
	for(i=0;i<files.length;i++) {
		file = files[i];
		//console.log("added : "+file.name);
		if(file.type.match('image.*')) {
			window.albumFiles[aid].push(file);
		}
	}
	//console.log(window.albumFiles[aid]);
	evt.target.value = null;
	if(window.sending < 1) {
		album.handleAddedPhotos(aid);
		window.sending = window.sending + 1;
	}
}

function handleAddedPhotos(aid) {
	if(window.albumFiles[aid] != null && window.albumFiles[aid].length > 0) {
		var f = window.albumFiles[aid].shift();
		//console.log(f);
		if(file.type.match('image.*')) {
			//console.log("handle image");
			//album.showSendNotification();
			//$("#send-notification").html('Sending '+f.name+' ('+window.albumFiles[aid].length+' remaining)');
			album.loadImage(f, aid);
		}
	} else {
		//album.hideSendNotification();
		window.sending = window.sending - 1;;
	}
}

function loadImage(file, aid) {
	console.log("load image "+file.name);
	var img = new Image();
	img.onload = function() {
		
		// show progression
		var alb = $('*[data-src="{::'+aid+'::}"]');
		alb.find('img').attr('src',img.src);
		var prog = alb.find('.progression');
		var n = parseInt(prog.attr('data-max')) - parseInt(window.albumFiles[aid].length);
		//console.log(prog.attr('data-max'));
		//console.log(window.albumFiles[aid].length);
		//console.log(n);
		prog.html(n+'/'+prog.attr('data-max'));

		console.log("img:"+img);
		var canvas = document.createElement('canvas');
		var w = Math.min(this.width, 1024);
		var h = Math.min(this.height, 1024);
		var g = Math.min(w/img.width, h/img.height);
		canvas.width = this.width*g;
		canvas.height = this.height*g;
		ctx = canvas.getContext('2d');
		ctx.drawImage(img,0,0,this.width*g,this.height*g);
		delete img;
		album.sendImage(canvas, file.name, aid);
	};
	img.src = URL.createObjectURL(file);
}

function sendImage(canvas, name, aid) {
	console.log("send image "+name);
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	var imgURL = canvas.toDataURL("image/png");
	delete canvas;
	var f = new FormData();
	f.append("image",dataURItoBlob(imgURL));
	f.append("uid",uid);
	f.append("fid",fid);
	f.append("fileId", createId());
	f.append("albumId",aid);
	f.append("action","addFileToAlbum");
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data);
				album.handleAddedPhotos(aid);
			},
		error: function(){ 
				console.log("fail"); 
				album.handleAddedPhotos(aid);
			},
		processData: false,
		contentType: false
	});
}

//function showSendNotification() {
//	var g = $('#send-notification');
//	if(!g.hasClass('active')) {
//		g.css('opacity','1');
//		g.css('z-index', '10');
//		g.addClass('active');
//	}
//}
//
//function hideSendNotification() {
//	var g = $('#send-notification');
//	if(g.hasClass('active')) {
//		g.css('z-index', '-1');
//		g.css('opacity','0');
//		g.removeClass('active');
//	}
//}
