// some global parameters

	// for post loading
	//var n = 30;
	//var loading = false;
	//var stop = false


// start fastclick
$(function() {
	FastClick.attach(document.body);
});

// start infinite scrolling
/*
$(document).on('scroll', function() {
//console.log(window.pageYOffset, document.body.scrollHeight);
	if(window.pageYOffset > document.body.scrollHeight/3) {
		//console.log("loadmore!");
		loadMorePosts();
	}
});
*/

$(window).ready(function() {
	//start_typebox("#typeBox");
	//start_typebox("#commentBox");
	start_retouche("#retoucheBox");
	setpostsviewable();
	start();
});
