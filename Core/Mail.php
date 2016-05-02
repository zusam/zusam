<?php

chdir(realpath(dirname(__FILE__).'/../'));
require_once('Include.php');

function mail_general($to, $subject, $content) {

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
	$mail->setFrom("noreply@zus.am", "Zusam");

	//To address and name
	$mail->addAddress($to); //Recipient name is optional

	//Send HTML or Plain Text email
	$mail->isHTML(true);

	$mail->Subject = (String) $subject;
	
	if($name == "") {
		$name = preg_replace("/(.*)@.*/","$1",$to);
	}

	$body = (String) $content;

	$mail->MsgHTML($body);
	$mail->AltBody = strip_tags($body);

	$mail->Timeout = 15;

	if(!$mail->send()) {
		return "Mailer Error: " . $mail->ErrorInfo;
	} else {
		return "Message has been sent successfully";
	}
}

function mail_invitation($to, $link, $name) {

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
	$mail->setFrom("support@zus.am", "Zusam");

	//To address and name
	$mail->addAddress($to); //Recipient name is optional

	//Send HTML or Plain Text email
	$mail->isHTML(true);

	$mail->Subject = "Invitation à un groupe Zusam";
	
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
				Bonjour,<br><br><br>
				Vous avez été invité à rejoindre un groupe privé sur Zusam.<br>
				L\'invitation émane de '.$name.'<br>
				Voici le lien d\'invitation au groupe : '.$link.'<br>
				Cordialement,<br>
				L\'équipe de support de Zusam
			</p>
		</body>
	</html>
	';

	$mail->MsgHTML($body);
	$mail->AltBody = strip_tags($body);
	$mail->Timeout = 15;

	if(!$mail->send()) {
		return "Mailer Error: " . $mail->ErrorInfo;
	} else {
		return "Message has been sent successfully";
	}
}

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
	$mail->setFrom("support@zus.am", "Zusam");

	//To address and name
	$mail->addAddress($to); //Recipient name is optional

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
	$mail->Timeout = 15;

	if(!$mail->send()) {
		return "Mailer Error: " . $mail->ErrorInfo;
	} else {
		return "Message has been sent successfully";
	}
}

?>
