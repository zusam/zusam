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
	$html .= '<span class="formTitle">Changer de nom<div class="help-balise icon-help-circled"><span>Il s\'agit du nom visible par les autres utilisateurs sur tous vos forums</span></div></span>';
	$html .= '<input class="textInput" name="name" type="text" placeholder="Nouveau nom">';
	$html .= '<button class="submitInput" onclick="changeProfile(this); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer de mot de passe</span>';
	$html .= '<input class="textInput" name="old_password" type="password" placeholder="Mot de passe actuel"><br>';
	$html .= '<input class="textInput" name="new_password" type="password" placeholder="Nouveau mot de passe">';
	$html .= '<button class="submitInput" onclick="changeProfile(this); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer d\'adresse mail</span>';
	$html .= '<input class="textInput" name="password" type="password" placeholder="Mot de passe actuel">';
	$html .= '<input class="textInput" name="new_mail" type="mail" placeholder="Nouvelle adresse mail">';
	$html .= '<button class="submitInput" onclick="changeProfile(this); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Supprimer ce compte <div class="help-balise icon-help-circled"><span>Cette opération est irréversible et supprimera tous les fichiers et messages envoyés depuis ce compte.</span></div></span>';
	$html .= '<input class="textInput" name="password" type="password" placeholder="Mot de passe actuel">';
	$html .= '<button class="submitInput" onclick="destroyAccount(this); return false;">';
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
