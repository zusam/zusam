function enlighten(id) {

	lightbox.darken();
	
	var e = $(id)[0];
	var nw = e.naturalWidth;
	var nh = e.naturalHeight;

	var width = Math.min(nw,window.innerWidth*0.9);
	nh = width/nw * nh;
	var height = Math.min(nh,window.innerHeight*0.9);
	width = height/nh * width;

	mask = $('<div class="lightbox-mask" onclick="lightbox.darken()"></div>');
	$('body').append(mask);
	$('body').css({'overflow':'hidden','max-height':'100%'});
	var img = $('<img class="zoomedImage" src="'+e.src+'"/>');
	img.css({
		"top" : (window.innerHeight-height)/2 + "px",
		"left" : (window.innerWidth-width)/2 + "px",
		"width" : width + "px",
		"height" : height + "px",
	});
	$(img).on("click",function(){darken()});
	$('body').append(img);
}

function darken() {
	$('.zoomedImage').remove();
	$('.lightbox-mask').remove();
}
