<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	
require_once('Core/Miniature.php');	
require_once('Core/Print_post.php');	

function page_nav_forum(&$u, &$forum) {

	$html = "";

	$html .= '<div class="left-module-nav">';
	$html .= '<div class="my_avatar" onclick="toggleslidefromleft(\'#mainmenu\')">'.account_getAvatarHTML($u).'</div>';
	$html .= '<a href="'.$_SERVER['REQUEST_URI'].'"><img class="logo" src="Assets/logo.png"/></a>';
	$html .= '</div>';
	if($_SESSION['forum'] != "") {
		$html .= '<div class="forum-name"><span>'.$forum['name'].'<span></div>';
		$html .= '<div class="right-module-nav">';
		$html .= '<button class="action" onclick="togglenewpost()"><i class="fa fa-pencil"></i></button>';
		$html .= '</div>';
	} else {
		$html .= '<div class="right-module-nav">';
		$html .= '</div>';
	}

	return $html;

}

function page_section_forum(&$u, &$forum) {

	$html = "";

	if($forum != null && $forum != "" && $forum != false) {

		$html .='<div id="container">';

		$list = array_reverse($forum['news']);
		
		for($i=0;$i<min(30,count($list));$i++) {
			$p = post_load(array('_id'=>$list[$i]));
			if($p != null && $p != false) {
				if(in_array((String) $p['_id'], $u['unread'])) {
					$html .= print_post_mini($p, true);
				} else {
					$html .= print_post_mini($p, false);
				}
			} else {
				forum_removeFromNews($forum, $list[$i]);
			}
		}
		forum_save($forum);
		$html .= '</div>';
	}

	return $html;
}

function page_section_forum_settings(&$u, &$forum) {

	$html = "";

	//$html .= '<div class="big-title">'.$forum['name'].'</div>';
	$html .= '<div class="settings-container">';

	$html .= '<div class="profile_wrapper">';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Changer le nom du groupe:</span>';
	$html .= '<input class="textInput" name="name" type="text" placeholder="Nom du groupe">';
	$html .= '<button class="submitInput" onclick="changeforumname(\'input[name=name]\'); return false;">';
	$html .= '<i class="fa fa-send"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Inviter quelqu\'un dans le groupe:</span>';
	$html .= '<input class="textInput" name="mail" type="email" placeholder="mail de la personne à inviter">';
	$html .= '<button class="submitInput" onclick="inviteUser(\'input[name=mail]\'); return false;">';
	$html .= '<i class="fa fa-send"></i>';
	$html .= '</button>';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<span class="formTitle">Lien secret du groupe:</span>';
	$html .= '<input class="textInput" type="text" onclick="this.setSelectionRange(0, this.value.length); return false;" value="'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?il='.$forum['link'].'" readonly="readonly">';
	$html .= '<input type="submit" onclick="changeSecretLink(); return false;" value="Changer le lien secret">';
	$html .= '</form>';

	$html .= '<form class="change-profile">';
	$html .= '<input type="submit" onclick="removeUserFromForum(); return false;" value="Quitter le groupe">';
	$html .= '</form>';

	$html .= '</div>';
	
	
	$html .= '<div class="users-resume">';
	$html .= '<div class="title">Utilisateurs :</div>';
	foreach($forum['users'] as $userId) {
		$user = account_load(array('_id'=>$userId));
		if($user != false && $user != null) {
			$html .= '<div class="user"><div title="'.$user['name'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
		}
	}
	$html .= '</div>';


	$notifications = notification_bulkLoad(array('type' => 'invitation', 'source' => mongo_id($forum['_id'])));

	$html .= '<div class="invitations-resume">';
	$html .= '<div class="title">Invitations :</div>';
	foreach($notifications as $n) {
		if(mongo_isId($n['target'])) {
			$user = account_load(array('_id'=> mongo_id($n['target'])));
		} else {
			$user = account_load(array('mail'=> $n['target']));
		}
		if($user == false || $user == null) {
			$user = account_getDummy(array('mail'=>$n['data']['mail'], 'name'=>$n['data']['mail']));
		}
		$html .= '<div class="user"><div title="'.$user['name'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
	}
	$html .= '</div>';

	$html .= '</div>';
	
	return $html;
}


?>
