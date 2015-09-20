var Dialog = (function(){
	var pub = {};
	var param = {};

	var callback;

	function addMask(func, darkness) {
		mask = $('<div id="mask" onclick="'+func+'"></div>');
		$('body').append(mask);
		$('body').css({'overflow':'hidden','max-height':'100%'});
		$('#mask').css('background','rgba(0,0,0,'+darkness+')');
	}

	function removeMask() {
		$('#mask').remove();
	}

	function showDialog() {
		var d = createDialog();
		$('body').append(d);
		addMask("Dialog.hideDialog()", 0.2);
	}

	function hideDialog() {
		var r = $('#'+param['myID']+' input').val();
		$('#'+param['myID']).remove();
		removeMask();
		return r;
	}

	function createDialog() {
		var dialog_div = $('<div id="prompt"></div>');
		var body = $('<span>'+param['text']+'</span>');
		var user_input = $('<input type="text" maxlength="'+param['maxlength']+'" placeholder="'+param['placeholder']+'"></input>');
		var submit_button = $('<button onclick=">'+param['submit_text']+'</button>');
		dialog_div.append(body).append(user_input).append(submit_button);
		
		dialog_div.css({
			"position":"absolute",
			"top":"50%",
			"left":"50%",
			"transform":"translate(-50%, -50%)",
			"-webkit-transform":"translate(-50%, -50%)"
		});

		return dialog_div;
	}

	pub.ask(p, c) {
		param = p;
		callback = c;
		showDialog();
	}


	return pub;
}());
