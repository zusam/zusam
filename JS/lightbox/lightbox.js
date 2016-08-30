function searchNext(e) {

	// if there is an image dump, load images from it
	if($(e).closest(".deletable").next().next().attr('data-type') == "imageDump") {
		$(e).closest(".deletable").next().next().find('.imageDump').click();
	}

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

function resizeLightBox(lb) {

		lb = $(lb);
		var ratio = lb.attr('data-ratio');
		var lbw = window.innerWidth - 40;
		var lbh = Math.min(lbw/ratio, window.innerHeight - 40);
		lb.css({
			"width" : lbw + "px",
			"height" : lbh + "px",
		});
}


function enlighten(id) {

	var e = $(id)[0];

	// get file owner id
	var owner = $(e).closest('.deletable').attr('data-owner');

	console.log(e.dataset.lightbox);
	var lightbox_src;
	if(e.dataset.lightbox !== null) {
		lightbox_src = e.dataset.lightbox;	
	} else {
		lightbox_src = e.src;
	}

	// select the postimage if the device has a small screen.
	if(window.innerWidth < 640 && typeof(e.dataset.postimage) != "undefined" && e.dataset.postimage !== "") {
		lightbox_src = e.dataset.postimage;
	}

	var name = lightbox_src.replace(/.*\/([^\/]+)$/,'$1').replace(/(\.jpg).*/,'$1');
	
	lightbox.darken();

	//scroll to image
	var node = e;
	var yy = node.offsetTop - 10;
	console.log(node.parentNode);
	while(node.parentNode !== null && !node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
		node = node.parentNode;
		yy += node.offsetTop; 
	}
	
	// TODO select nano-content more precisely
	$('.nano-content')[0].scrollTop = yy;
	
	var next_img = lightbox.searchNext(e);
	var prev_img = lightbox.searchPrevious(e);

	var img = new Image();

	img.onload = function(){

		// check if this is a failed img
		if(lightbox_url !== "" && lightbox_url != this.src) {
			return;
		}

		var next;
		var prev;
		var turncw;
		var turnccw;

		var this_img = this;

		var nw = this.naturalWidth;
		var nh = this.naturalHeight;
		var ratio = nw/nh;

		$('body').css({'overflow':'hidden','max-height':'100%'});
		var lb = $('<div id="lightbox"></div>');
		if(typeof(prev_img) != "undefined") {
			$(prev_img).addClass("lightbox_prev");
			unveil(prev_img);
			prev = $('<div onclick="lightbox.enlighten(\'.lightbox_prev\')" class="prev"><i class="icon-left-open"></i></div>');
			$(window).on('keydown', function(e) {
				if(e.which == 37) {
					prev.click();
				}
			});
		}
		if(typeof(next_img) != "undefined") {
			$(next_img).addClass("lightbox_next");
			unveil(next_img);
			next = $('<div onclick="lightbox.enlighten(\'.lightbox_next\')" class="next"><i class="icon-right-open"></i></div>');
			$(window).on('keydown', function(e) {
				if(e.which == 39) {
					next.click();
				}
			});
		}
		var close = $('<div class="close material-shadow" onclick="lightbox.darken()"><i class="icon-cancel"></i></div>');
		$(this).attr('onclick','lightbox.darken()').addClass('zoomedImage');
		lb.attr('data-ratio',ratio);
		lightbox.resizeLightBox(lb);
		if(owner == $('#info').attr('data-uid')) {
			turncw = $('<button contentditable="false" class="material-shadow editIMG cw"><i class="icon-cw"></i></button>');
			turncw.on("click", function(evt) {
				evt.stopPropagation();
				console.log(e);
				lightbox.turnImage(e,90);
			});
			turnccw = $('<button contentditable="false" class="material-shadow editIMG ccw"><i class="icon-ccw"></i></button>');
			turnccw.on("click", function(evt) {
				evt.stopPropagation();
				console.log(e);
				lightbox.turnImage(e,270);
			});
		}
		var r = new RegExp("/"+origin_url+"/" ,'gi');
		var dl;
		if(lightbox_src.match(r)) {
			dl = $('<a class="material-shadow dl-button" target="_blank" href="download.php?fileId='+name.replace(/\.jpg/,'')+'">Télécharger</a>');
		} else {
			dl = $('<a class="material-shadow dl-button" href="'+lightbox_src+'" download="'+name+'">Télécharger</a>');
		}
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
	
	img.src = lightbox_src+"#"+Date.now();
	lightbox_url = img.src;
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

function turnImage(e, rotation) {
	$('#lightbox').css('opacity','0');
	
	f = new FormData();
	var fileid = $(e).closest('.deletable').attr('data-fileid');
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	f.append("uid",uid);
	f.append("fid",fid);
	f.append("rotation",rotation);
	f.append("action","turnImage");
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
					var src = this.src.replace(/\?.*/,'') + '?' + Math.floor(Date.now()/1000); 
					this.src = src;
					var pid = $('#post-viewer').attr('data-id');
					var mini = $('.post-mini[data-id="'+pid+'"] .miniature')[0];
					if(typeof(mini) != "undefined") {
						src = mini.src.replace(/\?.*/,'') + '?' + Math.floor(Date.now()/1000);
						mini.src = src;
					}
				});
				e.dataset.lightbox = e.dataset.lightbox.replace(/\?.*/,'') + '?' + Math.floor(Date.now()/1000);
				lightbox.enlighten(e);
			},
		error: function(){ console.log(uid,fid,action); },
		processData: false,
		contentType: false
	});
}
