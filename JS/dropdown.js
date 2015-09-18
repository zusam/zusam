$(document).ready(function() {

	$(".dropdown").css("position","relative");
	tt = t.attr('data-target');
	$(".dropdown > ul").css({"display":"none","position":"absolute","left":"0","top":"100%","background":"white","list-style":"none","padding":"0"});

	$(".dropdown").on('click',function(event) {
		t = $(event.target);
		if(t.is('i')) {
			t = t.parent();
		}
		tt = t.attr('data-target');
		if(t.attr('active') == 'true') {
			$('#'+tt).css({"display":"none"});
			t.attr('active','');
		} else {
			$('#'+tt).css({"display":"block","z-index":"10"});
			t.attr('active','true');
		}
	});


});
