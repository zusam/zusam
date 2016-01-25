function enlighten(id) {

	lightbox.darken();
	
	var e = $(id)[0];
	
	var next_img = $(id).parent().next().find('img')[0];
	var prev_img = $(id).parent().prev().find('img')[0];
	//console.log(next_src,prev_src);

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
		var prev_id = "#"+prev_img.parentNode.id+" img";
		unveil($(prev_id)[0]);
		var prev = $('<div onclick="lightbox.enlighten(\''+prev_id+'\')" class="prev"><i class="fa fa-arrow-left"></i></div>');
		$(window).on('keydown', function(e) {
			if(e.which == 37) {
				prev.click();
			}
		});
	}
	if(typeof(next_img) != "undefined") {
		var next_id = "#"+next_img.parentNode.id+" img";
		unveil($(next_id)[0]);
		var next = $('<div onclick="lightbox.enlighten(\''+next_id+'\')" class="next"><i class="fa fa-arrow-right"></i></div>');
		$(window).on('keydown', function(e) {
			if(e.which == 39) {
				next.click();
			}
		});
	}
	var close = $('<div class="close material-shadow" onclick="lightbox.darken()"><i class="fa fa-close"></i></div>');
	var img = $('<img class="zoomedImage" src="'+e.src+'"/>');
	lb.css({
		"top" : (window.innerHeight-height)/2 + "px",
		"left" : (window.innerWidth-width)/2 + "px",
		"width" : width + "px",
		"height" : height + "px",
	});
	//$(img).on("click",function(){darken()});
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
	$(window).off('keydown');
}
