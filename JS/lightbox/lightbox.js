function searchNext(e) {
	var img = $(e).closest(".deletable").next().find('img.zoomPossible')[0];
	
	// search in other posts
	var post = $(e).closest(".post").nextUntil('post');
	var i = 0;
	while(i < 30 && typeof(img) == "undefined" && post.length > 0) {
		post = $(post.get(0));
		img = post.find('.deletable img.zoomPossible')[0];
		post = post.nextUntil('post');
		i++;
	}
	console.log("max iterations: "+i);
	return img;
}

function searchPrevious(e) {
	var img = $(e).closest(".deletable").prev().find('img.zoomPossible')[0];
	
	// search in other posts
	var post = $(e).closest(".post").prevUntil('post');
	var i = 0;
	while(i < 30 && typeof(img) == "undefined" && post.length > 0) {
		post = $(post.get(0));
		img = post.find('.deletable img.zoomPossible')[0];
		post = post.prevUntil('post');
		i++;
	}
	console.log("max iterations: "+i);
	return img;
}


function enlighten(id) {

	var e = $(id)[0];

	if(e.dataset.lightbox != null) {
		var lightbox_src = e.dataset.lightbox;	
	} else {
		var lightbox_src = e.src;
	}
	
	lightbox.darken();

	//scroll to image
	var node = e;
	var yy = node.offsetTop - 10;
	while(!node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
		node = node.parentNode;
		yy += node.offsetTop; 
	}
	// TODO select nano-content more precisely
	$('.nano-content')[0].scrollTop = yy;
	
	var next_img = lightbox.searchNext(e);
	var prev_img = lightbox.searchPrevious(e);

	var nw = e.naturalWidth;
	var nh = e.naturalHeight;

	var width = Math.min(nw,(window.innerWidth-10)*0.95);
	nh = width/nw * nh;
	var height = Math.min(nh,(window.innerHeight-10)*0.95);
	width = height/nh * width;

	mask = $('<div class="lightbox-mask" onclick="lightbox.darken()"></div>');
	$('body').append(mask);
	$('body').css({'overflow':'hidden','max-height':'100%'});
	var lb = $('<div id="lightbox"></div>');
	if(typeof(prev_img) != "undefined") {
		$(prev_img).addClass("lightbox_prev");
		unveil(prev_img);
		var prev = $('<div onclick="lightbox.enlighten(\'.lightbox_prev\')" class="prev"><i class="fa fa-arrow-left"></i></div>');
		$(window).on('keydown', function(e) {
			if(e.which == 37) {
				prev.click();
			}
		});
	}
	if(typeof(next_img) != "undefined") {
		$(next_img).addClass("lightbox_next");
		unveil(next_img);
		var next = $('<div onclick="lightbox.enlighten(\'.lightbox_next\')" class="next"><i class="fa fa-arrow-right"></i></div>');
		$(window).on('keydown', function(e) {
			if(e.which == 39) {
				next.click();
			}
		});
	}
	var close = $('<div class="close material-shadow" onclick="lightbox.darken()"><i class="fa fa-close"></i></div>');
	var img = $('<img onclick="lightbox.darken()" class="zoomedImage" src="'+lightbox_src+'"/>');
	lb.css({
		"top" : (window.innerHeight-height)/2 + "px",
		"left" : (window.innerWidth-width)/2 + "px",
		"width" : width + "px",
		"height" : height + "px",
	});
	lb.append(next).append(prev).append(img).append(close);
	$('body').append(lb);
	$(window).on('keydown',function(e) {
		if(e.which == 27) {
			lightbox.darken();
		}
	});
}

function darken() {
	$('#lightbox').remove();
	$('.lightbox-mask').remove();
	$('.lightbox_next').removeClass('lightbox_next');
	$('.lightbox_prev').removeClass('lightbox_prev');
	$(window).off('keydown');
}
