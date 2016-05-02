<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function page_section_profile(&$u) {

	$html = "";

	$html .= '<div class="profile_wrapper">';
	$html .= '<div class="change-avatar" onclick="retouche.changeAvatar()">';
	$html .= account_getAvatarHTML($u);
	$html .= '</div>';
	
	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer de nom<div class="help-balise icon-help-circled"><span>Il s\'agit du nom visible par les autres utilisateurs sur tous vos groupes</span></div></span>';
	$html .= '<input class="textInput" name="name" type="text" placeholder="'.$u['name'].'">';

	$html .= '<br><br>';
	$html .= '<span class="formTitle">Changer d\'adresse mail';
	$html .= '<div class="help-balise icon-help-circled"><span>Votre adresse mail est utile si vous oubliez votre mot de passe ou pour d\'autres opération administratives.</span></div>';
	$html .= '</span>';
	$html .= '<input class="textInput" name="new_mail" type="mail" placeholder="'.$u['mail'].'">';
	
	$html .= '<br><br>';
	$html .= '<span class="formTitle">Changer de mot de passe</span>';
	$html .= '<input class="textInput" name="old_password" type="password" placeholder="Mot de passe actuel"><br>';
	$html .= '<input class="textInput" name="new_password" type="password" placeholder="Nouveau mot de passe">';

	$html .= '<br><br>';
	if(!isset($u['absenceMail']) || $u['absenceMail'] == "yes") {
		$html .= '<input type="checkbox" name="absenceMail" value="yes" checked></input> ';
	} else {
		$html .= '<input type="checkbox" name="absenceMail" value="no"></input> ';
	}
	
	$html .= '<span class="formTitle">Recevoir des mails d\'absence';
	$html .= '<div class="help-balise icon-help-circled"><span>Les mails d\'absence vous résument les messages de vos groupes si vous avez été absent plus d\'une semaine.</span></div>';
	$html .= '</span>';
	
	$html .= '<br><br>';
	$html .= '<button class="submitInput" onclick="changeProfile(this); return false;">';
	$html .= 'Sauvegarder les changements';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Supprimer ce compte <div class="help-balise icon-help-circled"><span>Cette opération est irréversible et supprimera tous les fichiers et messages envoyés depuis ce compte.</span></div></span>';
	$html .= '<input class="textInput" name="password" type="password" placeholder="Mot de passe actuel">';
	$html .= '<button class="submitInput danger" onclick="destroyAccount(this); return false;">';
	$html .= 'Supprimer le compte';
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
