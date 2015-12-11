function start(redirect_url) {
	$("#landing .login-form").on("submit", function(e) {
		e.preventDefault();	
		$('.form-notif').addClass('hidden');
		action = $(this).children(".action").val();
		mail = $(this).children(".mail").val();
		password = $(this).children(".password").val();
		password_conf = $(this).children(".password-confirmation").val();
		action = $(this).attr('data-action');
		
		
		if($(".password-confirmation").hasClass("hidden") || password == password_conf || password_conf == "") {
			console.log("submitted");
			$.ajax({
				url: "Ajax/connect.php",
				type: "POST",
				data: {"action":action, "mail":mail, "password":password, "password_conf":password_conf},
				success: function(data) {
					console.log(data);
						if(data != "fail") {	
							window.location.reload();
						} else {
							$('.form-notif').html("Mauvais mot de passe ou identifiant");
							$('.form-notif').removeClass('hidden');
						}
					},
				error: function() {
						console.log("fail");
					}
			})
		} else {
			console.log("passwords do not match");
			$('.form-notif').html("Les mots de passe ne correspondent pas");
			$('.form-notif').removeClass('hidden');
		}
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
	$('.form-notif').addClass('hidden');
	$('#landing .signin').html('S\'inscrire');
	$('#landing .center-form .title-form').html('Se connecter');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/16b.jpg"), url("Assets/Backgrounds/small/16b.jpg")');
	$('#landing .login-form').attr('data-action','login');
	
	$('*[name="password"]').addClass("borderBottom").removeClass("borderMiddle");
	$('*[name="password-confirmation"]').addClass("hidden");
}
function switchToSignup() {
	$('.form-notif').addClass('hidden');
	$('#landing .signin').html('Se connecter');
	$('#landing .center-form .title-form').html('S\'inscrire');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/1b.jpg"), url("Assets/Backgrounds/small/1b.jpg")');
	$('#landing .login-form').attr('data-action','signup');

	$('*[name="password"]').removeClass("borderBottom").addClass("borderMiddle");
	$('*[name="password-confirmation"]').removeClass("hidden");
}
