// just get an image from the user and pass the file to the retouchebox
function changeAvatar() {
	r = $('#retoucheBox');
	r.attr('data-w',128);
	r.attr('data-h',128);
	r.attr('data-action',"changeAvatar");

	var input = $('<input id="avatarchangeinput" class="hidden" type="file" accept="image/*">');
	input.on('change', function(evt) {
		id = "#retoucheBox";
		console.log(id);
		var file = evt.target.files[0];
		console.log(file);
		retouche.loadImage(file, id);
		$('#avatarchangeinput').remove();
		pv = $('#newavatar');
		pv.addClass('active');
		pv.css('display','block');
		addMask("hideimageeditor()",0.75, 699, "imageeditormask");
	});
	$('body').append(input);
	$('#avatarchangeinput').click();
}

// turn the image of the canvas
function effectivTurn(id, rotation) {
	var canvas = $(id).find('canvas')[0];
	var cv = imageAlgs.turn(canvas, rotation);
	$(cv).attr('data-h', canvas.width);
	$(cv).attr('data-w', canvas.height);
	$(cv).css("width", canvas.style.height);
	$(cv).css("height", canvas.style.width);
	$(canvas).after(cv);
	$(canvas).remove();
	if($(id).find('.zone').length !== 0) {
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
	var z = $(id+' > .zone')[0];
	var x = document.querySelector(id).offsetHeight;
	var y = document.querySelector(id).offsetWidth;
	var w = parseInt($(id).attr('data-w'));
	var h = parseInt($(id).attr('data-h'));
	if(w === null || h === null) {
		w = h = 128;
	}
	setZone(z, (x-h)/2, (y-w)/2, w, h);
}

function addHandles(id) {
	var zone = $('<div data-movable="true" class="zone"></div>');
	var cachetop = $('<div class="cachetop cache"></div>');
	var cachebottom = $('<div class="cachebottom cache"></div>');
	var cacheleft = $('<div class="cacheleft cache"></div>');
	var cacheright = $('<div class="cacheright cache"></div>');
	var handletl = $('<div class="unselectable handlecontainer handletl"><div class="handle"></div></div>');
	var handletr = $('<div class="unselectable handlecontainer handletr"><div class="handle"></div></div>');
	var handlebl = $('<div class="unselectable handlecontainer handlebl"><div class="handle"></div></div>');
	var handlebr = $('<div class="unselectable handlecontainer handlebr"><div class="handle"></div></div>');

	$(id).append(zone);
	$(id).append(cachetop);
	$(id).append(cachebottom);
	$(id).append(cacheleft);
	$(id).append(cacheright);
	$(id).append(handletl);
	$(id).append(handletr);
	$(id).append(handlebl);
	$(id).append(handlebr);
	var z = $(id+' > .zone')[0];
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
		//canvas.style.width = "100%";

		var realw = Math.min(img.width, 2048);
		var realh = Math.min(img.height, 2048);
		var realg = Math.min(realw/img.width, realh/img.height);

		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		console.log(realg);
		if(realg < 0.9) {
			canvas = imageAlgs.downScaleCanvas(canvas, realg);
		}

		$(id).html(canvas);

		$(id+' .label').remove();
		$(id+' .underLabel').remove();
		$(id+' input').remove();
		
		if($(id).attr('data-action') == "changeAvatar") {
			retouche.addHandles(id);
		}

		var menu = $('<div class="menu"></div>');
		var cancelit = $('<div class="menu-cell"><button onclick="hidenewavatar()" class="material-button">Annuler</button></div>');
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
	var file = evt.target.files[0];
	if(file.type.match('image.*')) {
		$(id+' > i').removeClass('fa-photo').addClass('fa-cog fa-spin').css({'top':'calc(50% - 25px)','left':'calc(50% - 25px)'});	
		loadImage(file, id);
	}
}

// move the handles
function setZone(d, x, y, w, h) {

	var p = d.parentNode;
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
	d.style.width = w + "px";
	d.style.height = h + "px";

	// set the zone position
	d.style.top = x + "px";
	d.style.left = y + "px";

	// set caches position
	ct = d.nextSibling;
	ct.style.height = x + "px";
	
	cb = ct.nextSibling;
	cb.style.top = x + h + "px";
	
	cl = cb.nextSibling;
	cl.style.height = h + "px";
	cl.style.width = y + "px";
	cl.style.top = x + "px";

	cr = cl.nextSibling;
	cr.style.height = h + "px";
	cr.style.top = x + "px";
	cr.style.left = y + w + "px";
	
	//set handels position
	htl = cr.nextSibling;
	htl.style.top = x-12 + "px";
	htl.style.left = y-12 + "px";
	htr = htl.nextSibling;
	htr.style.top = x-12 + "px";
	htr.style.left = y-12+w + "px";
	hbl = htr.nextSibling;
	hbl.style.top = x-12+h + "px";
	hbl.style.left = y-12 + "px";
	hbr = hbl.nextSibling;
	hbr.style.top = x-12+h + "px";
	hbr.style.left = y-12+w + "px";
}

// record this event. In order to move the handles accordingly
function downEvent(e,d,t,a,id) {
	window.s = {};
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

//function stopInput(id) {
//	$(id+' .label').remove();
//	$(id+' .underLabel').remove();
//	$(id+' input').remove();
//}

// when the mouse moves, record it to move the handles accordingly
function moveEvent(e) {
	//if(typeof(window.s) != 'undefined' && window.s !== null && typeof(window.s.type) != 'undefined') { //window.s !== null && window.s.type !== null) {
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
		g = canvas.offsetWidth/canvas.width; //parseInt($(id).attr('data-w'));
		z = document.querySelector(id+' > .zone');
		l = parseInt(z.style.left)/g;
		t = parseInt(z.style.top)/g;
		w = parseInt(z.style.width)/g;
		h = parseInt(z.style.height)/g;

		data = ctx.getImageData(l, t, w, h);
		var nw = $(id).attr('data-w');
		var nh = $(id).attr('data-h');
		if(nw !== null && nh !== null) {
			g = Math.min(Math.max(w, nw)/w, Math.max(h, nh)/h);
		} else {
			g = Math.min(Math.max(w, 2048)/w, Math.max(h, 2048)/h);
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
	console.log(g);
	if(g < 0.9) {
		c3 = imageAlgs.downScaleCanvas(c2,g);
		imgURL = c3.toDataURL("image/png");
	} else {
		imgURL = c2.toDataURL("image/png");
	}
	
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
