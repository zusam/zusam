<?php

function landing($warning, $redirect_url) {
	$head = html_head($GLOBALS['__ROOT_URL__']);
	echo($head);
	echo('
		<body id="landing">
			
			<div class="background"></div>
		
			<div class="menu">
				<a class="action" href="http://facebook.com/zusam">Facebook</a>
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
						<button type="submit" name="submit" class="submit"><i class="icon-paper-plane"></i></button>
						<a class="action hidden" onclick="landing.switchToPasswordReset()">Mot de passe oublié ?</a>
					</form>
				</div>
	');
	if(isset($warning) && $warning != "") {
		echo('<div class="warning">');
		echo($warning);
		echo('</div>');
	}
	echo('</div>');
	// passing global variables to javascript
	echo('
		<script>
			origin_url = "'.$GLOBALS['__ROOT_URL__'].'";
		</script>
	');
	echo('<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>');
	echo('<script src="JS/landing.min.js"></script>');
	echo('
		<script>landing.start();</script>
		</body>
		</html>
	');
}

?>
