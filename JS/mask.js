function addMask(func, darkness, zindex, id) {
	if(id === null) {
		id = "mask";
	}
	mask = $('<div class="mask" id="'+id+'" onclick="'+func+'"></div>');
	$('body').append(mask);
	blockBody();
	$('#'+id).css('background','rgba(0,0,0,'+darkness+')');
	if(zindex !== null) {
		$('#'+id).css('z-index',zindex);
	}
}

function removeMask(id) {
	if(id === null) {
		id = "mask";
	}
	$('#'+id).remove();
	unblockBody();
}
function blockBody() {
	var locks = parseInt($('body').attr('data-locks'));
	if(!locks) {
		locks = 0;
	}
	locks = locks+1;
	//console.log(locks);
	$('body').attr('data-locks',locks);
	$('body').css({'overflow':'hidden','max-height':'100%'});
}
function unblockBody() {
	var locks = parseInt($('body').attr('data-locks'));
	if(!locks) {
		locks = 0;
	}
	locks = locks-1;
	//console.log(locks);
	if(locks < 1) {
		$('body').attr('data-locks',0);
		$('body').css({'overflow':'auto','max-height':'none'});
	} else {
		$('body').attr('data-locks',locks);
	}
}

