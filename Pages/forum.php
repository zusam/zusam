<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function page_section_forum(&$u, &$forum) {

	$html = "";

	if($forum != null && $forum != "" && $forum != false) {

		$html .='<div id="container">';
		$html .= '</div>';
	}

	return $html;
}

function page_section_forum_settings(&$u, &$forum) {

	$fid = (String) $forum['_id'];

	$html = "";

	$html .= '<div class="settings-container">';

	$html .= '<div class="profile_wrapper">';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer le nom du groupe</span>';
	$html .= '<input class="textInput" name="name" type="text" placeholder="Nom du groupe">';
	$html .= '<button class="submitInput" onclick="changeforumname(\'input[name=name]\'); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Inviter quelqu\'un dans le groupe</span>';
	$html .= '<input class="textInput" name="mail" type="email" placeholder="mail de la personne à inviter">';
	$html .= '<button class="submitInput" onclick="inviteUser(\'input[name=mail]\'); return false;">';
	$html .= '<i class="icon-paper-plane"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Lien secret d\'invitation au groupe<div class="help-balise icon-help-circled"><span>Toute personne possédant ce lien pourra le rejoindre sans être invitée</span></div></span>';
	$html .= '<input class="textInput" type="text" onclick="this.setSelectionRange(0, this.value.length); return false;" value="'.$GLOBALS['__ROOT_URL__'].'?il='.$forum['link'].'" readonly="readonly">';
	$html .= '<input type="submit" onclick="changeSecretLink(); return false;" value="Réinitialiser le lien secret">';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<input type="submit" onclick="removeUserFromForum(); return false;" value="Quitter le groupe">';
	$html .= '</form>';

	$html .= '</div>';
	
	
	$html .= '<div class="users-resume">';
	$html .= '<div class="title">Utilisateurs :</div>';

	// isUser array is made to erase notifs for users already in.
	// we store email to find who is who.
	$isUser = [];

	foreach($forum['users'] as $k=>$userId) {
		$user = account_load(array('_id'=>$userId));
		if($user != false && $user != null) {
			if($user['forums'][$fid] != null) {
				$html .= '<div class="user"><div title="'.$user['mail'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
				$isUser[] = $user['mail'];
			} else {
				unset($forum['users'][$k]);	
				$forum['users'] = array_values($forum['users']);
				forum_save($forum);
			}
		}
	}
	$html .= '</div>';

	$notifications = notification_bulkLoad(array('type' => 'invitation', 'source' => mongo_id($forum['_id'])));

	$html .= '<div class="invitations-resume">';
	$html .= '<div class="title">Invitations :</div>';

	// isNotified is an array made to erase duplicates
	// we store email as an id.
	$isNotified = [];

	foreach($notifications as $n) {
		if(mongo_isId($n['target'])) {
			$user = account_load(array('_id'=> mongo_id($n['target'])));
		} else {
			$user = account_load(array('mail'=> $n['target']));
		}
		if($user == false || $user == null) {
			$user = account_getDummy(array('mail'=>$n['data']['mail'], 'name'=>preg_replace("/@.*/","",$n['data']['mail']) ) );
		}
		if(!in_array($n['data']['mail'], $isUser) && !in_array($n['data']['mail'], $isNotified)) {
			$html .= '<div class="user"><div title="'.$user['name'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
			$isNotified[] = $n['data']['mail'];
		} else {
			// erase unecessary notif
			notification_destroy($n['_id']);
		}
	}
	$html .= '</div>';

	$html .= '</div>';
	
	return $html;
}

