<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_mainmenu(&$u, $page) {

	$html = "";
	$html .= '
		<div id="mainmenu" class="slide slide-menu slidefromleft">
		<a class="menu-action ';
	if($page == "profile") {
		$html .= 'selected';
	}
	$html .= '" href="'.$_SERVER['PHP_SELF'].'?page=profile">Profil</a>
		<div class="separator"></div>
	';
	foreach($u['forums'] as $fid=>$v) {
		$f = forum_load(array('_id'=>$fid));
		$html .= '<div class="forum-menu ';
		if($_SESSION['forum'] == $fid) {
			$html .= 'selected';
		}
		$html .= '">';
		$html .= ' <a class="menu-highlight forum-link ';
		//if($f['timestamp'] != null && $v['timestamp'] < $f['timestamp']) {
	//		$html .= 'news-highlight';
	//	}
		$html .= '" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum">'.$f['name'];
		if($f['timestamp'] != null && $v['timestamp'] < $f['timestamp']) {
			$html .= ' <i class="fa fa-circle notif"></i>';
		}
		$html .= '</a>';
		$html .= '
			<a class="forum-settings" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum_settings">
				<i class="fa fa-gear fa-spin-hover">
				</i>
			</a>
		';
		$html .= '</div>';
	}
	$html .= '
		<div class="separator"></div>
		<a class="menu-action" onclick="ask(\'Nom du forum :\',25,addForum)">Nouveau groupe</a>
		<a class="menu-action" onclick="disconnect()">Se déconnecter</a>
	';
	$html .= '<div class="separator"></div>';
	$notifications = load_invitations($u);
	foreach($notifications as $n) {
		$html .= '	
			<div class="menu-highlight invitation" data-id="'.$n['_id'].'">
				<div class="title">'.$n['text'].'</div>
				<div class="action-menu">
					<button class="action" onclick="addUserToForum(this)" >Rejoindre le forum</button>
					<button class="action" onclick="removeNotification(this)"><i class="fa fa-remove"></i></button>
				</div>
			</div>
		';
	}
	$html .= '</div>';

	return $html;
}
?>
