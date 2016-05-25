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
		dialog_div.append(body).append(user_input).append(cancel_button).append(submit_button);
		
		$('body').append(dialog_div);
		addMask("cancelAsk()", 0.4, 9000, "askMask");
}

