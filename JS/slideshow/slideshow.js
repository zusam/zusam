function init() {
	var slideshows = $('.slideshow');
	for(var i = 0; i < slideshows.length; i++) {
		$(slideshows.get(i)).find('.current').attr('src', slideshows.get(i).childNodes[0].dataset.src);
		$(slideshows.get(i)).attr('data-current',0);
	}
}

function next(t) {
	var slideshow = $(t).closest('.slideshow');
	var n = parseInt(slideshow.attr('data-current'));
	n = n+1;
	if(slideshow.find('.photo').length <= n) {
		n = 0;
	}
	slideshow.find('.current').attr('src', slideshow.get(0).childNodes[n].dataset.src);
	slideshow.attr('data-current',n);
}
function previous(t) {
	var slideshow = $(t).closest('.slideshow');
	var n = parseInt(slideshow.attr('data-current'));
	n = n-1;
	if(n < 0) {
		n = slideshow.find('.photo').length-1;
	}
	slideshow.find('.current').attr('src', slideshow.get(0).childNodes[n].dataset.src);
	slideshow.attr('data-current',n);
}
