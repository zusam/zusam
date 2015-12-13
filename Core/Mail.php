<?php

chdir(realpath(dirname(__FILE__).'/../'));
require_once('LibPHP/PHPMailer-5.2.14/PHPMailerAutoload.php');

function mail_resetPassword($to, $link, $name) {

	//PHPMailer Object
	$mail = new PHPMailer();

	$mail->IsSMTP();
	$mail->SMTPAuth = true;
	$mail->Host = "smtp.postmarkapp.com";
	$mail->Port = 25;
	$mail->Username = "717653f9-41a0-4cfb-8d1f-adb32bc397b3";
	$mail->Password = "717653f9-41a0-4cfb-8d1f-adb32bc397b3";
	$mail->CharSet = 'utf-8';

	//From email address and name
	$mail->setFrom("support@zus.am", "Zusam Support");

	//To address and name
	$mail->addAddress($to); //Recipient name is optional

	//Address to which recipient will reply
	//$mail->addReplyTo("support@zus.am", "Zusam Support");

	//CC and BCC
	//$mail->addCC("cc@example.com");
	//$mail->addBCC("bcc@example.com");

	//Send HTML or Plain Text email
	$mail->isHTML(true);

	$mail->Subject = "Réinitialisation du mot de passe";
	
	if($name == "") {
		$name = preg_replace("/(.*)@.*/","$1",$to);
	}

	$body = '
	<html>
		<head>
			<meta charset="UTF-8">
		</head>
		<body>
			<p>
				Bonjour '.$name.',<br><br><br>
				Vous avez demandé de réinitialiser le mot de passe de votre compte Zusam.<br>
				Si ce n\'est pas le cas, vous pouvez ignorer ce mail en toute sécurité.<br>
				Voici le lien de réinitialisation : '.$link.'<br>
				Ce lien sera valable 24h.<br><br><br>
				Cordialement,<br>
				L\'équipe de sécurité de Zusam
			</p>
		</body>
	</html>
	';

	$mail->MsgHTML($body);
	$mail->AltBody = strip_tags($body);

	if(!$mail->send()) {
		echo "Mailer Error: " . $mail->ErrorInfo;
	} else {
		echo "Message has been sent successfully";
	}
}
?>
