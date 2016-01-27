function recordUsage(usage) {
	$.ajax({
		url:"Ajax/post.php",
		type:"post",
		data:{"action":"recordUsage","usage":usage},
		success: function(data) {
			console.log(data);
		},
		error: function() {
			console.log("fail record");
		}
	});
}

function toggleButterfly(t) {
	var pid = $(t).closest('.post').attr('data-id');
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"toggleButterfly", "uid":uid, "fid":fid, "pid":pid},
		success: function(data) {
			console.log(data);
			var butterflies = $(t).parent()[0].childNodes[3].textContent;
			$(t).parent()[0].childNodes[3].textContent = data['count'];
			t.style.fill = data['color'];
			//if(data['color'] == "#F7A71B") {
			//	var pap = $('<div class="butterfly">');
			//	var aileg = $('<img class="aile aileg" src="Assets/aile.svg"/>');
			//	var ailed = $('<img class="aile ailed" src="Assets/aile.svg"/>');
			//	pap.append(aileg).append(ailed);
			//	var pos = $(t).position();
			//	pap.css({"top":pos.top+1,"left":pos.left+3});
			//	$(t).parent().append(pap);
			//}
		},
		error: function() {
			console.log('fail butterfly');
		}
	});
}

function updatePostStats(pid) {

	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	$.ajax({
		url: "Ajax/get.php",
		type: "GET",
		data: {"action":"getPostStats", "uid":uid, "fid":fid, "pid":pid},
		success: function(data) {
			console.log(data);
			if(typeof(data) != "undefined" && typeof(data['coms']) != "undefined") {
				if(data['coms'] != 0) {
			$('#container .post-mini[data-id="'+pid+'"]').find('.stats').remove();
			$('#container .post-mini[data-id="'+pid+'"]').append('<div class="stats"><div class="comments-indicator"><div>'+data['coms']+' <i class="fa fa-comment"></i></div></div></div>');
					if(data['unread'] == true) {
						$('.post-mini[data-id="'+pid+'"] .comments-indicator div').addClass('newcom');
					}
				} else {
			$('#container .post-mini[data-id="'+pid+'"]').find('.stats').remove();
				}
			}
		}
	});
}

function changeSecretLink() {

	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');

	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"changeSecretLink", "uid":uid, "fid":fid},
		success: function(data) {
			console.log(data);
			window.location.reload();
		}
	});
}

function removeUserFromForum() {
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');

	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"removeUserFromForum", "uid":uid, "fid":fid},
		success: function(data) {
			console.log(data);
			window.location = location.protocol + "//" + location.host + location.pathname;
		},
		error: function() {
			console.log("fail to remove forum");
		}
	});
}


function loadRetoucheBox(w,h,action) {
	r = $('#retoucheBox');
	r.attr('data-w',w);
	r.attr('data-h',h);
	r.attr('data-action',action);
	showimageeditor("#retoucheBox");
}


function destroyAccount(id) {
	var password = $(id).val();
	if(password == null || password.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	console.log(password,uid);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"destroyAccount", "uid":uid, "password":password},
		success: function(data) {
			console.log(data);
			disconnect();
		}
	});
}

function changeforumname(id) {
	name = $(id).val();
	if(name == null || name.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"changeForum", "uid":uid, "fid":fid, "name":name},
		success: function(data) {
			console.log(data);
			location.reload();
		}
	});
}

function changename(id) {
	name = $(id).val();
	if(name == null || name.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"changeProfile", "uid":uid, "name":name},
		success: function(data) {
			console.log(data);
			location.reload();
		}
	});
}

function inviteUser(id) {
	if(id.match(/.+@.+/)) {
		mail = id;
	} else {
		mail = $(id).val();
	}
	if(mail == "" || typeof(mail) == 'undefined') {
		return false;
	}
	uid = $('#info').attr('data-uid');
	forum = $('#info').attr('data-fid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {'action':'inviteUser', 'uid':uid, 'mail':mail, 'forum':forum},
		success: function(data) {
				console.log(data);
				console.log("success!");
				window.location.reload(true); 
			},
		error: function(){console.log('fail!');}
	});
}

function changepassword(old_id,new_id) {
	old_password = $(old_id).val();
	new_password = $(new_id).val();
	if(old_password == null || old_password.match(/^\s*$/)) {
		return false;
	}
	if(new_password == null || new_password.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"changeProfile", "uid":uid, "old_password":old_password, "new_password":new_password},
		success: function(data) {
			console.log(data);
			location.reload();
		}
	});
	//nz.html(name);
}

function sendIt(id) {
	msg = "";
	if(id == "#commentBox" || id == "#editBox") {
		var parentID = $('#post-viewer').attr('data-id');
	} else {
		var parentID = 0;
	}
	if(id == "#editBox") {
		var pid = $(id).parent().attr('data-id');
	} else {
		var pid = 0;
	}
	t = $(id);
	for(i=0;i<t.children().length;i++) {
		c = $(t.children()[i]);
		if(c.hasClass("deletable")) {
			msg += " "+c.attr('data-src');
		} else {
			msg += " "+decode(c.html());
		}
	}
	uid = $('#info').eq(0).attr('data-uid');
	forum = $('#info').eq(0).attr('data-fid');
	console.log("text:"+msg+",forum:"+forum+",uid:"+uid+",parent:"+parentID+",pid:"+pid);
	var baliseId = createId();
	$.ajax({
		url: "Ajax/save_msg.php",
		type: "POST",
		data: {"text":msg,"forum":forum,"uid":uid,"parent":parentID,"pid":pid},
		success: function(data) {
			console.log(data);
				if(data['parent'] == 0 || data['parent'] == null) {
					console.log("new post");
					var balise = $('#container div[data-balise="'+baliseId+'"]');
					if(data['miniature'] != null) {
						balise.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><div class="post-preview"><img src="'+data['miniature']+'"/></div></div>');
					} else {
						balise.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><div class="post-preview">'+data['html_preview']+'</div></div>');
					}
					balise.remove();
					hidepostviewer();
				} else {
					if(data['pid'] == 0 || data['pid'] == null) {
						console.log("new com");
						var balise = $('.child-post[data-balise="'+baliseId+'"]');
						balise.after(data['html']);
						balise.remove();
						typebox.view();
						var p = $('#container .post-mini[data-id='+data['parent']+']');
						p.remove();
						$('#container').prepend(p);
						updatePostStats(data['parent']);
					} else {
						if(data['parent'] == data['pid']) {
							console.log("edit post");
							var pp = $('.parent-post');
							pp.after(data['html']);
							pp.remove();
							typebox.view();
							var p = $('#container .post-mini[data-id='+data['pid']+']');
							if(data['miniature'] != null) {
								p.after('<div class="material-shadow post-mini" data-id="'+data['pid']+'"><img src="'+data['miniature']+'"/></div>');
							} else {
								p.after('<div class="material-shadow post-mini" data-id="'+data['pid']+'">'+data['html_preview']+'</div>');
							}
							p.remove();
						} else {
							console.log("edit com");
							var balise = $('.child-post[data-id='+data['pid']+']');
							balise.after(data['html']);
							balise.remove();
						}
					}
				}
				setpostsviewable();
			},
		error: function(a,b,c){ console.log(a,b,c) }
	});
	if(parentID == 0 || parentID == null) {
		if(pid == 0 || pid == null) {
			var post_loading = $('<div data-balise="'+baliseId+'" class="post-mini"><div class="spinner"><div class="bg-orange bounce1"></div><div class="bg-orange bounce2"></div><div class="bg-orange bounce3"></div></div></div>');
			$('#container').prepend(post_loading);
			hidenewpost(true);
		}
	} else {
		if(pid == 0 || pid == null) {
			hidenewcommentsection($('.new-comment-section'));
			var com_loading = $('<div class="post child-post" data-balise="'+baliseId+'"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>');
			$('.new-comment-section').before(com_loading);
		}
	}
}

function setpostsviewable() {
	$('.post-mini').off();
	$('.post-mini').on("click",function(e) {
		togglepostviewer(e);
	});
}

function deletePost(t) {
	if(confirm("Voulez-vous vraiment supprimer ce message ?")) {
		var p = $(t).closest('.post');
		var id = p.attr('data-id');
		console.log("delete:"+id);
		var forum = $('#info').attr('data-fid');
		$.ajax({
			url: "Ajax/post.php",
			type: "POST",
			data: {"action":"deletePost", "id":id,"forum":forum},
			success: function(data) {
					console.log(data);
					if(p.hasClass('parent-post')) {
						hidepostviewer();
						$('#container .post-mini[data-id='+id+']').remove();
					} else {
						$('.post[data-id='+id+']').remove();
					}
					var ppid = $('#post-viewer').attr('data-id');
					updatePostStats(ppid);
				}
		});
	}
}

function editPost(t) {
	var p = $(t).closest('.post');
	var pid = p.attr('data-id');
	$.ajax({
		url: "Ajax/get.php",
		type: "get",
		data: {"action":"getRaw","pid":pid},
		success: function(data) {
			box = '<div id="editBox" class="dynamicBox">';
			box += '<div contenteditable="true" data-placeholder="Ecrivez quelque chose...">'+data['raw']+'</div>';
			box += '</div>';
			box += '<div class="menu">';
			box += '<div class="menu-cell">';
			box += '<button id="cancelit" onclick="hidepostviewer()">Annuler</button>';
			box += '</div>';
			box += '<div class="menu-cell">';
			box += '<button id="sendit" onclick="sendIt(\'#editBox\')">Envoyer</button>';
			box += '</div>';
			box += '</div>';
			p.html(box);
			typebox.start("#editBox");
			typebox.evaluate("#editBox");
		}
	});
}

function loadMorePosts() {
	if(!window.loading) {
		console.log("trying to load posts");
		window.loading = true;
		var list = $('#container .post-mini').map(function(){ var t = this.dataset.id; return t; }).get();
		list = JSON.stringify(list);
		var fid = $('#info').attr('data-fid');
		$.ajax({
			url: 'Ajax/post.php',
			type: 'POST',
			data: {'action':'morePost','fid':fid,'list':list},
			success: function(data) {
				console.log(data);
				if(typeof(data) != 'undefined' && data != "") {
					if(data['count'] > 0) {
						$('#container').append(data['html']);
					}
					console.log('loaded ('+data['count']+')');
					if(data['count'] < 30) {
						console.log('all posts are here !');
						window.stop = true;
						$(document).unbind('scroll');
					}
					setpostsviewable();
					window.loading = false;
				}
			},
			error: function() {
				console.log("fail to load more posts");
				window.loading = false;
			}
		});
	}
}
	
function disconnect() {
	$.ajax({
		url: "Ajax/connect.php",
		type: "POST",
		data: {"mail":"", "password":""},
		success: function(data) {
				window.location = location.protocol + "//" + location.host + location.pathname;
			}
	})
}

function cancelAsk() {
	$('#ask').remove();
	removeMask('askMask');
}

function answerAsk(callback, args) {
	var r = $('#ask input').val();
	cancelAsk();
	callback(r, args);
}

function ask(question, maxlength, callback, args) {
		var dialog_div = $('<div id="ask"></div>');
		var body = $('<span>'+question+'</span>');
		var user_input = $('<input type="text" maxlength="'+maxlength+'"></input>');
		var submit_button = $('<button>Ok</button>');
		submit_button.on('click', function(){ answerAsk(callback, args); });
		var cancel_button = $('<button onclick="cancelAsk()">Annuler</button>');
		dialog_div.append(body).append(user_input).append(submit_button).append(cancel_button);
		
		$('body').append(dialog_div);
		addMask("cancelAsk()", 0.4, 9000, "askMask");
}

function addForum(name) {
	if(name == null || name.match(/^\s*$/)) {
		return false;
	} 
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {'action':'addForum', 'uid':uid, 'name':name},
		success: function(data) {
				console.log(data);
				console.log("success!");
				if(typeof(data) != "undefined") {
					window.location.href = data['link']; 
				} else {
					window.location.reload(true); 
				}
			},
		error: function(){console.log('fail!');}
	});
}

function addUserToForum(t) {
	nid = $(t).parent().attr('data-id');
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {'action':'addUserToForum', 'uid':uid, 'nid':nid},
		success: function(data) {
				console.log(data);
				console.log("success!");
				window.location.reload(true); 
			},
		error: function(){console.log('fail!');}
	});
	$(t).parent().remove();
}

function removeNotification(t) {
	nid = $(t).parent().attr('data-id');
	console.log(nid);
	console.log(t);
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {'action':'removeNotification', 'uid':uid, 'nid':nid},
		success: function(data) {
				console.log(data);
				console.log("success!");
				//window.location.reload(true); 
			},
		error: function(){console.log('fail!');}
	});
	$('*[data-id="'+nid+'"]').remove();
}

function inputFile(id) {
	input = $('<input class="hidden" data-id="'+id+'" type="file"></input>');
	input.on('change', handleFileSelect);
	$('body').append(input);
	input.click();
}

function handleFileSelect(evt) {
	var files = evt.target.files;
	var id = evt.target.dataset.id;
	console.log("change!");
	file = files[0];
	evt.target.value = null;
	if(!window.sending) {
		console.log(file.type);
		console.log(file);
		var fileTypeHandled = false;
		if(file.type.match(/image/)) {
			fileTypeHandled = true;
			if(file.size > 1024*1024*30) {
				alert("fichier image trop lourd (max 30Mo)");
			} else {
				PF.loadImage(file,id);
			}
		}
		if(file.type.match(/video/)) {
			fileTypeHandled = true;
			if(file.size > 1024*1024*300) {
				alert("fichier vidéo trop lourd (max 300Mo)");
			} else {
				PF.loadVideo(file,id);
			}
		}
		if(file.type.match(/sgf/) || file.name.match(/sgf/)) {
			fileTypeHandled = true;
			if(file.size > 1024*1024*3) {
				alert("fichier SGF trop lourd (max 3Mo)");
			} else {
				console.log("SGF DETECTED");
				PF.loadSGF(file,id);
			}
		}
		if(!fileTypeHandled) {
			alert("Le format du fichier n'est pas supporté");
		}
	}
}

function playpause(t) {
	if(t.paused) {
		t.play();
	} else {
		t.pause();
	}
}

function loadImage(t) {
	t = $(t).closest('.launcher');
	var src = t.attr('data-src');
	var img = $('<img class="inlineImage" onerror="error_im(this)" src="'+src+'"/>');
	img.on('load', function() {
		t.after(img);
		img.off()
		t.remove();
	});
	t.on('click', function() {
		return false;
	});
	t.addClass('launcher-loading');
}

function loadVideo(t) {
	t = $(t).closest('.launcher');
	var src = t.attr('data-src');
	var vid = $('<video class="inlineImage" onclick="playpause(this)" loop autoplay src="'+src+'"></video>');
	// TODO use canplaythrough ?
	vid.on('canplay', function() {
		t.after(vid);
		vid.off();
		t.remove();
	});
	t.on('click', function() {
		console.log('spam');
		return false;
	});
	t.addClass('launcher-loading');
	console.log(vid);
}

function loadIframe(t) {
	t = $(t).closest('.launcher');
	var src = t.attr('data-src');
	var iframe = $('<iframe class="embed-responsive-item" seamless allowfullscreen frameborder="0" scrollable="no" allowTransparency="true" src="'+src+'"/><iframe>');
	t.after(iframe);
	t.remove();
	// iframe bug
	$('iframe:not([src])').remove();
}
