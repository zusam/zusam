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

// usefull variables
URL = window.URL || window.webkitURL;
sending = false;

$(window).ready(function() {

	// start fastclick
	$(function() {
		FastClick.attach(document.body);
	});

	//small code to permit keyboard shortcuts with ctrlKey
	window.ctrl = false
	$(window).keydown(function(e) {
		if(e.keyCode != 17 && e.ctrlKey) {
			window.ctrl = true;
		} else {
			window.ctrl = false;
		}
	});
	
	retouche.start("#retoucheBox");
	setpostsviewable();
	
	// INITIALISATION OF EXTERNAL LIBRARIES
	// SOUNDCLOUD
	if( typeof(SC) != "undefined" ) {
		SC.initialize({
			// zusam client ID
			client_id: '01af1b3315ad8177aefecab596621e09'
		});
	}

	// view post if url says so
	if(window.location.href.match(/\#[a-z0-9]+$/)) {
		var pid = window.location.href.replace(/.*\#([a-z0-9]+)/,"$1");
		console.log("show:"+pid);
		showpostviewer(pid);
	}

	// prevent exiting while download

	window.addEventListener("beforeunload", function (e) {
		console.log("beforeunload");
		if(sending) {
			return "plop";
		}
	});




});
