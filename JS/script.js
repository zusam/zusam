
function changename(id) {
	//nz = $('#mainmenu .myname');
	name = $(id).val();
	if(name == null || name.match(/^\s*$/)) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/changeProfile.php",
		type: "POST",
		data: {"uid":uid, "name":name},
		success: function(data) {
			console.log(data);
			location.reload();
		}
	});
	//nz.html(name);
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
		url: "Ajax/changeProfile.php",
		type: "POST",
		data: {"uid":uid, "old_password":old_password, "new_password":new_password},
		success: function(data) {
			console.log(data);
			location.reload();
		}
	});
	//nz.html(name);
}

function sendIt(id) {
	msg = "";
	if(id == "#commentBox") {
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
	$.ajax({
		url: "Ajax/save_msg.php",
		type: "POST",
		data: {"text":msg,"forum":forum,"uid":uid,"parent":parentID,"pid":pid},
		success: function(data) {
			console.log(data);
				if(data['parent'] == 0 || data['parent'] == null) {
					if(data['pid'] == 0 || data['pid'] == null) {
						$('#container').prepend('<div class="post-mini" data-id="'+data['id']+'"><img src="'+data['preview']+'"/></div>');
					} else {
						var p = $('#container .post-mini[data-id='+data['pid']+']');
						p.after('<div class="post-mini" data-id="'+data['id']+'"><img src="'+data['preview']+'"/></div>');
						p.remove();
					}
					setpostsviewable();
					hidenewpost();
					hidepostviewer();
				} else {
					$('.new-comment-section').before(data['html']);				
					//$('.new-comment-section').before('<div class="post-separator"></div>');				
					hidenewcommentsection($('.new-comment-section'));
					view();
				}
			},
		error: function(){ console.log("fail") }
	});
}

function setpostsviewable() {
	$('.post-mini').off();
	$('.post-mini').on("click",function(e) {
		togglepostviewer(e);
		return false;
	});
}

function deletePost(t) {
	p = $(t).parent().parent().parent().parent();
	id = p.attr('data-id');
	console.log("delete:"+id);
	forum = $('#info').attr('data-forum');
	$.ajax({
		url: "Ajax/deletePost.php",
		type: "POST",
		data: {"id":id,"forum":forum},
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
	var forum = $('#info').attr('data-forum');
		$.get("Ajax/getRaw.php?pid="+pid, function(data) {
			//console.log(data);
			box = '<div id="editBox" class="dynamicBox">';
			box += '<div contenteditable="true" data-placeholder="Share something...">'+data['raw']+'</div>';
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
			start_typebox("#editBox");
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
				window.location.reload(true); 
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
		url: "Ajax/addForum.php",
		type: "POST",
		data: {'uid':uid, 'name':name},
		success: function(data) {
				console.log(data);
				console.log("success!");
			},
		error: function(){console.log('fail!');}
	});
}

function addUserToForum(t) {
	nid = $(t).parent().parent().attr('data-id');
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/addUserToForum.php",
		type: "POST",
		data: {'uid':uid, 'nid':nid},
		success: function(data) {
				console.log(data);
				console.log("success!");
			},
		error: function(){console.log('fail!');}
	});
	$(t).parent().parent().remove();
}

function removeNotification(t) {
	nid = $(t).parent().parent().attr('data-id');
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/removeNotification.php",
		type: "POST",
		data: {'uid':uid, 'nid':nid},
		success: function(data) {
				console.log(data);
				console.log("success!");
			},
		error: function(){console.log('fail!');}
	});
	$(t).parent().parent().remove();
}

function inviteUser(mail, forum) {
	if(mail == null) {
		return false;
	}
	uid = $('#info').attr('data-uid');
	$.ajax({
		url: "Ajax/inviteUser.php",
		type: "POST",
		data: {'uid':uid, 'mail':mail, 'forum':forum},
		success: function(data) {
				console.log(data);
				console.log("success!");
			},
		error: function(){console.log('fail!');}
	});
}

function loadPage(page, fid) {
	if(fid != null) {
		queryData = {'page':page, 'fid':fid};
	} else {
		queryData = {'page':page};
	}
	$.ajax({
		url: "Ajax/load_page.php",
		type: "POST",
		data: queryData,
		success: function(data) {
				hideAll();
				console.log(data);
				console.log("success!");
				if(data['section'] != null) {
					$('section').html(data['section']);	
					setpostsviewable();
				}
				if(data['nav'] != null) {
					$('nav').html(data['nav']);	
				}
			},
		error: function(){console.log('fail!');}
	});
}
