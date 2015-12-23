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
		$(id).find('i').removeClass("fa-caret-down");
		$(id).find('i').addClass("fa-caret-up");
	} else {
		g.css("display","none");
		g.removeClass('active');
		$(id).find('i').removeClass("fa-caret-up");
		$(id).find('i').addClass("fa-caret-down");
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
	g.css({"transform":"translateX(0)"});
	g.addClass('active');
}

function hideslidefromright(id) {
	g = $(id);
	g.css({"transform":"translateX(100%)"});
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

function showimageeditor(id, t) {
	pv = $('#newavatar');
	pv.addClass('active');
	pv.css('display','block');
	addMask("hideimageeditor()",0.75, 699, "imageeditormask");
	// t is provided when we edit an existing image
	if(t != null) {
		var img = $(t).parent().find('img');
		var src = img.attr('src');
		console.log(src);
		var fileId = $(t).parent().parent().attr('data-src').replace(/[{:}]/g,'');
		console.log(fileId);
		r = $('#retoucheBox');
		r.attr('data-action',"addImage");
		r.attr('data-arg',fileId);
		r.attr('data-w',img.attr('naturalWidth'));
		r.attr('data-h',img.attr('naturalHeight'));
		retouche.set(id, src);
	} else {
		retouche.restart("#retoucheBox");
	}
}

function hideimageeditor() {
	pv = $('#newavatar');
	pv.removeClass('active');
	pv.css('display','none');
	$('#container').css("filter","none");
	$('#container').css("-webkit-filter","none");
	pv.html('<div id="retoucheBox"><div class="placeholder"><i class="label fa fa-photo"></i><span class="underLabel">Cliquez pour choisir une photo</span><input type="file"></input></div></div>');
	removeMask("imageeditormask");
}

//function hidenewavatar() {
//	hideimageeditor();
//}

function togglenewpost() {
	e = $('#newpost');
	if(e.hasClass('active')) {
		hidenewpost();
	} else {
		shownewpost();
	}
}

function shownewpost() {
	e = $('#newpost');
	hideAll();
	showslidefromright('#slidenewpost');
	typebox.start('#typeBox');
	invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>')
	$('#typeBox').html(invite);
	e.addClass('active');
	addMask("hidenewpost()",0.75);
}

function hidenewpost(sent) {
	if(sent) {
		var answer = true;
	} else {
		if(document.getElementById('typeBox').innerHTML.hashCode() != 654843154) {
			var answer = confirm('Voulez-vous vraiment annuler le message ?');
		} else {
			var answer = true;
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

function togglepostviewer(e) {
	pv = $('#post-viewer');
	if(pv.hasClass('active') || e == null) {
		hidepostviewer();
	} else {
		var id = $(e.currentTarget).attr('data-id');
		showpostviewer(id);
	}
}

function hidenewcommentsection(id) {
	t = $(id);
	t.after('<div onclick="shownewcommentsection(this)" class="new-comment-section"><div class="fake-comment" data-placeholder="Ecrire un commentaire..."></div></div>');
	t.remove();
}

function shownewcommentsection(id) {
	t = $(id);
	fc = t.children(':first-child');
	if(fc.hasClass('fake-comment')) {
		fc.remove();
		//var c = $('<div class="commentator"><img src="'+$('#info').attr('data-avatar')+'"/></div>');
		var cb = $('<div id="commentBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Ecrire un commentaire..."></div></div>');
		var np_menu = $('<div class="menu"></div>');
		var np_cell1 = $('<div class="menu-cell"></div>');
		np_cell1.append('<button onclick="hidenewcommentsection($(\'.new-comment-section\'))">Annuler</button>');
		var np_cell2 = $('<div class="menu-cell"></div>');
		np_cell2.append('<button onclick="inputFile(\'#commentBox\')" class="action"><i class="fa fa-paperclip"></i></button>');
		var np_cell3 = $('<div class="menu-cell"></div>');
		np_cell3.append('<button onclick="sendIt(\'#commentBox\')">Envoyer</button>');
		np_menu.append(np_cell1);
		np_menu.append(np_cell2);
		np_menu.append(np_cell3);
		t.append(cb).append(np_menu);
		typebox.start('#commentBox');
		// require typebox module
		typebox.Control.niceFocus('#commentBox');
	}
}

function showpostviewer(id) {
//TODO load more posts if we are at the end (for next button)
	hideAll();
	showslidefromright('#slidepostviewer');
	pv = $('#post-viewer');
	pv.addClass('active');
	pv.css('display','block');
	console.log("show: "+id);
	$.get("Ajax/get.php?action=getPost&id="+id, function(data) {

		$('#mask').addClass('dark-mask');
		pv.append('<div class="post-separator"></div>');
		var prev = $('.post-mini[data-id='+id+']').prev().attr('data-id');
		var next = $('.post-mini[data-id='+id+']').next().attr('data-id');
		var opt = $('<div class="post-options"></div>');
		if(prev!=null) {
			opt.append('<div class="material-shadow cell" onclick="showpostviewer(\''+prev+'\')"><i class="fa fa-long-arrow-left"></i></div>');
		}
		if(next!=null) {
			opt.append('<div class="material-shadow cell" onclick="showpostviewer(\''+next+'\')"><i class="fa fa-long-arrow-right"></i></div>');
		}
		opt.append('<div class="material-shadow cell" onclick="hidepostviewer()"><i class="fa fa-close"></i></div>');
		pv.append(opt);
		pv.append('<div class="post-separator"></div>');
		pv.append(data['html']);
		pv.append('<div onclick="shownewcommentsection(this)" class="new-comment-section"><div class="fake-comment" data-placeholder="Ecrire un commentaire..."></div></div>');
		typebox.view();
		//slideshow.init();
		updatePostStats(id);
	});
	addMask("hideAll()",0.75);
	pv.attr('data-id',id);
	window.history.pushState("", "", window.location.href.replace(/\#.*/,"") + "#" + id);
}

function hidepostviewer() {
	unblockBody();
	hideslidefromright('#slidepostviewer');
	pv = $('#post-viewer');
	pv.removeClass('active');
	removeMask();
	pv.attr('data-id','');
	pv.html('');
	typebox.stop('#commentBox');
	window.history.pushState("", "", window.location.href.replace(/\#.*/,""));
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
