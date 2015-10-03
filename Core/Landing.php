<?php
function landing() {
	echo('
		<body>
			<div id="landing" class="landing">
				<div class="background"></div>
			
				<div class="head">
					<div class="menu">
						<button class="signin" onclick="landing.switchForm()">Se connecter</button>
					</div>
					<div class="buffer-top"></div>
					<img class="logo2" src="Assets/zusam.png"/>
					<div class="buffer-bottom"></div>
				</div>

				<div class="center-form">
					<div class="title-form">S\'inscrire</div>
					<form class="login-form" data-action="signup">
						<input class="mail" name="mail" type="email" placeholder="adresse mail"/>
						<input class="password" name="password" type="password" placeholder="mot de passe"/>
						<button type="submit" name="submit" class="submit"><i class="fa fa-paper-plane"></i></button>
					</form>
				</div>
			</div>

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
