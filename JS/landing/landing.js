function start(redirect_url) {
	$("#landing .login-form").on("submit", function(e) {
		e.preventDefault();	
		$('.form-notif').addClass('hidden');
		action = $(this).children(".action").val();
		mail = $(this).children(".mail").val();
		password = $(this).children(".password").val();
		password_conf = $(this).children(".password-confirmation").val();
		action = $(this).attr('data-action');
		
		if($(this).attr('data-action') != "passwordReset") {	
			console.log(mail.match(/[\.\-\w]+\@[\.\-\w]+\.[\.\-\w]+/));
			if(mail.match(/[\.\-\w]+\@[\.\-\w]+\.[\.\-\w]+/)) {
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
			} else {
					console.log("bad mail");
					$('.form-notif').html("Votre mail semble être incorrect");
					$('.form-notif').removeClass('hidden');
			}
		} else {
			console.log(action, mail);
			$.ajax({
				url: "Ajax/post.php",
				type: "POST",
				data: {"action":action, "mail":mail},
				success: function(data) {
						console.log(data);
						window.location.reload();
					},
				error: function() {
						console.log("fail");
					}
			})
			
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
	$('#landing .login-form').attr('data-action','login');

	$('*[name="password"]').addClass("borderBottom").removeClass("borderMiddle").removeClass('hidden');
	$('*[name="password-confirmation"]').addClass("hidden");
	$('#landing .center-form .action').removeClass('hidden');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/16b.jpg"), url("Assets/Backgrounds/small/16b.jpg")');
}

function switchToSignup() {
	$('.form-notif').addClass('hidden');
	$('#landing .signin').html('Se connecter');
	$('#landing .center-form .title-form').html('S\'inscrire');
	$('#landing .login-form').attr('data-action','signup');

	$('*[name="password"]').removeClass("borderBottom").addClass("borderMiddle").removeClass('hidden');
	$('*[name="password-confirmation"]').removeClass("hidden");
	$('#landing .center-form .action').addClass('hidden');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/1b.jpg"), url("Assets/Backgrounds/small/1b.jpg")');
}

function switchToPasswordReset() {
	$('.form-notif').addClass('hidden');
	$('#landing .signin').html('Se connecter');
	$('#landing .center-form .title-form').html('Réinitialiser votre mot de passe');
	$('#landing .login-form').attr('data-action','passwordReset');

	$('*[name="password"]').addClass("hidden");
	$('*[name="password-confirmation"]').addClass("hidden");
	$('#landing .center-form .action').addClass('hidden');
	$('#landing .background').css('background-image','url("Assets/Backgrounds/1.jpg"), url("Assets/Backgrounds/small/1.jpg")');
}
