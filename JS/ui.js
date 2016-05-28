function hideAll() {
	hideslidefromleft('#mainmenu');
	hideimageeditor();
	hidepostviewer();
	hidenewpost();
	lightbox.darken();
}

function showoptionsmenu(id) {
	g = $(id).find('.options-menu');
	g.css("display","block");
	g.addClass('active');
	$(id).find('i').removeClass("icon-down-dir");
	$(id).find('i').addClass("icon-up-dir");
	$(id).attr('onclick','hideoptionsmenu(this)');
}

function hideoptionsmenu(id) {
	g = $(id).find('.options-menu');
	g.css("display","none");
	g.removeClass('active');
	$(id).find('i').removeClass("icon-up-dir");
	$(id).find('i').addClass("icon-down-dir");
	$(id).attr('onclick','showoptionsmenu(this)');
}

function toggleslidefromleft(id) {
	g = $(id);
	if(!g.hasClass('active')) {
		showslidefromleft(id);
	} else {
		hideslidefromleft(id);
	}
}

function showslidefromleft(id) {
	hideAll();
	g = $(id);
	console.log(g);
	g.css({"transform":"translateX(0)"});
	g.addClass('active');
	addMask("hideslidefromleft(\'"+id+"\')",0.75,20);
}

function hideslidefromleft(id) {
	g = $(id);
	g.css({"transform":"translateX(-100%)"});
	g.removeClass('active');
	removeMask();
}

function showslidefromright(id) {
	hideAll();
	g = $(id);
	g.css({"transform":"translateX(50%)","right":"50%"});
	g.addClass('active');
}

function hideslidefromright(id) {
	g = $(id);
	g.css({"transform":"translateX(100%)","right":"0px"});
	g.removeClass('active');
}

function hideimageeditor() {
	pv = $('#newavatar');
	pv.removeClass('active');
	pv.css('display','none');
	$('#container').css("filter","none");
	$('#container').css("-webkit-filter","none");
	pv.html('<div id="retoucheBox"></div>');
	removeMask("imageeditormask");
}

function push_shownewpost() {
	window.history.replaceState('newpost', "", window.location.href.replace(/\#.*/,"") + "#newpost");
	evaluateURL();
}

function shownewpost() {
	e = $('#newpost');
	hideAll();
	showslidefromright('#slidenewpost');
	typebox.start('#typeBox');
	invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>');
	$('#typeBox').html(invite);
	e.addClass('active');
	addMask("push_hidenewpost()",0.75);
}

function push_hideAll() {
	window.history.pushState("", "", window.location.href.replace(/\#.*/,""));
	evaluateURL();
}

function push_hidenewpost(sent) {
	window.history.replaceState("", "", window.location.href.replace(/\#.*/,""));
	hidenewpost(sent);
}

function hidenewpost(sent) {
	var answer;
	if($('#newpost').length !== 0) {
		if(sent) {
			answer = true;
		} else {
			var nbc = document.getElementById('typeBox').childNodes.length;
			var fc = document.getElementById('typeBox').childNodes[0].innerHTML.replace(/<br>/,'');
			if(nbc == 1 && fc === "") {
				answer = true;
			} else {
				console.log(fc);
				answer = confirm('Voulez-vous vraiment annuler le message ?');
			}
		}
		if(answer === true) {
			PF.stopFileQueue();
			e = $('#newpost');
			hideslidefromright('#slidenewpost');
			$('#newpost').removeClass('active');	
			invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>');
			$('#typeBox').html(invite);
			typebox.stop('#typeBox');
			removeMask();
		}
	}
}

function hidenewcommentsection(id) {
	PF.stopFileQueue();
	var t = $(id);
	t.after(genFakeComment());
	t.remove();
}

function shownewcommentsection(id) {
	if(id === null) {
		id = $('#post-viewer .new-comment-section').get(0);
	}
	t = $(id);
	fc = t.children(':first-child');
	if(fc.hasClass('fake-comment')) {
		fc.remove();
		var cb = $('<div id="commentBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Ecrire un commentaire..."></div></div>');
		var menu = genMenu("hidenewcommentsection($(\'.new-comment-section\'))","inputFile(\'#commentBox\')","sendIt(\'#commentBox\')");
		t.append(cb).append(menu);
		typebox.start('#commentBox');
		// require typebox module
		typebox.niceFocus('#commentBox');
	}
}

function push_showpost(id) {
	window.history.pushState('{pid:'+id+'}', "", window.location.href.replace(/\#.*/,"") + "#" + id);
	evaluateURL();
}

function showpostviewer(id) {
	hideAll();
	showslidefromright('#slidepostviewer');
	spv = $('#slidepostviewer');
	spv.addClass('active');
	spv.append('<div class="nano"><div class="nano-content"></div></div>');
	$('#slidepostviewer .nano .nano-content').append('<div id="post-viewer" tabindex="-1"></div>');
	
	addMask("push_hideAll()",0.75);
	$('#post-viewer').attr('data-id',id);
	$('#post-viewer').append('<div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div>');

	console.log("show: "+id);
	console.log("Ajax/get.php?action=getPost&id="+id);

	active_post = id;

	$.ajax({
		url: "Ajax/get.php", 
		type: "GET",
		data: {"action":"getPost","id":id},
		success: function(data) {
			console.log('loaded post data');
			console.log(data);
			if(data === null || data === "" || data.html === "") {
				// do something else : we need an error message
				console.log("no post to show !");
				push_hideAll();
			} else {

				$('#post-viewer .spinner').remove();
				$('#mask').addClass('dark-mask');
				var plop = $(data.html);
				$('#post-viewer').append(plop);
				var opimg = $('#info').attr('data-avatar');
				$('#post-viewer').append(genFakeComment());

				updatePostStats(id);
				
				// lazy loading
				// TODO first lazyload : choose a more wise selector
				lazyload($('.nano-content')[0]);
				$('.nano-content').on('scroll',function(e) {
					lazyload(e.currentTarget);
				});
				setTimeout(function() {
					$('.post-text').each(function() {
						limitHeight(this);
					});
				}, 100);
				$('#post-viewer').focus();
			}
		},
		error: function() {
			console.log('fail load post');
		}
	});
}

function hidepostviewer() {
	// this line is added for ie11 (issue with closing soundcloud widget)
	$('iframe').attr('src','');

	unblockBody();
	hideslidefromright('#slidepostviewer');
	var spv = $('#slidepostviewer');
	spv.html('');
	spv.off();
	removeMask();
	typebox.stop('#commentBox');
	active_post = 0;
}
