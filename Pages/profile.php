<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_section_profile(&$u) {

	$html = "";

	$html .= '<div class="profile_wrapper">';
	$html .= '
		<div class="change-avatar" onclick="loadRetoucheBox(128,128,\'changeAvatar\')">
			'.account_getAvatarHTML($u).'
		</div>
	';
	$html .= '
			<form class="change-profile">
				<label for="name">Nom:</label><br>
				<input name="name" type="text" placeholder="'.$u['name'].'"><br>
				<input type="submit" onclick="changename(\'input[name=name]\'); return false;" value="Enregistrer">
			</form>
			<form class="change-profile">
				<label for="old_password">Mot de passe actuel:</label><br>
				<input name="old_password" type="password"><br>
				<label for="new_password">Nouveau mot de passe:</label><br>
				<input name="new_password" type="password"><br>
				<input type="submit" onclick="changepassword(\'input[name=old_password]\',\'input[name=new_password]\'); return false;" value="Enregistrer">
			</form>
			<form class="change-profile">
				<label for="password">Mot de passe :</label><br>
				<input name="password" type="password"><br>
				<input type="submit" onclick="destroyAccount(\'input[name=password]\'); return false;" value="Supprimer ce compte">
			</form>
		</div>
	';

	return $html;
	echo($html);
}
?>
