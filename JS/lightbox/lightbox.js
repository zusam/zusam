
function enlighten(id) {

	lightbox.darken();
	
	var e = $(id)[0];
	var nw = e.naturalWidth;
	var nh = e.naturalHeight;

	var width = Math.min(nw,window.innerWidth*0.9);
	nh = width/nw * nh;
	//console.log(width/nw);
	var height = Math.min(nh,window.innerHeight*0.9);
	width = height/nh * width;

	//var r = e.getBoundingClientRect();
	//console.log(r);
	//var dtop = (window.innerHeight - height)/2 - r.y;
	//var dleft = (window.innerWidth - width)/2 - r.x;


	//console.log(width, height, dtop, dleft);
	//$(id).css({
	//	'width' : width+"px",
	//	'height' : height+"px",
	//	'position' : 'relative',
	//	'top' : dtop+"px",
	//	'left' : dleft+"px"
	//});

	//$(id).on("blur",function(){console.log("coucou");darken(id);});

	var img = $('<img class="zoomedImage" src="'+e.src+'"/>');
	img.css({
		"top" : (window.innerHeight-height)/2 + "px",
		"left" : (window.innerWidth-width)/2 + "px",
		"width" : width + "px",
		"height" : height + "px"
	});
	$(img).on("click",function(){darken()});
	$('body').append(img);
}

function darken() {
	$('.zoomedImage').remove();
}
