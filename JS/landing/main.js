function start() {
	$("#landing .login-form").on("submit", function(e) {
		e.preventDefault();	
		console.log("submitted");
		action = $(this).children(".action").val();
		mail = $(this).children(".mail").val();
		password = $(this).children(".password").val();
		action = $(this).attr('data-action');
		$.ajax({
			url: "Ajax/connect.php",
			type: "POST",
			data: {"action":action, "mail":mail, "password":password},
			success: function(data) {
					console.log(data);
					window.location.reload(true); 
				},
			error: function() {
					console.log("fail");
				}
		})
	});
}

function stop() {
	$("#landing > .login-form").off();
}

function switchForm() {
	if($('#landing .login-form').attr('data-action') == "login") {
		landing.switchToSignup();
	} else {
		landing.switchToLogin();
	}
}

function switchToLogin() {
	$('#landing .signin').html('S\'inscrire');
	$('#landing .center-form .title-form').html('Se connecter');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/pre5.jpg"), url("Assets/Backgrounds/small/pre5.jpg")');
	$('#landing .login-form').attr('data-action','login');
}
function switchToSignup() {
	$('#landing .signin').html('Se connecter');
	$('#landing .center-form .title-form').html('S\'inscrire');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/pre2.jpg"), url("Assets/Backgrounds/small/pre2.jpg")');
	$('#landing .login-form').attr('data-action','signup');
}
