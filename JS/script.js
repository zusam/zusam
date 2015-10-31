function changeSecretLink() {

	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-forum');

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
	var fid = $('#info').attr('data-forum');

	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"removeUserFromForum", "uid":uid, "fid":fid},
		success: function(data) {
			console.log(data);
			window.location = location.protocol + "//" + location.host + location.pathname;
		}
	});
}


function loadRetoucheBox(w,h,action) {
	r = $('#retoucheBox');
	r.attr('data-w',w);
	r.attr('data-h',h);
	r.attr('data-action',action);
	togglenewavatar();
}


function destroyAccount(id) {
	password = $(id).val();
	if(password == null || password.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
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
	var fid = $('#info').attr('data-forum');
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
	forum = $('#info').attr('data-forum');
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
		parentID = $('#post-viewer').attr('data-id');
	} else {
		parentID = 0;
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
	forum = $('#info').eq(0).attr('data-forum');
	console.log("text:"+msg+",forum:"+forum+",uid:"+uid+",parent:"+parentID+",pid:"+pid);
	var baliseId = Date.now().toString(36)+Math.random().toString(16);
	$.ajax({
		url: "Ajax/save_msg.php",
		type: "POST",
		data: {"text":msg,"forum":forum,"uid":uid,"parent":parentID,"pid":pid},
		success: function(data) {
			console.log(data);
				if(data['parent'] == 0 || data['parent'] == null) {
					if(data['pid'] == 0 || data['pid'] == null) {
						console.log("new post");
						var balise = $('#container div[data-balise="'+baliseId+'"]');
						balise.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><img src="'+data['miniature']+'"/></div>');
						balise.remove();
					} else {
						console.log("edit post");
						var p = $('#container .post-mini[data-id='+data['pid']+']');
						p.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><img src="'+data['miniature']+'"/></div>');
						p.remove();
						hidenewpost();
					}
					setpostsviewable();
					hidepostviewer();
				} else {
					if(data['pid'] == 0 || data['pid'] == null) {
						console.log("new com");
						$('.new-comment-section').before(data['html']);				
						//$('.new-comment-section').before('<div class="post-separator"></div>');				
						hidenewcommentsection($('.new-comment-section'));
						typebox.view();
						var p = $('#container .post-mini[data-id='+data['pid']+']');
						p.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><img src="'+data['miniature']+'"/></div>');
						p.remove();
					} else {
						console.log("edit com");
						var balise = $('.child-post[data-id='+data['pid']+']');
						balise.after(data['html']);
						balise.remove();
						//var p = $('#container .post-mini[data-id='+data['pid']+']');
						//p.after('<div class="material-shadow post-mini" data-id="'+data['id']+'"><img src="'+data['miniature']+'"/></div>');
						//p.remove();
						//hidenewpost();
						//setpostsviewable();
						//hidepostviewer();
					}
				}
			},
		error: function(a,b,c){ console.log(a,b,c) }
	});
	if(parentID == 0 || parentID == null) {
		if(pid == 0 || pid == null) {
			var post_loading = $('<div data-balise="'+baliseId+'" class="material-shadow post-mini"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
			$('#container').prepend(post_loading);
			hidenewpost();
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
	p = $(t).parent().parent().parent().parent();
	id = p.attr('data-id');
	console.log("delete:"+id);
	forum = $('#info').attr('data-forum');
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"deletePost", "id":id,"forum":forum},
		success: function(data) {
				if(p.hasClass('parent-post')) {
					hidepostviewer();
					$('.post-mini[data-id='+id+']').remove();
				} else {
					$('.post[data-id='+id+']').remove();
				}
			}
	});
}

function editPost(t) {
	var p = $(t).parent().parent().parent().parent();
	var pid = p.attr('data-id');
	//var forum = $('#info').attr('data-forum');
		$.get("Ajax/get.php?action=getRaw&pid="+pid, function(data) {
			//console.log(data);
			box = '<div id="editBox" class="dynamicBox">';
			box += '<div contenteditable="true" data-placeholder="Ecrivez quelque chose...">'+data['raw']+'</div>';
			box += '</div>';
			box += '<div class="menu">';
			box += '<div class="menu-cell">';
			box += '<button id="cancelit" onclick="hidepostviewer()">Cancel</button>';
			box += '</div>';
			box += '<div class="menu-cell">';
			box += '<button id="sendit" onclick="sendIt(\'#editBox\')">Send</button>';
			box += '</div>';
			box += '</div>';
			p.html(box);
			typebox.start("#editBox");
		});
}

function loadMorePosts() {
	if(!window.loading) {
		window.loading = true;
		forum = $('#info').attr('data-forum');
		$.get('Ajax/morePosts.php?start='+window.n+'&forum='+forum, function(data) {
			$('#container').append(data['html']);
			if(data['entries'] < 30) {
				window.stop = true;
				$(document).unbind('scroll');
			} else {
				window.n = window.n + 30;
				window.loading = false;
			}
			setpostsviewable();
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
				window.location.reload(true); 
			},
		error: function(){console.log('fail!');}
	});
}

function addUserToForum(t) {
	nid = $(t).parent().parent().attr('data-id');
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
	$(t).parent().parent().remove();
}

function removeNotification(t) {
	nid = $(t).parent().parent().attr('data-id');
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
		if(file.type.match('image')) {
			PF.loadImage(file,id);
		}
		if(file.type.match('video')) {
			PF.loadVideo(file,id);
		}
	}
}
