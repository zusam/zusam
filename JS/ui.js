function hideAll() {
	if($('#mainmenu').hasClass('active')) {
		hideslidefromleft('#mainmenu');
	}
	if($('#newavatar').hasClass('active')) {
		hidenewavatar();
	}
	if($('#post-viewer').hasClass('active')) {
		hidepostviewer();
	}
	if($('#newpost').hasClass('active')) {
		hidenewpost();
	}
}

function togglenotification() {
	g = $('#notification');
	nm = $('#notification-menu');
	if(!g.hasClass('active')) {
		nm.css("display","block");
		g.addClass('active');
		g.css("color","red");
	} else {
		nm.css("display","none");
		g.removeClass('active');
		g.css("color","white");
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
	addMask("hideslidefromleft(\'"+id+"\')",0.6);
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

function togglechangename() {
	nz = $('#mainmenu .myname');
	if(nz.hasClass('active')) {
		name = nz.children('input').val();
		if(name == null || name == false || name.match(/^\s*$/)) {
			name = nz.children('input').attr('data-original');
		} else {
			var uid = $('#info').attr('data-uid');
			$.ajax({
				url: "Ajax/changeProfile.php",
				type: "POST",
				data: {"uid":uid, "name":name},
				success: function(data) {
					console.log(data);
					}
			});
		}
		nz.html(name);
		nz.off();
		nz.attr('onclick','togglechangename()');
		nz.removeClass('active');
	} else {
		name = nz.html();
		nz.attr('onclick','');
		nz.html('');
		nz.html('<input style="width:100%" type="text" placeholder="Choose a cool name!" data-original="'+name+'"></input>');
		nz.addClass('active');
		nz.children('input').focus();
		nz.focusout(togglechangename);
	}
}

function togglenewavatar() {
	pv = $('#newavatar');
	if(pv.hasClass('active')) {
		hidenewavatar();
	} else {
		hideAll();
		pv.addClass('active');
		pv.css('display','block');
		//$('#container').css("filter","blur(2px)");
		//$('#container').css("-webkit-filter","blur(2px)");
		addMask("togglenewavatar()",0.6);
		restart_retouche("#retoucheBox");
	}
}

function hidenewavatar() {
	pv = $('#newavatar');
	pv.removeClass('active');
	pv.css('display','none');
	$('#container').css("filter","none");
	$('#container').css("-webkit-filter","none");
	$('#mask').remove();
	$('body').css('overflow','auto');
	pv.html('<div id="retoucheBox"><i class="label fa fa-photo"></i><span class="underLabel">Click to upload a photo</span><input type="file"></input></div>');
	removeMask();
}

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
	start_typebox('#typeBox');
	invite = $('<div contenteditable="true" data-placeholder="Partagez quelquechose..."></div>')
	$('#typeBox').html(invite);
	e.addClass('active');
	addMask("hidenewpost()",0.6);
}

function hidenewpost() {
	e = $('#newpost');
	hideslidefromright('#slidenewpost');
	$('#newpost').removeClass('active');	
	invite = $('<div contenteditable="true" data-placeholder="Share something..."></div>')
	$('#typeBox').html(invite);
	stop_typebox('#typeBox');
	removeMask();
}

function togglepostviewer(e) {
	pv = $('#post-viewer');
	if(pv.hasClass('active') || e == null) {
		hidepostviewer();
	} else {
		var id = $(e.target).parent().attr('data-id');
		showpostviewer(id);
	}
}

function hidenewcommentsection(id) {
	t = $(id);
	t.html('<div onclick="shownewcommentsection(this)" class="new-comment-section"><div class="fake-comment" data-placeholder="Write a comment..."></div></div>');
}

function shownewcommentsection(id) {
	t = $(id);
	fc = t.children(':first-child');
	if(fc.hasClass('fake-comment')) {
		fc.remove();
		var c = $('<div class="commentator"><img src="'+$('#info').attr('data-avatar')+'"/></div>');
		var cb = $('<div id="commentBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Comment..."></div></div>');
		var np_menu = $('<div class="newpost-menu"></div>');
		var np_cell = $('<div class="newpost-menu-cell"></div>');
		np_cell.append('<button id="sendit" onclick="sendIt(\'#commentBox\')">Send</button>');
		np_menu.append(np_cell);
		t.append(c).append(cb).append(np_menu);
		start_typebox('#commentBox');
		// require Typebox/typebox.js
		niceFocus('#commentBox');
	}
}

function showpostviewer(id) {
	hideAll();
	showslidefromright('#slidepostviewer');
	pv = $('#post-viewer');
	pv.addClass('active');
	pv.css('display','block');
	console.log("show: "+id);
	$.get("Ajax/getPost.php?id="+id, function(data) {

		$('#mask').addClass('dark-mask');
		pv.append('<div class="post-separator"></div>');
		pv.append('<div class="post-options"><div onclick="hidepostviewer()"><i class="fa fa-long-arrow-right"></i></div></div>');
		pv.append('<div class="post-separator"></div>');
		pv.append(data['html']);
		pv.append('<div onclick="shownewcommentsection(this)" class="new-comment-section"><div class="fake-comment" data-placeholder="Write a comment..."></div></div>');
		view();
	});
	addMask("togglepostviewer()",0.6);
	pv.attr('data-id',id);
}

function hidepostviewer() {
	$('body').css({'overflow':'auto','max-height':'none'});
	hideslidefromright('#slidepostviewer');
	pv = $('#post-viewer');
	pv.removeClass('active');
	//pv.css('display','none');
	//$('#container').css("filter","none");
	//$('#container').css("-webkit-filter","none");
	removeMask();
	pv.attr('data-id','');
	pv.html('');
	stop_typebox('#commentBox');
	//$('section').css('transform', 'none');
}


function addMask(func, darkness, zindex, id) {
	if(id == null) {
		id = "mask";
	}
	mask = $('<div class="mask" id="'+id+'" onclick="'+func+'"></div>');
	$('body').append(mask);
	$('body').css({'overflow':'hidden','max-height':'100%'});
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
}


