function enlighten(id) {

	var e = $(id)[0];

	if(e.dataset.lightbox != null) {
		var lightbox_src = e.dataset.lightbox;	
	} else {
		var lightbox_src = e.src;
	}
	
	lightbox.darken();
	
	var next_img = $(e).closest(".deletable").next().find('img.zoomPossible')[0];
	if(typeof(next_img) == "undefined") {
		next_img = $(e).closest(".post").next().find('.deletable img.zoomPossible')[0];
	}
	var prev_img = $(e).closest(".deletable").prev().find('img.zoomPossible')[0];
	if(typeof(prev_img) == "undefined") {
		prev_img = $(e).closest(".post").prev().find('.deletable img.zoomPossible').last()[0];
	}

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
