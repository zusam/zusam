URL = window.URL || window.webkitURL;

// cf : http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
// scales the canvas by (float) scale < 1
// returns a new canvas containing the scaled image.
function downScaleCanvas(cv, scale) {
	if(scale == 1) { 
		return cv;
	}
	if(!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
	var sqScale = scale * scale; // square scale = area of source pixel within target
	var sw = cv.width; // source image width
	var sh = cv.height; // source image height
	var tw = Math.floor(sw * scale); // target image width
	var th = Math.floor(sh * scale); // target image height
	var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
	var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
	var tX = 0, tY = 0; // rounded tx, ty
	var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
	// weight is weight of current source point within target.
	// next weight is weight of current source point within next target's point.
	var crossX = false; // does scaled px cross its current px right border ?
	var crossY = false; // does scaled px cross its current px bottom border ?
	var sBuffer = cv.getContext('2d').
		getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
	var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
	var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
	/* untested !
	   var sA = 0;  //source alpha  */    

	for (sy = 0; sy < sh; sy++) {
		ty = sy * scale; // y src position within target
		tY = 0 | ty;     // rounded : target pixel's y
		yIndex = 3 * tY * tw;  // line index within target array
		crossY = (tY != (0 | ty + scale)); 
		if (crossY) { // if pixel is crossing botton target pixel
			wy = (tY + 1 - ty); // weight of point within target pixel
			nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
		}
		for (sx = 0; sx < sw; sx++, sIndex += 4) {
			tx = sx * scale; // x src position within target
			tX = 0 |  tx;    // rounded : target pixel's x
			tIndex = yIndex + tX * 3; // target pixel index within target array
			crossX = (tX != (0 | tx + scale));
			if (crossX) { // if pixel is crossing target pixel's right
				wx = (tX + 1 - tx); // weight of point within target pixel
				nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
			}
			sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
			sG = sBuffer[sIndex + 1];
			sB = sBuffer[sIndex + 2];

			/* !! untested : handling alpha !!
			   sA = sBuffer[sIndex + 3];
			   if (!sA) continue;
			   if (sA != 0xFF) {
			   sR = (sR * sA) >> 8;  // or use /256 instead ??
			   sG = (sG * sA) >> 8;
			   sB = (sB * sA) >> 8;
			   }
			 */
			if (!crossX && !crossY) { // pixel does not cross
				// just add components weighted by squared scale.
				tBuffer[tIndex    ] += sR * sqScale;
				tBuffer[tIndex + 1] += sG * sqScale;
				tBuffer[tIndex + 2] += sB * sqScale;
			} else if (crossX && !crossY) { // cross on X only
				w = wx * scale;
				// add weighted component for current px
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// add weighted component for next (tX+1) px                
				nw = nwx * scale
					tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
			} else if (crossY && !crossX) { // cross on Y only
				w = wy * scale;
				// add weighted component for current px
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// add weighted component for next (tY+1) px                
				nw = nwy * scale
					tBuffer[tIndex + 3 * tw    ] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
			} else { // crosses both x and y : four target points involved
				// add weighted component for current px
				w = wx * wy;
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// for tX + 1; tY px
				nw = nwx * wy;
				tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
				// for tX ; tY + 1 px
				nw = wx * nwy;
				tBuffer[tIndex + 3 * tw    ] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
				// for tX + 1 ; tY +1 px
				nw = nwx * nwy;
				tBuffer[tIndex + 3 * tw + 3] += sR * nw;
				tBuffer[tIndex + 3 * tw + 4] += sG * nw;
				tBuffer[tIndex + 3 * tw + 5] += sB * nw;
			}
		} // end for sx 
	} // end for sy

	// create result canvas
	var resCV = document.createElement('canvas');
	resCV.width = tw;
	resCV.height = th;
	var resCtx = resCV.getContext('2d');
	var imgRes = resCtx.getImageData(0, 0, tw, th);
	var tByteBuffer = imgRes.data;
	// convert float32 array into a UInt8Clamped Array
	var pxIndex = 0; //  
	for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
		tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
		tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
		tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
		tByteBuffer[tIndex + 3] = 255;
	}
	// writing result to canvas.
	resCtx.putImageData(imgRes, 0, 0);
	return resCV;
}

//name: Hermite resize
//about: Fast image resize/resample using Hermite filter with JavaScript.
//author: ViliusL
//demo: http://viliusle.github.io/miniPaint/
//function resample_hermite(canvas, W, H, W2, H2){
//	var time1 = Date.now();
//	W2 = Math.round(W2);
//	H2 = Math.round(H2);
//	var img = canvas.getContext("2d").getImageData(0, 0, W, H);
//	var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
//	var data = img.data;
//	var data2 = img2.data;
//	var ratio_w = W / W2;
//	var ratio_h = H / H2;
//	var ratio_w_half = Math.ceil(ratio_w/2);
//	var ratio_h_half = Math.ceil(ratio_h/2);
//
//	for(var j = 0; j < H2; j++){
//		for(var i = 0; i < W2; i++){
//			var x2 = (i + j*W2) * 4;
//			var weight = 0;
//			var weights = 0;
//			var weights_alpha = 0;
//			var gx_r = gx_g = gx_b = gx_a = 0;
//			var center_y = (j + 0.5) * ratio_h;
//			for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
//				var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
//				var center_x = (i + 0.5) * ratio_w;
//				var w0 = dy*dy //pre-calc part of w
//					for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
//						var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
//						var w = Math.sqrt(w0 + dx*dx);
//						if(w >= -1 && w <= 1){
//							//hermite filter
//							weight = 2 * w*w*w - 3*w*w + 1;
//							if(weight > 0){
//								dx = 4*(xx + yy*W);
//								//alpha
//								gx_a += weight * data[dx + 3];
//								weights_alpha += weight;
//								//colors
//								if(data[dx + 3] < 255)
//									weight = weight * data[dx + 3] / 250;
//								gx_r += weight * data[dx];
//								gx_g += weight * data[dx + 1];
//								gx_b += weight * data[dx + 2];
//								weights += weight;
//							}
//						}
//					}		
//			}
//			data2[x2]     = gx_r / weights;
//			data2[x2 + 1] = gx_g / weights;
//			data2[x2 + 2] = gx_b / weights;
//			data2[x2 + 3] = gx_a / weights_alpha;
//		}
//	}
//	console.log("hermite = "+(Math.round(Date.now() - time1)/1000)+" s");
//	canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
//	canvas.width = W2;
//	canvas.height = H2;
//	canvas.getContext("2d").putImageData(img2, 0, 0);
//}
//
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
		canvas2.style.width = canvas.style.height;
		canvas2.style.height = canvas.style.width;
		var ctx2 = canvas2.getContext('2d');
		ctx2.translate(canvas2.width/2,canvas2.height/2);
		ctx2.rotate(rotation);
		ctx2.translate(-canvas2.height/2,-canvas2.width/2);
		ctx2.drawImage(img,0,0,img.width,img.height);
		$(canvas).after(canvas2);
		$(canvas).remove();
		delete img;
		if($(id).find('.zone').length != 0) {
			retouche.initHandles(id);
		}
	};
	img.src = imgURL;
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
		//window.retouche.img = img;
		canvas = document.createElement('canvas');
		canvas.style.width = "100%";

		//var realw = Math.min(img.width, 1024);
		//var realh = Math.min(img.height, 1024);
		//var wi = Math.min(img.width, Math.min(1024,Math.min(window.innerWidth,window.innerHeight)-100));
		//var hi = Math.min(img.height, Math.min(1024,Math.min(window.innerWidth,window.innerHeight)-100));
		//console.log(img.height,img.width);
		//console.log(hi,wi);
		//var g = Math.min(wi/img.width, hi/img.height);
		//var realg = Math.min(realw/img.width, realh/img.height);
		//console.log(g);

		//canvas.width = img.width*realg;
		//canvas.height = img.height*realg;
		//canvas.style.width = img.width*g;
		//canvas.style.height = img.height*g;
		//ctx = canvas.getContext('2d');
		//ctx.drawImage(img,0,0,img.width*realg,img.height*realg);
		//canvas.dataset.w = img.width*realg;
		//canvas.dataset.h = img.height*realg;
		//URL.revokeObjectURL(img.src);
		//img = null;
		//delete img;

		// find new_width and new_height
		var realw = Math.min(img.width, 1024);
		var realh = Math.min(img.height, 1024);
		var realg = Math.min(realw/img.width, realh/img.height);
		//var new_width = img.width*realg;
		//var new_height = img.height*realg;

		//input canvas with img(img.width,img.height) & new_width, new_height
		canvas.width = img.width;
		canvas.height = img.height;
		//canvas.style.display = "none";
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		//retouche.resample_hermite(canvas, img.width, img.height, new_width, new_height);
		canvas = retouche.downScaleCanvas(canvas, realg);

		$(id).html(canvas);

		stopInput(id);
		
		if($(id).attr('data-action') == "changeAvatar") {
			retouche.addHandles(id);
		}

		var menu = $('<div class="menu"></div>');
		var cancelit = $('<div class="menu-cell"><button onclick="togglenewavatar()" class="material-button">Annuler</button></div>');
		var turnleft = $('<div class="menu-cell"><button onclick="retouche.turn(\''+id+'\',-Math.PI/2)" class="material-button"><i class="icon-ccw"></i></button></div>');
		var turnright = $('<div class="menu-cell"><button onclick="retouche.turn(\''+id+'\',Math.PI/2)" class="material-button"><i class="icon-cw"></i></button></div>');
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

	// downScaleCanvas
	c3 = retouche.downScaleCanvas(c2,g);


	//imgURL = c2.toDataURL("image/png");
	//delete c2; delete ctx2; 
	
	//c3 = document.createElement('canvas');
	//c3.width = parseInt(w*g);
	//c3.height = parseInt(h*g);
	//ctx3 = c3.getContext('2d');
	//ctx3.transform(g,0,0,g,0,0);

	//var htmlImage = new Image();
		//htmlImage.onload = function() {
		//	
		//ctx3.drawImage(htmlImage, 0, 0);
		//delete imgURL;
		imgURL = c3.toDataURL("image/png");
		delete c3; //delete ctx3; delete htmlImage;

		
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
	//};
	//htmlImage.src = imgURL;
	//console.log(imgURL);
}
