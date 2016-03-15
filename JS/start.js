
//// usefull global variables /////

// albums
albumFiles = window.albumFiles = [];
// canvas conversions
URL = window.URL || window.webkitURL;
// scripts states
sending = 0;
active_post = 0;
loading_posts = false;

console.log(origin_url);

$(window).ready(function() {

	// output loading time
	document.body.onload = function() {
		var loadingTime = new Date().getTime() - window.startLoading;
		console.log("loaded in "+loadingTime);
		$.ajax({
			url:"Ajax/post.php",
			type:"post",
			data:{"action":"saveRecord","loadingTime":loadingTime,"screenHeight":screen.height,"screenWidth":screen.width},
			success: function(data) {
				console.log(data);
			},
			error: function() {
				console.log("fail record");
			}
		});
	}

	// start fastclick
	$(function() {
		FastClick.attach(document.body);
	});

	// start infinite scrolling
	if($('#info').attr('data-fid') != "") {
		$(document).on('scroll', function() {
		//console.log(window.pageYOffset, document.body.scrollHeight);
			if(window.pageYOffset+window.innerHeight > document.body.scrollHeight-window.innerHeight/2) {
				//console.log("loadmore!");
				loadMorePosts();
			}
		});
	}

	window.onresize = function() {
		loadMorePosts();
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
		evaluateURL()
		$(window).on("popstate", function() {
			evaluateURL()
		});
	}

	// prevent exiting while download
	$(window).on("beforeunload", function (e) {
		//console.log("beforeunload");
		//console.log(window.sending);
		if(window.sending > 0) {
			return 'Upload en cours !';
		} 
	});

	//start nano scroller
	// TODO find a more clean method for adapting to the height of the content for this
	setInterval(function() {
		$(".nano").nanoScroller();
	}, 1000);

	// load posts
	var ret = loadMorePosts();
	while(ret == false) {
		ret = loadMorePosts();
	}

});
