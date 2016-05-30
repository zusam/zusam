function cancelAsk() {
	$('#ask').remove();
	removeMask('askMask');
}

function answerAsk(callback, args) {
	var r = $('#ask .input').val();
	cancelAsk();
	callback(r, args);
}

function answerAskList(callback, args) {
	var si = $('#ask .input')[0].selectedIndex;
	var r = $('#ask .input')[0].childNodes[si].value;
	cancelAsk();
	callback(r, args);
}

function ask(question, maxlength, callback, args) {
	var dialog_div = $('<div id="ask"></div>');
	var body = $('<span>'+question+'</span>');
	var user_input = $('<input class="input" type="text" maxlength="'+maxlength+'"></input>');
	var submit_button = $('<button>Ok</button>');
	submit_button.on('click', function(){ answerAsk(callback, args); });
	var cancel_button = $('<button onclick="cancelAsk()">Annuler</button>');
	dialog_div.append(body).append(user_input).append(cancel_button).append(submit_button);
	
	$('body').append(dialog_div);
	addMask("cancelAsk()", 0.4, 9000, "askMask");
}

function askList(question, list, callback, args) {
	var dialog_div = $('<div id="ask"></div>');
	var body = $('<span>'+question+'</span>');
	var user_input = $('<select class="input"></select>');
	for(i=0; i<list.length; i++) {
		user_input.append('<option value="'+list[i].value+'">'+list[i].text+'</option>');
	}
	var submit_button = $('<button>Ok</button>');
	submit_button.on('click', function(){ answerAskList(callback, args); });
	var cancel_button = $('<button onclick="cancelAsk()">Annuler</button>');
	dialog_div.append(body).append(user_input).append(cancel_button).append(submit_button);
	
	$('body').append(dialog_div);
	addMask("cancelAsk()", 0.4, 9000, "askMask");
}

