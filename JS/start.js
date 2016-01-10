
//// usefull global variables /////

// albums
albumFiles = window.albumFiles = [];
// canvas conversions
URL = window.URL || window.webkitURL;
// sending state
sending = 0;
// global url
origin_url = "http://localhost/zusam/";
//origin_url = "http://zus.am/";

$(window).ready(function() {

	// start fastclick
	$(function() {
		FastClick.attach(document.body);
	});

	// start infinite scrolling
	if($('#info').attr('data-fid') != "") {
		$(document).on('scroll', function() {
		//console.log(window.pageYOffset, document.body.scrollHeight);
			if(window.pageYOffset > document.body.scrollHeight/2) {
				//console.log("loadmore!");
				loadMorePosts();
			}
		});
	}

	//small code to permit keyboard shortcuts with ctrlKey
	// necessary to not intefere with typebox. (see typebox code)
	window.ctrl = false
	$(window).keydown(function(e) {
		if(e.keyCode != 17 && e.ctrlKey) {
			window.ctrl = true;
		} else {
			window.ctrl = false;
		}
	});
	
	// start retouche
	retouche.start("#retoucheBox");

	// set post-mini clickable
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
	if($('#info').length != 0) {
		if(window.location.href.match(/\#[a-z0-9]+$/)) {
			var pid = window.location.href.replace(/.*\#([a-z0-9]+)/,"$1");
			console.log("show:"+pid);
			showpostviewer(pid);
		}
	}

	// prevent exiting while download
	$(window).on("beforeunload", function (e) {
		//console.log("beforeunload");
		//console.log(window.sending);
		if(window.sending > 0) {
			return 'Upload en cours !';
		} 
	});

	// start album
	//album.start();
});
