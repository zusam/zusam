<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function page_section_profile(&$u) {

	$html = "";

	$html .= '<div class="profile_wrapper">';
	$html .= '
		<div class="change-avatar" onclick="loadRetoucheBox(128,128,\'changeAvatar\')">
			'.account_getAvatarHTML($u).'
		</div>
	';
	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer de nom :</span>';
	$html .= '<input class="textInput" name="name" type="text" placeholder="Nouveau nom">';
	$html .= '<button class="submitInput" onclick="changename(\'input[name=name]\'); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer de mot de passe :</span>';
	$html .= '<input class="textInput" name="old_password" type="password" placeholder="Mot de passe actuel"><br>';
	$html .= '<input class="textInput" name="new_password" type="password" placeholder="Nouveau mot de passe">';
	$html .= '<button class="submitInput" onclick="changepassword(\'input[name=old_password]\',\'input[name=new_password]\'); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Supprimer ce compte :</span>';
	$html .= '<input class="textInput" name="password" type="password" placeholder="Mot de passe actuel">';
	$html .= '<button class="submitInput" onclick="destroyAccount(\'input[name=password]\'); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<input class="submitInputAlone" type="submit" onclick="disconnect(); return false;" value="Se déconnecter">';
	$html .= '</form>';
	$html .= '</div>';

	return $html;
	echo($html);
}
?>
