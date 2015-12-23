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
	//$html .= '<div class="my_name">'.$u['name'].'</div>';
	$html .= '</div>';
	$html .= '<a href="'.$_SERVER['REQUEST_URI'].'"><img class="logo" src="Assets/logo.png"/></a>';
	if($_SESSION['forum'] != "" && $forum != null && $forum != "" && $forum != false) {
		$html .= '<div class="right-module-nav">';
		//$html .= '<button class="action" onclick="ask(\'Mail de la personne à inviter :\',55,inviteUser)"><i class="fa fa-user-plus"></i></button>';
		$html .= '<button class="action" onclick="togglenewpost()"><i class="fa fa-pencil"></i></button>';
		$html .= '</div>';
	} else {
		$html .= '<div class="right-module-nav">';
		//$html .= '<button class="action" onclick="ask(\'Nom du forum :\',25,addForum)"><i class="fa fa-plus"></i></button>';
		$html .= '</div>';
	}

	return $html;

}

function page_section_forum(&$u, &$forum) {

	$html = "";

	if($forum != null && $forum != "" && $forum != false) {

		$html .= '<div class="big-title">'.$forum['name'].'</div>';
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

	$html .= '<div class="big-title">'.$forum['name'].'</div>';
	$html .= '<div class="settings-container">';

	$html .= '
		<div class="profile_wrapper">
			<!--<div class="change-avatar" onclick="loadRetoucheBox(256,256,\'changeForum\')">'.forum_getAvatarHTML($forum).'</div>-->
			<form class="change-profile">
				<label for="name">Nom du groupe:</label><br>
				<input name="name" type="text" placeholder="'.$forum['name'].'"><br>
				<input type="submit" value="Enregistrer" onclick="changeforumname(\'input[name=name]\'); return false;">
			</form>
			<form class="change-profile">
				<label for="mail">Inviter quelqu\'un dans le groupe :</label><br>
				<input name="mail" type="email" placeholder="mail de la personne à inviter"><br>
				<input type="submit" onclick="inviteUser(\'input[name=mail]\'); return false;" value="Envoyer">
			</form>
			<form class="change-profile">
				<input type="text" onclick="this.setSelectionRange(0, this.value.length); return false;" value="'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].'?il='.$forum['link'].'" readonly="readonly">
				<input type="submit" onclick="changeSecretLink(); return false;" value="Changer le lien secret">
			</form>
			<form class="change-profile">
				<input type="submit" onclick="removeUserFromForum(); return false;" value="Quitter le groupe">
			</form>
		</div>
	';
	
	
	$html .= '<div class="users-resume">';
	$html .= '<div class="title">Utilisateurs :</div>';
	foreach($forum['users'] as $userId) {
		$user = account_load(array('_id'=>$userId));
		if($user != false && $user != null) {
			$html .= '<div class="user"><div title="'.$user['name'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
		}
	}
	$html .= '</div>';


	$notifications = notification_bulkLoad(array('type' => 'invitation', 'source' => new MongoId($forum['_id'])));

	$html .= '<div class="invitations-resume">';
	$html .= '<div class="title">Invitations :</div>';
	foreach($notifications as $n) {
		if(MongoId::isValid($n['target'])) {
			$user = account_load(array('_id'=> new MongoId($n['target'])));
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
