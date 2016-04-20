function searchNext(e) {
	// search in the same post
	var img = $(e).closest(".deletable").nextAll('.deletable').first().find('img.zoomPossible')[0];
	
	if(typeof(img) == "undefined") {
		// search in other posts
		var post = $(e).closest(".post").nextAll('.post').first();
		var i = 0;
		while(i < 30 && typeof(img) == "undefined" && post.length > 0) {
			img = post.find('.deletable img.zoomPossible')[0];
			post = post.nextAll('.post').first();
			i++;
		}
		console.log("max iterations: "+i);
	}
	return img;
}

function searchPrevious(e) {
	// search in the same post
	var img = $(e).closest(".deletable").prevAll('.deletable').first().find('img.zoomPossible')[0];
	
	if(typeof(img) == "undefined") {
		// search in other posts
		var post = $(e).closest(".post").prevAll('.post').first();
		var i = 0;
		while(i < 30 && typeof(img) == "undefined" && post.length > 0) {
			img = post.find('.deletable img.zoomPossible').last()[0];
			post = post.prevAll('.post').first();
			i++;
		}
		console.log("max iterations: "+i);
	}
	return img;
}


function enlighten(id, refresh) {

	var e = $(id)[0];

	// get file owner id
	var owner = $(e).closest('.deletable').attr('data-owner');

	console.log(e.dataset.lightbox);
	if(e.dataset.lightbox != null) {
		var lightbox_src = e.dataset.lightbox;	
	} else {
		var lightbox_src = e.src;
	}
	if(refresh) {
		lightbox_src = lightbox_src.replace(/\?.*/,'') + "?" + Date.now();
	} else {
		lightbox_src = lightbox_src.replace(/\?.*/,'');// + "?" + Date.now();
	}

	var name = lightbox_src.replace(/.*\/([^\/]+)$/,'$1');
	
	lightbox.darken();

	//scroll to image
	var node = e;
	var yy = node.offsetTop - 10;
	console.log(node.parentNode);
	while(node.parentNode != null && !node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
		node = node.parentNode;
		yy += node.offsetTop; 
	}
	console.log(node);
	console.log(node.parentNode);
	console.log(yy);
	console.log(owner == $('#info').attr('data-uid'));
	// TODO select nano-content more precisely
	$('.nano-content')[0].scrollTop = yy;
	
	var next_img = lightbox.searchNext(e);
	var prev_img = lightbox.searchPrevious(e);

	var img = new Image();

	img.onload = function(){

		var this_img = this;

		var nw = this.naturalWidth;
		var nh = this.naturalHeight;
		var ratio = Math.max(nw/nh, 1.3);
		console.log(ratio, nw/nh);

		//var width = Math.min(nw,(window.innerWidth-10)*0.95);
		//nh = width/nw * nh;
		//var height = Math.min(nh,(window.innerHeight-10)*0.95);
		//width = height/nh * width;

		$('body').css({'overflow':'hidden','max-height':'100%'});
		var lb = $('<div id="lightbox"></div>');
		if(typeof(prev_img) != "undefined") {
			$(prev_img).addClass("lightbox_prev");
			unveil(prev_img);
			var prev = $('<div onclick="lightbox.enlighten(\'.lightbox_prev\')" class="prev"><i class="icon-left-open"></i></div>');
			$(window).on('keydown', function(e) {
				if(e.which == 37) {
					prev.click();
				}
			});
		}
		if(typeof(next_img) != "undefined") {
			$(next_img).addClass("lightbox_next");
			unveil(next_img);
			var next = $('<div onclick="lightbox.enlighten(\'.lightbox_next\')" class="next"><i class="icon-right-open"></i></div>');
			$(window).on('keydown', function(e) {
				if(e.which == 39) {
					next.click();
				}
			});
		}
		var close = $('<div class="close material-shadow" onclick="lightbox.darken()"><i class="icon-cancel"></i></div>');
		$(this).attr('onclick','lightbox.darken()').addClass('zoomedImage');
		var lbw = window.innerWidth - 40;
		var lbh = Math.min(lbw/ratio, window.innerHeight - 40);
		lbw = lbh * ratio;
		lb.css({
			//"top" : (window.innerHeight-height)/2 + "px",
			//"left" : (window.innerWidth-width)/2 + "px",
			"width" : lbw + "px",
			"height" : lbh + "px",
		});
		if(owner == $('#info').attr('data-uid')) {
			var turncw = $('<button contentditable="false" class="material-shadow editIMG cw"><i class="icon-cw"></i></button>');
			turncw.on("click", function(evt) {
				evt.stopPropagation();
				console.log(e);
				lightbox.turnAndSend(e,"cw",this_img);
			});
			var turnccw = $('<button contentditable="false" class="material-shadow editIMG ccw"><i class="icon-ccw"></i></button>');
			turnccw.on("click", function(evt) {
				evt.stopPropagation();
				console.log(e);
				lightbox.turnAndSend(e,"ccw",this_img);
			});
		}
		var dl = $('<a class="material-shadow dl-button" href="'+lightbox_src+'" download="'+name+'">Télécharger</a>');
		//var dl = $('<form method="get" action="'+lightbox_src+'"><button class="material-shadow dl-button" type="submit">Télécharger</button></form>');
		if($('.lightbox-mask').length > 0)  {
			lb.append(next).append(prev).append(this_img).append(close).append(turncw).append(turnccw).append(dl);
			$('body').append(lb);
			$(window).on('keydown',function(evt) {
				if(evt.which == 27) {
					lightbox.darken();
				}
			});
		}
	};
	
	img.src = lightbox_src;
	mask = $('<div class="lightbox-mask" onclick="lightbox.darken()"></div>');
	mask.append('<div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div>');
	$('body').append(mask);
}

function darken() {
	$('#lightbox').remove();
	$('.lightbox-mask').remove();
	$('.lightbox_next').removeClass('lightbox_next');
	$('.lightbox_prev').removeClass('lightbox_prev');
	$(window).off('keydown');
}

// turn the image
function turnAndSend(e, rotation, img) {
	
	$('#lightbox').css('opacity','0');

	// init canvas
	canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	
	// process canvas
	canvas = imageAlgs.turn(canvas, rotation);

	var action = "addImage";
	var fileid = $(e).closest('.deletable').attr('data-fileid');

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
				lightbox.enlighten(e, true);
			},
		error: function(){ console.log(uid,fid,action); },
		processData: false,
		contentType: false
	});
}
