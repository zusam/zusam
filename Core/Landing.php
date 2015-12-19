<?php
function landing($warning, $redirect_url) {
	echo('
		<body id="landing">
			
			<div class="background"></div>
		
			<div class="menu">
				<a class="action" href="http://blog.zus.am">Blog</a>
				<button class="signin action" onclick="landing.switchForm()">Se connecter</button>
			</div>
			<div class="top-div">
				<img class="logo2" src="Assets/zusam.svg"/>
				<div class="baseline"><p>Un espace réellement privé pour vous et votre famille.</p></div>
			</div>
			<div class="bottom-div">
				<div class="center-form">
					<div class="title-form">S\'inscrire</div>
					<form class="login-form" data-action="signup">
						<input class="mail" name="mail" type="email" placeholder="adresse mail"/>
						<input class="password borderMiddle" name="password" type="password" placeholder="mot de passe"/>
						<input class="password-confirmation borderBottom" name="password-confirmation" type="password" placeholder="confirmez votre mot de passe"/>
						<p class="form-notif hidden">Les mots de passe ne correspondent pas</p>
						<button type="submit" name="submit" class="submit"><i class="fa fa-paper-plane"></i></button>
						<a class="action hidden" onclick="landing.switchToPasswordReset()">Mot de passe oublié ?</a>
					</form>
				</div>
	');
	if($warning != "") {
		echo('<div class="warning">');
		echo($warning);
		echo('</div>');
	}
	echo('
			</div>
	');
	echo('
		<script src="LibJS/jquery.2.1.4.min.js"></script>
		<script src="LibJS/fastclick.min.js"></script>
		<script src="zusam.min.js"></script>
		<script>
			landing.start();
		</script>
		</body>
		</html>
	');
}

?>
