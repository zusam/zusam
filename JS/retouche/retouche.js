URL = window.URL || window.webkitURL;

function turnAndSend(img, rotation) {

	// init canvas
	canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	
	// process canvas
	canvas = retouche.turn(canvas, rotation);

	var action = "addImage";
	var fileid = $(img).closest('.deletable').attr('data-fileid');

	imgURL = canvas.toDataURL("image/png");
	
	f = new FormData();
	f.append("image",dataURItoBlob(imgURL));
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	f.append("uid",uid);
	f.append("fid",fid);
	f.append("action",action);
	console.log(action);
	f.append("fileId",fileid);
	$.ajax({
		url: 'Ajax/post.php',
		type: "POST",
		data: f,
		success: function(data){ 
				console.log(data); 
				console.log("sent!");
				// replace all sent images
				$('.deletable[data-fileid="'+fileid+'"] img').each(function(){
					var src = this.src.replace(/\?.*/,'') + '?' + Date.now(); 
					this.src = src;
					var pid = $('#post-viewer').attr('data-id');
					var mini = $('.post-mini[data-id="'+pid+'"] .miniature')[0];
					if(typeof(mini) !=! "undefined") {
						src = mini.src.replace(/\?.*/,'') + '?' + Date.now();
						mini.src = src;
					}
				});
				lightbox.enlighten(img);
			},
		error: function(){ console.log(uid,fid,action); },
		processData: false,
		contentType: false
	});
}

function effectivTurn(id, rotation) {
	var canvas = $(id).find('canvas')[0];
	var cv = retouche.turn(canvas, rotation);
	$(cv).attr('data-h', canvas.width);
	$(cv).attr('data-w', canvas.height);
	$(cv).css("width", canvas.style.height);
	$(cv).css("height", canvas.style.width);
	$(canvas).after(cv);
	$(canvas).remove();
	if($(id).find('.zone').length != 0) {
		retouche.initHandles(id);
	}
}

function turnccw(id) {
	effectivTurn(id, "ccw");
}
function turncw(id) {
	effectivTurn(id, "cw");
}

function initHandles(id) {
	z = $(id+' > .zone')[0];
	x = document.querySelector(id).offsetHeight;
	y = document.querySelector(id).offsetWidth;
	w = parseInt($(id).attr('data-w'));
	h = parseInt($(id).attr('data-h'));
	if(w == null || h == null) {
		w = h = 128;
	}
	setZone(z, (x-h)/2, (y-w)/2, w, h);
}

function addHandles(id) {
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
	
	retouche.initHandles(id);

	z = $(id+' > .handletl')[0];
	setAsType(z,"resizeHandletl",id+" > .zone",id);
	z = $(id+' > .handletr')[0];
	setAsType(z,"resizeHandletr",id+" > .zone",id);
	z = $(id+' > .handlebl')[0];
	setAsType(z,"resizeHandlebl",id+" > .zone",id);
	z = $(id+' > .handlebr')[0];
	setAsType(z,"resizeHandlebr",id+" > .zone",id);
}

function loadCanvas(img, id) {
		canvas = document.createElement('canvas');
		canvas.style.width = "100%";

		var realw = Math.min(img.width, 1024);
		var realh = Math.min(img.height, 1024);
		var realg = Math.min(realw/img.width, realh/img.height);

		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		canvas = retouche.downScaleCanvas(canvas, realg);

		$(id).html(canvas);

		stopInput(id);
		
		if($(id).attr('data-action') == "changeAvatar") {
			retouche.addHandles(id);
		}

		var menu = $('<div class="menu"></div>');
		var cancelit = $('<div class="menu-cell"><button onclick="togglenewavatar()" class="material-button">Annuler</button></div>');
		var turnleft = $('<div class="menu-cell"><button onclick="retouche.turnccw(\''+id+'\')" class="material-button"><i class="icon-ccw"></i></button></div>');
		var turnright = $('<div class="menu-cell"><button onclick="retouche.turncw(\''+id+'\')" class="material-button"><i class="icon-cw"></i></button></div>');
		var sendit = $('<div class="menu-cell"><button onclick="retouche.sendCanvas(\''+id+'\')" class="material-button">Envoyer</button></div>');
		menu.append(cancelit);
		menu.append(turnleft);
		menu.append(turnright);
		menu.append(sendit);
		$(id).parent().append(menu);
}

function loadImage(file, id) {
	console.log("retouche");
	img = new Image();
	img.onload = function() {
		retouche.loadCanvas(img, id);
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

function set(id, src) {
	var img = new Image();
	img.onload = function() {
		loadCanvas(img, id);
	};
	img.src = src;
}


// CANVAS

function sendCanvas(id) {
	canvas = document.querySelector(id+' canvas');
	var ctx = canvas.getContext('2d');
	var action = $(id).attr('data-action');
	var arg = $(id).attr('data-arg');

	if(action == "changeAvatar") {
		g = canvas.offsetWidth/parseInt(canvas.dataset.w);
		z = document.querySelector(id+' > .zone');
		l = parseInt(z.style.left)/g;
		t = parseInt(z.style.top)/g;
		w = parseInt(z.style.width)/g;
		h = parseInt(z.style.height)/g;

		data = ctx.getImageData(l, t, w, h);
		var nw = $(id).attr('data-w');
		var nh = $(id).attr('data-h');
		if(nw != null && nh != null) {
			g = Math.min(Math.max(w, nw)/w, Math.max(h, nh)/h);
		} else {
			g = Math.min(Math.max(w, 1024)/w, Math.max(h, 1024)/h);
		}
	} else {
		g = 1;
		w = $(id).find('canvas').attr('data-w');
		h = $(id).find('canvas').attr('data-h');
		data = ctx.getImageData(0, 0, canvas.dataset.w, canvas.dataset.h);
	}
	
	console.log(w,h);
	
	c2 = document.createElement('canvas');
	c2.width = parseInt(w);
	c2.height = parseInt(h);
	ctx2 = c2.getContext('2d');
	ctx2.putImageData(data, 0, 0);

	c3 = retouche.downScaleCanvas(c2,g);
	imgURL = c3.toDataURL("image/png");
	delete c3; 
	
	f = new FormData();
	f.append("image",dataURItoBlob(imgURL));
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	f.append("uid",uid);
	f.append("fid",fid);
	f.append("action",action);
	console.log(action);
	f.append("fileId",arg);
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
	var loading_retouche = $('<div class="loading-retouche"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>');
	$(id).parent().append(loading_retouche);
}
