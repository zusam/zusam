function hideAll() {
	hideslidefromleft('#mainmenu');
	hideimageeditor();
	hidepostviewer();
	hidenewpost();
	lightbox.darken();
}

function blockBody() {
	var locks = parseInt($('body').attr('data-locks'));
	if(!locks) {
		locks = 0;
	}
	var locks = locks+1;
	//console.log(locks);
	$('body').attr('data-locks',locks);
	$('body').css({'overflow':'hidden','max-height':'100%'});
}
function unblockBody() {
	var locks = parseInt($('body').attr('data-locks'));
	if(!locks) {
		locks = 0;
	}
	var locks = locks-1;
	//console.log(locks);
	if(locks < 1) {
		$('body').attr('data-locks',0);
		$('body').css({'overflow':'auto','max-height':'none'});
	} else {
		$('body').attr('data-locks',locks);
	}
}

function toggleoptionsmenu(id) {
	g = $(id).find('.options-menu');
	if(!g.hasClass('active')) {
		g.css("display","block");
		g.addClass('active');
		$(id).find('i').removeClass("icon-down-dir");
		$(id).find('i').addClass("icon-up-dir");
	} else {
		g.css("display","none");
		g.removeClass('active');
		$(id).find('i').removeClass("icon-up-dir");
		$(id).find('i').addClass("icon-down-dir");
	}
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

function toggleslidefromright(id) {
	g = $(id);
	if(!g.hasClass('active')) {
		showslidefromright(id);
	} else {
		hideslidefromright(id);
	}
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

function togglenewavatar() {
	pv = $('#newavatar');
	if(pv.hasClass('active')) {
		hideimageeditor();
	} else {
		showimageeditor("#retouchebox");
	}
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
	invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>')
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
	if($('#newpost').length != 0) {
		if(sent) {
			var answer = true;
		} else {
			var nbc = document.getElementById('typeBox').childNodes.length;
			var fc = document.getElementById('typeBox').childNodes[0].innerHTML.replace(/\<br\>/,'');
			if(nbc == 1 && fc == "") {
				var answer = true;
			} else {
				console.log(fc);
				var answer = confirm('Voulez-vous vraiment annuler le message ?');
			}
		}
		if(answer == true) {
			e = $('#newpost');
			hideslidefromright('#slidenewpost');
			$('#newpost').removeClass('active');	
			invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>')
			$('#typeBox').html(invite);
			typebox.stop('#typeBox');
			removeMask();
		}
	}
}

function hidenewcommentsection(id) {
	var t = $(id);
	t.after(fakeComment());
	t.remove();
}

function shownewcommentsection(id) {
	if(id == null) {
		id = $('#post-viewer .new-comment-section').get(0);
	}
	t = $(id);
	fc = t.children(':first-child');
	if(fc.hasClass('fake-comment')) {
		fc.remove();
		var cb = $('<div id="commentBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Ecrire un commentaire..."></div></div>');
		var np_menu = $('<div class="menu"></div>');
		var np_cell1 = $('<div class="menu-cell"></div>');
		np_cell1.append('<button class="cancel" onclick="hidenewcommentsection($(\'.new-comment-section\'))">Annuler</button>');
		var np_cell2 = $('<div class="menu-cell"></div>');
		np_cell2.append('<button onclick="inputFile(\'#commentBox\')" class="action"><i class="icon-attach"></i></button>');
		var np_cell3 = $('<div class="menu-cell"></div>');
		np_cell3.append('<button class="send" onclick="sendIt(\'#commentBox\')">Envoyer</button>');
		np_menu.append(np_cell1);
		np_menu.append(np_cell2);
		np_menu.append(np_cell3);
		t.append(cb).append(np_menu);
		typebox.start('#commentBox');
		// require typebox module
		typebox.Control.niceFocus('#commentBox');
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
			if(data == null || data == "" || data['html'] == "") {
				// do something else : we need an error message
				console.log("no post to show !");
				push_hideAll();
			} else {

				recordUsage("post");

				$('#post-viewer .spinner').remove();
				$('#mask').addClass('dark-mask');
				var plop = $(data['html']);
				$('#post-viewer').append(plop);
				var opimg = $('#info').attr('data-avatar');
				$('#post-viewer').append(fakeComment());

				updatePostStats(id);
				
				// lazy loading
				// TODO first lazyload : choose a more wise selector
				lazyload($('.nano-content')[0]);
				$('.nano-content').on('scroll',function(e) {
					lazyload(e.currentTarget);
				});
				$('#post-viewer').focus();
			}
		},
		error: function() {
			console.log('fail load post');
		}
	});
}

function hidepostviewer() {
	unblockBody();
	hideslidefromright('#slidepostviewer');
	var spv = $('#slidepostviewer');
	spv.html('');
	spv.off();
	removeMask();
	typebox.stop('#commentBox');
	active_post = 0;
}

function addMask(func, darkness, zindex, id) {
	if(id == null) {
		id = "mask";
	}
	mask = $('<div class="mask" id="'+id+'" onclick="'+func+'"></div>');
	$('body').append(mask);
	blockBody();
	$('#'+id).css('background','rgba(0,0,0,'+darkness+')');
	if(zindex != null) {
		$('#'+id).css('z-index',zindex);
	}
}

function removeMask(id) {
	if(id == null) {
		id = "mask";
	}
	$('#'+id).remove();
	unblockBody();
}

function lazyload(e) {
	$(e).find('img.lazyload:not([src])').each(function() {
		var y = e.scrollTop + window.screen.height;
		var node = this;
		var yy = node.offsetTop - 10;
		while(!node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
			node = node.parentNode;
			yy += node.offsetTop; 
		}
		if(yy < y) {
			unveil(this);
		}
	});
}

function unveil(e) {
	if(e.src == "") {
		console.log("load :"+e.dataset.src);
		e.src = e.dataset.src;	
		e.onload = function() {
			e.style.opacity = 1;
			e.removeAttribute('width');
			e.removeAttribute('height');
		}
	}
}

function fakeComment() {
	var opimg = $('#info').attr('data-avatar');
	var fc = $('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><img class="op-img" src="'+opimg+'"/><span>Ecrire un commentaire...</span></div></div>');
	return fc;
}
