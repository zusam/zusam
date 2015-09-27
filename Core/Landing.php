<?php
function landing() {
	echo('
		<html>
		<head>
			<title>Zusam</title>
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
			<meta charset="utf-8"/>
		<style>
			#login-form {
				text-align: center;
				width: 100%;
				max-width: 425px;
				position: absolute;
				top: 45%;
				left: 50%;
				transform: translate(-50%, -50%);
				-webkit-transform: translate(-50%, -50%);
			}
			#login-form .title {
				color: white;
				font-size: 40px;
				font-weight: 800;
				padding: 10px;
			}
			#login-form .mail {
				width: 80%;
				padding: 10px;
				font-size: 20px;
				border: none;
				margin: 0;
				border-bottom: lightgrey solid 1px;
				border-top-left-radius: 2px;
				border-top-right-radius: 2px;
				border-bottom-left-radius: 0px;
				border-bottom-right-radius: 0px;
			}
			#login-form .password {
				width: 80%;
				padding: 10px;
				margin: 0;
				font-size: 20px;
				border: none;
				border-bottom-left-radius: 2px;
				border-bottom-right-radius: 2px;
				border-top-left-radius: 0px;
				border-top-right-radius: 0px;
			}
			#login-form .submit {
				width: 80%;
				padding: 6px;
				font-size: 20px;
				border: none;
				margin-top: 10px;
				background-color: lightgrey;
			}
		</style>
		</head>

		<body style="background:darkslategrey;">

				<form id="login-form" class="signin-card">
				<div class="title">Zusam</div>
				<input class="mail" id="mail" type="email" placeholder="adresse mail" tabindex="1"/>
				<input class="password" id="password" type="password" placeholder="mot de passe" tabindex="2"/>
				<button type="submit" class="submit" name="submit" tabindex="3">
				Se connecter / S\'inscrire
				</button>
				</form>
				</div>
		<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>-->
		<script src="JS/jquery.2.1.4.min.js"></script>
		<script>
			$("#login-form").on("submit", function(e) {
				e.preventDefault();	
				mail = $("#mail").val();
				password = $("#password").val();
				$.ajax({
					url: "Ajax/connect.php",
					type: "POST",
					data: {"mail":mail, "password":password},
					success: function(data) {
							console.log(data);
							window.location.reload(true); 
						},
					error: function() {
							console.log("fail");
						}
				})
			});
		</script>
		</body>
		</html>
	');
}
?>
