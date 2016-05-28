//// usefull global variables /////

// canvas conversions
URL = window.URL || window.webkitURL;

// scripts states
sending = 0;
active_post = 0;
loading_posts = false;

// fileQueue
fileQueue = [];
positionInQueue = 1;

// lightbox
lightbox_url = "";


//console.log(origin_url);

$(window).ready(function() {

	// output loading time
	document.body.onload = function() {
		var loadingTime = new Date().getTime() - window.startLoading;
		//console.log("loaded in "+loadingTime);
		$.ajax({
			url:"Ajax/post.php",
			type:"post",
			data:{"action":"saveRecord","loadingTime":loadingTime,"screenHeight":screen.height,"screenWidth":screen.width},
			success: function(data) {
				//console.log(data);
			},
			error: function() {
				console.log("fail record loading");
			}
		});
	};

	// close menus when outside is clicked
	$('body').on('click',function(e) {
		// options menu in post
		$('#post-viewer .options').each(function() {
			if(e.target != this && !$.contains(this, e.target)) {
				hideoptionsmenu(this);
			}
		});
	});

	// start fastclick
	$(function() {
		FastClick.attach(document.body);
	});

	//small code to permit keyboard shortcuts with ctrlKey
	// necessary to not intefere with typebox. (see typebox code)
	window.ctrl = false;
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
	
	if($('#info').attr('data-action') == "forum") {
	
		$(document).on('scroll', function() {
			loadMorePosts();
		});

		$(window).on('resize', function() {
			loadMorePosts();
			if($('#lightbox').length == 1) {
				lightbox.resizeLightBox($('#lightbox'));
			}
		});

		// INITIALISATION OF EXTERNAL LIBRARIES
		// SOUNDCLOUD
		if( typeof(SC) != "undefined" ) {
			SC.initialize({
				// zusam client ID
				client_id: '01af1b3315ad8177aefecab596621e09'
			});
		}

		// view post if url says so
		if($('#info').length !== 0) {
			evaluateURL();
			$(window).on("popstate", function() {
				evaluateURL();
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
		// TODO find a more clean method for adapting to the height of the content for this (based on events if it's possible)
		setInterval(function() {
			// check for active post-viewer nanoscroller
			var pv = document.getElementById('post-viewer');
			if(pv === null) {
				pv = document.getElementById('newpost');
			}
			if(pv !== null) {
				if(pv.offsetHeight > window.innerHeight) {
					$(pv).closest('.nano').nanoScroller({
						preventPageScrolling: true,
						alwaysVisible: true
					});
				} else {
					// small threshold to prevent back and forth changing
					if(pv.offsetHeight + 30 < window.innerHeight) {
						$(pv).closest('.nano').nanoScroller({
							destroy: true
						});
					}
				}
			}
		}, 1000);

		// load posts
		loadMorePosts();
	}
});
