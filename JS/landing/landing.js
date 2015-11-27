function start(redirect_url) {
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
					window.location.reload();
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
	$('#landing .background').css('background-image','url("Assets/Backgrounds/16.jpg"), url("Assets/Backgrounds/small/16.jpg")');
	$('#landing .login-form').attr('data-action','login');
}
function switchToSignup() {
	$('#landing .signin').html('Se connecter');
	$('#landing .center-form .title-form').html('S\'inscrire');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/1.jpg"), url("Assets/Backgrounds/small/1.jpg")');
	$('#landing .login-form').attr('data-action','signup');
}
