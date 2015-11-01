function old_dataURItoBlob(dataURI) {
	// convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0) {
		byteString = atob(dataURI.split(',')[1]);
	} else {
		byteString = unescape(dataURI.split(',')[1]);
	}

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for(var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], {type:mimeString});
}

function dataURItoBlob(dataURI) {

	var byteString = atob(dataURI.split(",")[1]);
	var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ia], {type:mimeString});
}


URL = window.URL || window.webkitURL;

function turn(id, rotation) {
	var img = new Image();
	var canvas = $(id).find('canvas')[0];
	var ctx = canvas.getContext("2d");
	var imgURL = canvas.toDataURL("image/png");
	img.onload = function() {
		delete imgURL;
		var canvas2 = document.createElement('canvas');
		// rotation of values
		canvas2.height = img.width;
		canvas2.width = img.height;
		canvas2.dataset.h = img.width;
		canvas2.dataset.w = img.height;
		var ctx2 = canvas2.getContext('2d');
		ctx2.translate(canvas2.width/2,canvas2.height/2);
		ctx2.rotate(rotation);
		ctx2.translate(-canvas2.height/2,-canvas2.width/2);
		ctx2.drawImage(img,0,0,img.width,img.height);
		$(canvas).after(canvas2);
		$(canvas).remove();
		delete img;
	};
	img.src = imgURL;
}

function loadImage(file, id) {
console.log("retouche");
	img = new Image();
	img.onload = function() {
		window.retouche.img = img;
		canvas = document.createElement('canvas');
		var wi = Math.min(img.width, Math.min(1024,window.innerWidth*0.75));
		var hi = Math.min(img.height, Math.min(1024,window.innerHeight*0.75));
		console.log(img.height,img.width);
		console.log(hi,wi);
		var g = Math.min(wi/img.width, hi/img.height);
		console.log(g);
		canvas.width = img.width*g;
		canvas.height = img.height*g;
		ctx = canvas.getContext('2d');
		ctx.drawImage(img,0,0,img.width*g,img.height*g);
		canvas.dataset.w = img.width*g;
		canvas.dataset.h = img.height*g;
		URL.revokeObjectURL(img.src);
		img = null;
		delete img;
		$(id).html(canvas);

		stopInput(id);
		zone = $('<div data-movable="true" class="zone"></div>');
		cachetop = $('<div class="cachetop cache"></div>');
		cachebottom = $('<div class="cachebottom cache"></div>');
		cacheleft = $('<div class="cacheleft cache"></div>');
		cacheright = $('<div class="cacheright cache"></div>');
		handletl = $('<div class="unselectable handlecontainer handletl"><div class="handle"></div></div>');
		handletr = $('<div class="unselectable handlecontainer handletr"><div class="handle"></div></div>');
		handlebl = $('<div class="unselectable handlecontainer handlebl"><div class="handle"></div></div>');
		handlebr = $('<div class="unselectable handlecontainer handlebr"><div class="handle"></div></div>');

		$(id).append(zone);
		$(id).append(cachetop);
		$(id).append(cachebottom);
		$(id).append(cacheleft);
		$(id).append(cacheright);
		$(id).append(handletl);
		$(id).append(handletr);
		$(id).append(handlebl);
		$(id).append(handlebr);
		z = $(id+' > .zone')[0];
		setAsType(z,"movable",null,id);
		x = document.querySelector(id).offsetHeight;
		y = document.querySelector(id).offsetWidth;
		w = parseInt($(id).attr('data-w'));
		h = parseInt($(id).attr('data-h'));
		if(w == null || h == null) {
			w = h = 128;
		}
		setZone(z, (x-h)/2, (y-w)/2, w, h);

		z = $(id+' > .handletl')[0];
		setAsType(z,"resizeHandletl",id+" > .zone",id);
		z = $(id+' > .handletr')[0];
		setAsType(z,"resizeHandletr",id+" > .zone",id);
		z = $(id+' > .handlebl')[0];
		setAsType(z,"resizeHandlebl",id+" > .zone",id);
		z = $(id+' > .handlebr')[0];
		setAsType(z,"resizeHandlebr",id+" > .zone",id);


		var menu = $('<div class="menu"></div>');
		var cancelit = $('<div class="menu-cell"><button onclick="togglenewavatar()" class="material-button">Annuler</button></div>');
		var turnleft = $('<div class="menu-cell"><button onclick="retouche.turn(\''+id+'\',-Math.PI/2)" class="material-button"><i class="fa fa-rotate-left"></i></button></div>');
		var turnright = $('<div class="menu-cell"><button onclick="retouche.turn(\''+id+'\',Math.PI/2)" class="material-button"><i class="fa fa-rotate-right"></i></button></div>');
		var sendit = $('<div class="menu-cell"><button onclick="retouche.sendCanvas(\''+id+'\')" class="material-button">Envoyer</button></div>');
		menu.append(cancelit);
		menu.append(turnleft);
		menu.append(turnright);
		menu.append(sendit);
		$(id).parent().append(menu);
	};
	img.src = URL.createObjectURL(file);
}

function handleFileSelect(evt) {
	id = evt.data;
	console.log(id);
	var file = evt.target.files[0];
	if(file.type.match('image.*')) {
		$(id+' > i').removeClass('fa-photo').addClass('fa-cog fa-spin').css({'top':'calc(50% - 25px)','left':'calc(50% - 25px)'});	
		loadImage(file, id);
	}
}

function setZone(d, x, y, w, h) {

	p = d.parentNode;
	w = Math.max(w,64);
	h = Math.max(h,64);
	w = Math.min(w, p.offsetWidth);
	h = Math.min(h, p.offsetHeight);

	// keep the same format
	g = p.dataset.w/p.dataset.h;
	if(w/h != g) {
		w = g*h;
	}
	//h = w = Math.min(w,h); //square


	x = Math.max(x,0);
	y = Math.max(y,0);
	x = Math.min(x, p.offsetHeight - h);
	y = Math.min(y, p.offsetWidth - w);

	x = parseInt(x);
	y = parseInt(y);
	w = parseInt(w);
	h = parseInt(h);

	// set the size
	d.style.width = w;
	d.style.height = h;

	// set the zone position
	d.style.top = x;
	d.style.left = y;

	// set caches position
	ct = d.nextSibling;
	ct.style.height = x;
	
	cb = ct.nextSibling;
	cb.style.top = x + h;
	
	cl = cb.nextSibling;
	cl.style.height = h;
	cl.style.width = y;
	cl.style.top = x;

	cr = cl.nextSibling;
	cr.style.height = h;
	cr.style.top = x;
	cr.style.left = y + w;
	
	//set handels position
	htl = cr.nextSibling;
	htl.style.top = x-12;
	htl.style.left = y-12;
	htr = htl.nextSibling;
	htr.style.top = x-12;
	htr.style.left = y-12+w;
	hbl = htr.nextSibling;
	hbl.style.top = x-12+h;
	hbl.style.left = y-12;
	hbr = hbl.nextSibling;
	hbr.style.top = x-12+h;
	hbr.style.left = y-12+w;
}

function downEvent(e,d,t,a,id) {
	window.s = new Object();
	window.s.elmt = e.target;
	window.s.type = t;
	window.blockScroll = true;

	if(e.type == "mousedown") {
		cx = e.clientX;
		cy = e.clientY;
	} else {
		// e.type == touchstart
		cx = e.touches[0].clientX;
		cy = e.touches[0].clientY;

	}

	rect = e.target.getBoundingClientRect();
	offsetX = parseInt(cx - rect.left);
	offsetY = parseInt(cy - rect.top);

	window.s.offsetX = offsetX;
	window.s.offsetY = offsetY;
	window.s.clientX = parseInt(cx);
	window.s.clientY = parseInt(cy);

	window.s.action = document.querySelector(a);

	z = document.querySelector(id+' > .zone');
	window.s.t = parseInt(z.style.top); 
	window.s.l = parseInt(z.style.left); 
	window.s.w = z.offsetWidth;
	window.s.h = z.offsetHeight;
}

function stopInput(id) {
	$(id+' .label').remove();
	$(id+' .underLabel').remove();
	$(id+' input').remove();
}

function moveEvent(e) {
	if(window.s != null && window.s.type != null) {

		if(e.type == "mousemove") {
			cx = e.clientX;
			cy = e.clientY;
		} else {
			cx = e.touches[0].clientX;
			cy = e.touches[0].clientY;
		}

		if(window.s.type == "movable") {
			r = window.s.elmt.parentNode.getBoundingClientRect();
			t = cy - r.top - window.s.offsetY;
			l = cx - r.left - window.s.offsetX; 
			w = window.s.w;
			h = window.s.h;
			if(l != window.s.l || t != window.s.t) {
				setZone(window.s.elmt, t, l, w, h);
			}
		}
		if(window.s.type[0] == "r") {
			target = window.s.action;
			t = window.s.t;
			l = window.s.l;
			w = window.s.w;
			h = window.s.h;

			mx = cx - window.s.clientX;
			my = cy - window.s.clientY;
			g = 0;

			if(window.s.type == "resizeHandletl") {
				g = (-mx-my)/2;
				t =  t - g;
				l =  l - g;
			}
			if(window.s.type == "resizeHandletr") {
				g = (mx-my)/2;
				t =  t - g;
			}
			if(window.s.type == "resizeHandlebl") {
				g = (-mx+my)/2;
				l =  l - g;
			}
			if(window.s.type == "resizeHandlebr") {
				g = (mx+my)/2;
			}
			w = w+g;
			h = h+g;
			if(t != window.s.t || l != window.s.l || w != window.s.w || h != window.s.h) {
				setZone(target,t,l,w,h); 
			}
		}
	}
}


// EVENTS


function setAsType(d,t,a,id) {
	d.addEventListener("mousedown", function(e) {
		downEvent(e,d,t,a,id);
	},false);
	d.addEventListener("touchstart", function(e) {
		downEvent(e,d,t,a,id);
	},false);
}

function start(id) {
	document.body.addEventListener("mousemove", function(e) {
		moveEvent(e);
	},false);

	document.body.addEventListener("touchmove", function(e) {
		moveEvent(e);
	},false);

	document.body.addEventListener('mouseup', function() { 
		window.s = null; 
	},false);

	document.body.addEventListener("touchend", function() {
		window.s = null;
		window.blockScroll = false;
	},false);

	// block unwanted scrolling
	$(window).on('touchmove', function(e) {
		if(window.blockScroll) {
			e.preventDefault();
		}
	});

	restart(id);
}

function restart(id) {
	$(id+' input').off();
	$(id+' input').on('change', null, id, handleFileSelect);
}

function stop(id) {
	$(id+' > input').off();
}


// CANVAS

function sendCanvas(id) {
	canvas = document.querySelector(id+' canvas');
	var ctx = canvas.getContext('2d');
	g = canvas.offsetWidth/parseInt(canvas.dataset.w);
	z = document.querySelector(id+' > .zone');
	l = parseInt(z.style.left)/g;
	t = parseInt(z.style.top)/g;
	w = parseInt(z.style.width)/g;
	h = parseInt(z.style.height)/g;

	data = ctx.getImageData(l, t, w, h);
	g = Math.min(Math.max(w, 256)/w, Math.max(h, 256)/h);
	c2 = document.createElement('canvas');
	c2.width = parseInt(w);
	c2.height = parseInt(h);
	ctx2 = c2.getContext('2d');
	ctx2.putImageData(data, 0, 0);
	imgURL = c2.toDataURL("image/png");
	delete c2; delete ctx2; 
	
	c3 = document.createElement('canvas');
	c3.width = parseInt(w*g);
	c3.height = parseInt(h*g);
	ctx3 = c3.getContext('2d');
	ctx3.transform(g,0,0,g,0,0);

	var htmlImage = new Image();
	htmlImage.onload = function() {
		ctx3.drawImage(htmlImage, 0, 0);
		delete imgURL;
		imgURL = c3.toDataURL("image/png");
		delete c3; delete ctx3; delete htmlImage;
		
		f = new FormData();
		f.append("avatar",dataURItoBlob(imgURL));
		var uid = $('#info').attr('data-uid');
		var fid = $('#info').attr('data-forum');
		var action = $(id).attr('data-action');
		f.append("uid",uid);
		f.append("fid",fid);
		f.append("action",action);
		$.ajax({
			url: 'Ajax/post.php',
			type: "POST",
			data: f,
			success: function(data){ 
					console.log(data); 
					console.log("sent!");
					location.reload();
				},
			error: function(){ console.log(uid,fid,action); },
			processData: false,
			contentType: false
		});
		togglenewavatar(id);
	};
	htmlImage.src = imgURL;
}
