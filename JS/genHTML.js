function genFakeComment() {
	var opimg = $('#info').attr('data-avatar');
	var fc;
	if(opimg === "") {
		opimg = $('.my_avatar').html();
		fc = $('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><div class="op-img">'+opimg+'</div><span>Ecrire un commentaire...</span></div></div>');
	} else {
		fc = $('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><img class="op-img" src="'+opimg+'"/><span>Ecrire un commentaire...</span></div></div>');
	}
	return fc;
}

function genMenu(cancel,action,send) {
	var np_menu = $('<div class="menu"></div>');
	var np_cell1 = $('<div class="menu-cell"></div>');
	np_cell1.append('<button class="cancel" onclick="'+cancel+'">Annuler</button>');
	var np_cell2 = $('<div class="menu-cell"></div>');
	np_cell2.append('<button onclick="'+action+'" class="action"><i class="icon-attach"></i></button>');
	var np_cell3 = $('<div class="menu-cell"></div>');
	np_cell3.append('<button class="send" onclick="'+send+'">Envoyer</button>');
	np_menu.append(np_cell1);
	np_menu.append(np_cell2);
	np_menu.append(np_cell3);
	return np_menu;
}
