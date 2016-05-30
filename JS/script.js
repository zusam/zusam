function rePost(e) {
	var list = JSON.parse($('#info .forums').html());
	for(i=0;i<list.length;i++) {
		list[i].text = list[i].name;
	}
	var p = $(e).closest('.post');
	var msg = "";
	var t = p.find('.dynamicBox')[0];
	for(i=0;i<t.childNodes.length;i++) {
		node = t.childNodes[i];
		if(node.tagName == 'SPAN') {
			if(node.dataset.type == "imageDump") {
				msg += " "+node.getElementsByTagName('SPAN')[0].innerHTML;
			} else {
				msg += " "+node.dataset.txt;
			}
		} else {
			if(typeof(node.innerHTML) != "undefined") {
				msg += " "+decode(node.innerHTML);
			}
		}
	}
	askList("Partager dans quel groupe ?",list,sendRePost,{"msg":msg});
}

function sendRePost(fid,args) {
	var uid = $('#info').attr('data-uid');
	console.log(fid,args,uid);
	$.ajax({
		url: "Ajax/save_msg.php",
		type: "POST",
		data: {"text":args.msg,"forum":fid,"uid":uid,"parent":0,"pid":0},
		success: function(data) {
			console.log(data);
		},
		error: function(){ console.log("fail repost"); }
	});
}

function removeNotification(e) {
	var nid = $(e).attr('data-nid');
	var uid = $('#info').attr('data-uid');
	if(nid === null || nid === "") {
		return false;
	}
	$.ajax({
		url:"Ajax/post.php",
		type:"post",
		data:{"action":"removeNotification","nid":nid, "uid":uid},
		success: function(data) {
			console.log(data);
			$(e).remove();
		},
		error: function() {
			console.log("fail");
		}
	});
}

function keepFormat(e,f) {
	f = parseFloat(f);
	var w = $(e).width();
	//var h = $(e).height();
	var nh = Math.round(w/f);
	//console.log(nh);
	$(e).attr('height',nh+"px");
}

//function toBasicLink(e,ev) {
//	var d = $(e).closest('.deletable');
//	var url = d.find('a').attr('href');
//	var bl = typebox.Filter.fail_request(url); //$('<a class="b-link" href="'+url.replace(/\s/," ")+'" target="_blank">'+url+'</a>');
//	d.html(bl);
//	typebox.refreshContent(false, d.closest('.dynamicBox'));
//	ev.stopPropagation();
//	ev.preventDefault();
//	return false;
//}

function recordUsage(usage) {
	$.ajax({
		url:"Ajax/post.php",
		type:"post",
		data:{"action":"recordUsage","usage":usage},
		success: function(data) {
			//console.log(data);
		},
		error: function() {
			console.log("fail record");
		}
	});
}

function getMoreComments(pid) {
	var uid = $('#info').attr('data-uid');
	var fid = $('#info').attr('data-fid');
	$.ajax({
		url: "Ajax/get.php",
		type: "GET",
		data: {"action":"getMoreComments", "uid":uid, "fid":fid, "pid":pid},
		success: function(data) {
			console.log(data);
			$('#post-viewer .more_comments').after(data.html);
			$('#post-viewer .more_comments').remove();
			lazyload($('.nano-content')[0]);
		},
		error: function() {
			console.log('fail more_comments');
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
			if(typeof(data) != "undefined") {
				var p = $('#container .post-mini[data-id="'+pid+'"] .post-info');
				if(data.coms !== 0) {
					var pci = p.find('.comments-indicator');
					pci.html('<div>'+data.coms+' <i class="icon-comment-empty"></i></div>');
				} else {
					p.find('.comments-indicator').html('');
				}
				if(data.unread === true) {
					p.addClass('newcom');
				} else {
					p.removeClass('newcom');
				}
				p.find('.date').html(data.date);
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

function destroyAccount(t) {
	if(t === null) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	var data = {};
	$(t).closest('.change-profile').find('input').each(function() {
		data[$(this).attr('name')] = $(this).val();	
	});
	var password = data.password;
	if(password === null || password.match(/^\s*$/)) {
		return false;
	}
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
	if(name === null || name.match(/^\s*$/)) {
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

function changeProfile(t) {
	if(t === null) {
		return false;
	}
	var uid = $('#info').attr('data-uid');
	var data = {};
	$(t).closest('.change-profile').find('input').each(function() {
		var type = $(this).attr('type');
		if(type == "text" || type == "password" || type == "mail") {
			data[$(this).attr('name')] = $(this).val();	
		} else {
			data[$(this).attr('name')] = $(this).prop('checked');
		}
	});
	data = JSON.stringify(data);
	console.log(data);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {"action":"changeProfile", "uid":uid, "data":data},
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
	if(mail === "" || typeof(mail) == 'undefined') {
		return false;
	}
	console.log(mail);
	uid = $('#info').attr('data-uid');
	fid = $('#info').attr('data-fid');
	console.log(uid,fid);
	$.ajax({
		url: "Ajax/post.php",
		type: "POST",
		data: {'action':'inviteUser', 'uid':uid, 'mail':mail, 'fid':fid},
		success: function(data) {
				console.log(data);
				console.log("success!");
				window.location.reload(true); 
			},
		error: function(){console.log('fail!');}
	});
}

function sendIt(id) {
	// reset queue position
	positionInQueue = 1;
	var node;
	var msg = "";
	var parentID = 0;
	var pid = 0;
	if(id == "#commentBox" || id == "#editBox") {
		parentID = $('#post-viewer').attr('data-id');
	} 
	if(id == "#editBox") {
		pid = $(id).closest('.post').attr('data-id');
	}
	var t = $(id)[0];
	for(i=0;i<t.childNodes.length;i++) {
		node = t.childNodes[i];
		if(node.tagName == 'SPAN') {
			if(node.dataset.type == "imageDump") {
				msg += " "+node.getElementsByTagName('SPAN')[0].innerHTML;
				console.log(msg);
			} else {
				msg += " "+node.dataset.txt;
			}
		} else {
			if(typeof(node.innerHTML) != "undefined") {
				msg += " "+decode(node.innerHTML);
			}
		}
	}
	var uid = $('#info').attr('data-uid');
	var forum = $('#info').attr('data-fid');
	console.log("text:"+msg+",forum:"+forum+",uid:"+uid+",parent:"+parentID+",pid:"+pid);
	var baliseId = createId();
	$.ajax({
		url: "Ajax/save_msg.php",
		type: "POST",
		data: {"text":msg,"forum":forum,"uid":uid,"parent":parentID,"pid":pid},
		success: function(data) {
			var balise;
			var p;
			console.log(data);
				if(data.parent == "0" || data.parent === null) {
					balise = $('#container div[data-balise="'+baliseId+'"]');
					balise.after(data.mini_html);
					balise.remove();
					hidepostviewer();
				} else {
					if(data.pid == "0" || data.pid === null) {
						console.log("new com");
						balise = $('.child-post[data-balise="'+baliseId+'"]');
						balise.after(data.html);
						balise.remove();
						typebox.view();
						p = $('#container .post-mini[data-id='+data.parent+']');
						p.remove();
						$('#container').prepend(p);
						updatePostStats(data.parent);
					} else {
						if(data.parent == data.pid) {
							console.log("edit post");
							var pp = $('.parent-post');
							pp.after(data.html);
							pp.remove();
							typebox.view();
							p = $('#container .post-mini[data-id='+data.pid+']');
							p.after(data.mini_html);
							p.remove();
						} else {
							console.log("edit com");
							balise = $('.child-post[data-id='+data.pid+']');
							balise.after(data.html);
							balise.remove();
						}
					}
				}
				setpostsviewable();
			},
		error: function(a,b,c){ console.log(a,b,c); }
	});
	if(parentID === 0) {
		if(pid === 0) {
			var post_loading = $('<div data-balise="'+baliseId+'" class="post-mini"><div class="spinner"><div class="bg-orange bounce1"></div><div class="bg-orange bounce2"></div><div class="bg-orange bounce3"></div></div></div>');
			$('#container').prepend(post_loading);
			push_hidenewpost(true);
		}
	} else {
		if(pid === 0) {
			hidenewcommentsection($('.new-comment-section'));
			var com_loading = $('<div class="post child-post" data-balise="'+baliseId+'"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>');
			$('.new-comment-section').before(com_loading);
		}
	}
}

function setpostsviewable() {
	$('.post-mini').off();
	$('.post-mini').on("click",function(e) {
		var id = $(e.currentTarget).attr('data-id');
		push_showpost(id);
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
						$('#container .post-mini[data-id="'+id+'"]').remove();
					} else {
						$('.post[data-id="'+id+'"]').remove();
					}
					var ppid = $('#post-viewer').attr('data-id');
					updatePostStats(ppid);
					loadMorePosts();
				}
		});
	}
}

function editPost(t) {
	var p = $(t).closest('.post');
	var pid = p.attr('data-id');
	var box = $('<div id="editBox" class="dynamicBox"></div>');
	box.append(p.find('.post-text .dynamicBox').html());
	p.html(box);
	p.append(genMenu("hidepostviewer()","inputFile(\'#editBox\')","sendIt(\'#editBox\')"));
	typebox.start("#editBox");
	typebox.evaluate("#editBox");
}

function calcNbToLoad() {
	var loaded = $('.post-mini').length;
	
	var width = window.innerWidth;
	if(width > 680) {
		width = width - 200;
	}
	var height = window.innerHeight + window.pageYOffset;
	var margin = 10;

	var ncol = Math.max(parseInt(width / (320+margin)), 1);
	var nlin = Math.max(parseInt(height / (180+margin)), 1);

	var viewing = Math.min(ncol * nlin, loaded);
	var goal = ncol * 2;
	if(loaded === 0) {
		goal = ncol * (nlin + 1);
	}

	var toView = loaded - viewing;
	var toLoad = parseInt(Math.max(0, goal - toView));

	//console.log(nlin, ncol, toView, goal, viewing, loaded, toLoad);

	return toLoad;
}

function loadMorePosts() {
	if(!window.loading_posts) {
		window.loading_posts = true;
		var list = $('.post-mini').map(function(){ var t = this.dataset.id; return t; }).get();
		list = JSON.stringify(list);
		var fid = $('#info').attr('data-fid');

		// calculate number of posts to load
		var number = calcNbToLoad();
		if(number > 0) {
			//console.log("trying to load posts");
			$.ajax({
				url: 'Ajax/post.php',
				type: 'POST',
				data: {'action':'morePost','fid':fid,'list':list,'number':number},
				success: function(data) {
					//console.log(data);
					if(typeof(data) != 'undefined' && data !== "") {
						if(data.count > 0) {
							$('#container').append(data.html);
						}
						//console.log('loaded ('+data.count+')');
						if(data.end === true) {
							console.log('all posts are here !');
							$(document).unbind('scroll');
						}
						setpostsviewable();
						window.loading_posts = false;
						return true;
					}
				},
				error: function() {
					console.log("fail to load more posts");
					window.loading_posts = false;
					setTimeout(function() {
						loadMorePosts();
					}, 5000);
					return false;
				}
			});
		} else {
			window.loading_posts = false;
		}
	}
}
	
function disconnect() {
	$.ajax({
		url: "Ajax/connect.php",
		type: "POST",
		data: {"mail":"", "password":""},
		success: function(data) {
				document.cookie = 'auth_token' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				window.location = location.protocol + "//" + location.host + location.pathname;
			}
	});
}

function addForum(name) {
	if(name === null || name.match(/^\s*$/)) {
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
					window.location.href = data.link; 
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
				if(typeof(data) != "undefined") {
					window.location.href = data.link; 
				} else {
					window.location.reload(true); 
				}
			},
		error: function(){console.log('fail!');}
	});
	$(t).parent().remove();
}

function inputFile(id) {
	input = $('<input class="hidden" data-id="'+id+'" type="file" multiple></input>');
	input.on('change', PF.handleFileSelect);
	$('body').append(input);
	input.click();
}

function evaluateURL() {
	if(window.location.href.match(/\#[a-zA-Z0-9]+$/)) {
		var tag = window.location.href.replace(/.*\#([a-zA-Z0-9]+)/,"$1");
		if(tag.length == 24) {
			var pid = tag;
			if(active_post != pid) {
				showpostviewer(pid);
			}
		} else {
			if(tag == "newpost") {
				shownewpost();
			}
		}
	} else {
		console.log("hideAll from evaluate");
		hideAll();
	}
}

function limitHeight(p) {
	p = $(p);
	console.log(p.outerHeight(), window.innerHeight*2);
	if(p.outerHeight() > (window.innerHeight*2)) {
		$(p).css('max-height',Math.floor(window.innerHeight*0.75) + "px");
		$(p).append('<div class="seeMore" onclick="this.parentNode.style.maxHeight = \'none\'; $(this).remove()"><span>Voir plus</span></div>');
	}
}

function loadImage(t) {
	t = $(t).closest('.launcher');
	t.on('click', function() {
		return false;
	});
	var src = t.attr('data-src');
	var img = $('<img class="inlineImage" onerror="error_im(this)" src="'+src+'"/>');
	img.on('load', function() {
		t.after(img);
		img.off();
		t.remove();
	});
	// TODO handle this nicely
	img.on('error', function(e) {
		t.after(typebox.Filter.fail_request(src));
		t.remove();
		console.log(e);
	});
	t.addClass('launcher-loading');
}

function loadVideo(t) {
	t = $(t).closest('.launcher');
	t.on('click', function() {
		console.log('spam');
		return false;
	});
	var src = t.attr('data-src');
	var vid = $('<video class="inlineImage" controls loop autoplay src="'+src+'"></video>');
	// TODO use canplaythrough ?
	vid.on('canplay', function() {
		t.after(vid);
		vid.off();
		t.remove();
	});
	// TODO handle this nicely
	vid.on('error', function(e) {
		t.after(typebox.Filter.fail_request(src));
		t.remove();
		console.log(e);
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

function loadIframeNoPlay(t) {
	t = $(t).closest('.launcher');
	var src = t.attr('data-srcnoplay');
	var iframe = $('<iframe class="embed-responsive-item" seamless allowfullscreen frameborder="0" scrollable="no" allowTransparency="true" src="'+src+'"/><iframe>');
	t.after(iframe);
	t.remove();
	// iframe bug
	$('iframe:not([src])').remove();
}

function loadMoreImages(t) {
	var stock = t.getElementsByTagName('span')[0];
	var dump = stock.innerHTML.match(/\{\:[a-zA-Z0-9]+\:\}/g);
	var toLoad = [];
	var l = dump.length;
	for(i=0;(i<10 && i<l);i++) {
		toLoad.push(dump.shift());	
	}
	console.log(JSON.stringify(toLoad));
	$.ajax({
		url: "Ajax/post.php",
		type: "post",
		data: {"action":"loadMoreImages","dump":JSON.stringify(toLoad)},
		success: function(data) {
			console.log(data);
			$(t).closest('.deletable').before(data.html);
			if(stock.innerHTML === "") {
				$(t).closest('.deletable').remove();
			}
		},
		error: function() {
			console.log('fail to retrieve more images');
		}
	});
	var rest = "";
	for(i=0;i<dump.length;i++) {
		rest += " "+dump[i];
	}
	stock.innerHTML = rest;
}
