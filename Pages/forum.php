<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Miniature.php');	

function page_nav_forum(&$u, &$forum) {

	$html = "";

	$html .= '<div class="left-module-nav">';
	$html .= '<div class="my_avatar" onclick="toggleslidefromleft(\'#mainmenu\')">'.account_getAvatarHTML($u).'</div>';
	//$html .= '<div class="my_name">'.$u['name'].'</div>';
	$html .= '</div>';
	if($forum != null && $forum != "" && $forum != false) {
		$html .= '<div class="forum-name">'.$forum['name'].'</div>';
		$html .= '<button class="button-newpost" onclick="togglenewpost()"><i class="fa fa-pencil"></i></button>';
	} else {
		$html .= '<div class="placeholder-div"></div>';
	}

	return $html;

}

function page_section_forum(&$u, &$forum) {

	$html = "";

	if($forum != null && $forum != "" && $forum != false) {

		$html .='<div id="container">';

		$list = array_reverse($forum['news']);

		//TODO (300) -> infinite scrolling
		for($i=0;$i<min(3000,count($list));$i++) {
			$p = post_load($list[$i]);
			if($p != false && ($p['parent'] == null || $p['parent'] == 0)) {
				if(!file_exists(get_miniature_path($p['preview']))) {
					$link = "";
					if($link != false && $link != "") {
						$inside = '<img src="'.$link.'"/>';
					} else {
						$inside = '<img src="'.p2l(pathTo("placeholder", "assets", "jpg")).'"/>';
					}
				} else {
					$inside = '<img src="'.get_miniature($p['preview']).'?'.time().'"/>';
				}
				$html .= '<div class="post-mini" data-id="'.$p['_id'].'">'.$inside.'</div>';
			}
		}
		$html .= '</div>';
	}

	return $html;
}

function page_section_forum_settings(&$u, &$forum) {

	$html = "";

	$html .= '<div class="settings-container">';

	$html .= '
		<div class="profile_wrapper">
			<div class="change-avatar" onclick="loadRetoucheBox(256,256,\'changeForum\')">'.forum_getAvatarHTML($forum).'</div>
			<form class="change-profile">
				<label for="name">Nom du forum:</label><br>
				<input name="name" type="text" placeholder="'.$forum['name'].'"><br>
				<input type="submit" value="Enregistrer" onclick="changeforumname(\'input[name=name]\'); return false;">
			</form>
			<form class="change-profile">
				<label for="mail">Mail de la personne à inviter:</label><br>
				<input name="mail" type="email"><br>
				<input type="submit" onclick="inviteUser(\'input[name=mail]\'); return false;" value="Envoyer">
			</form>
		</div>
	';
	$html .= '<div class="users-resume">';
	foreach($forum['users'] as $userId) {
		$user = account_load(array('_id'=>$userId));
		$html .= '<div><div title="'.$user['name'].'">'.account_getAvatarHTML($user).'</div><span>'.$user['name'].'</span></div>';
	}
	$html .= '</div>';

	$html .= '</div>';
	
	return $html;
}


?>
