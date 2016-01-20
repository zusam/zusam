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
		var fileId = $(t).closest('.deletable').attr('data-src').replace(/[{:}]/g,'');
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
		var nbc = document.getElementById('typeBox').childNodes.length;
		var fc = document.getElementById('typeBox').childNodes[0].innerHTML.replace(/\<br\>/,'');
		if(nbc == 1 && fc == "") {
			console.log("okay!");
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

function togglepostviewer(e) {
	spv = $('#slidepostviewer');
	if(spv.hasClass('active') || e == null) {
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
	hideAll();
	showslidefromright('#slidepostviewer');
	spv = $('#slidepostviewer');
	spv.addClass('active');
	spv.append('<div class="nano"><div class="nano-content"></div></div>');
	$('#slidepostviewer .nano .nano-content').append('<div id="post-viewer"></div>');
	
	addMask("hideAll()",0.75);
	$('#post-viewer').attr('data-id',id);
	$('#post-viewer').append('<div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div>');
	window.history.pushState("", "", window.location.href.replace(/\#.*/,"") + "#" + id);

	console.log("show: "+id);
	console.log("Ajax/get.php?action=getPost&id="+id);

	$.ajax({
		url: "Ajax/get.php", 
		type: "GET",
		data: {"action":"getPost","id":id},
		success: function(data) {
			console.log(data);

			$('#post-viewer .spinner').remove();
			$('#mask').addClass('dark-mask');
			var prev = $('.post-mini[data-id='+id+']').prev().attr('data-id');
			var next = $('.post-mini[data-id='+id+']').next().attr('data-id');
			var opt = $('<div class="post-options"></div>');
			opt.append('<div class="cell" onclick="shownewcommentsection()"><i class="fa fa-comment"></i></div>');
			if(prev!=null) {
				opt.append('<div class="cell" onclick="showpostviewer(\''+prev+'\')"><i class="fa fa-arrow-left"></i></div>');
			}
			if(next!=null) {
				opt.append('<div class="cell" onclick="showpostviewer(\''+next+'\')"><i class="fa fa-arrow-right"></i></div>');
			}
			opt.append('<div class="cell" onclick="hidepostviewer()"><i class="fa fa-close"></i></div>');
			
			$('#post-viewer').before(opt);
			var plop = $(data['html']);
			$('#post-viewer').append(plop);
			$('#post-viewer').append('<div onclick="shownewcommentsection(this)" class="new-comment-section"><div class="fake-comment" data-placeholder="Ecrire un commentaire..."></div></div>');

			$('.nano-content').on('scroll',function(){
				if(typeof(window.spvScrollTop) == 'undefined') {
					window.spvScrollTop = 0;
				}
				var st = $(this).scrollTop();
				if(st > window.spvScrollTop) {
					$(this).find('.post-options').addClass('hidden');
				} else {
					$(this).find('.post-options').removeClass('hidden');
				}
				window.spvScrollTop = st;
			});
			
			//typebox.view();
			updatePostStats(id);
			
			//start nano scroller
			// TODO find a more clean method for adapting to the height of the content for this
			setInterval(function() {
				$(".nano").nanoScroller();
			}, 1000);

			// lazy loading
			// TODO first lazyload : choose a more wise selector
			lazyload($('.nano-content')[0]);
			$('.nano-content').on('scroll',function(e) {
				lazyload(e.currentTarget);
			});
		},
		error: function() {
			console.log('fail load post');
		}
	});
}

function hidepostviewer() {
	unblockBody();
	hideslidefromright('#slidepostviewer');
	$('#slidepostviewer').html('');
	$('#slidepostviewer').off();
	removeMask();
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
			console.log("load :"+this.dataset.src);
			this.src = this.dataset.src;	
			this.onload = function() {
				this.style.opacity = 1;
			}
		}
	});
}
