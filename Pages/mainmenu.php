<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function page_mainmenu(&$u, $page) {

	$html = "";
	$html .= '<div id="mainmenu" class="slide slide-menu slidefromleft">';
	$html .= '<div class="menu-profil">';
	$html .= '<a class="profil ';
	if($page == "profile") {
		$html .= 'selected';
	}
	$html .= '" href="'.$_SERVER['PHP_SELF'].'?page=profile">'.account_getAvatarHTML($u).$u['name'].'</a>';
	$html .= '<div class="disconnect">';
	$html .= '<a class="action menu-highlight forum-link" onclick="disconnect(); return false;"><i class="icon-logout"></i></a>';
	$html .= '</div>';
	$html .= '</div>';

	$html .= '<div class="separator"></div>';
	$html .= '<div class="list-section">';
	$html .= '<div class="section-title">Groupes';
	$html .= '</div>';
	foreach($u['forums'] as $fid=>$v) {
		if($fid != "") {
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false) {
				$html .= '<div class="section-entry ';
				if($_SESSION['forum'] == $fid && $page != "profile") {
					$html .= 'selected';
				}
				$html .= '">';
				$html .= ' <a class="menu-highlight forum-link ';
				$html .= '" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'">'.$f['name'];
				if($f['timestamp'] != null && $v['timestamp'] < $f['timestamp']) {
					$html .= ' <i class="icon-circle notif"></i>';
				}
				$html .= '</a>';
				$html .= '
					<a class="forum-settings spin-hover" href="'.$GLOBALS['__ROOT_URL__'].'?fid='.$f['_id'].'&page=forum_settings">
						<i class="icon-cog">
						</i>
					</a>
				';
				$html .= '</div>';
			}
		}
	}
	$notifications = array_reverse(load_notifications($u));
	if(count($notifications) > 0) {
		foreach($notifications as $n) {
			if($n['type'] == "invitation") {
				$html .= notification_print($n);
			}
		}
	}
	$html .= '<div class="section-entry" onclick="ask(\'Nom du forum :\',25,addForum)"><span class="fontgrey menu-highlight forum-link">+ Nouveau groupe</span></div>';
	$html .= '</div>';
	$html .= '<div class="separator"></div>';
	$html .= '</div>';

	return $html;
}

// load invitations
function load_notifications(&$u) {
	
	$notifications = [];
	// search by id
	$n1 =  notification_bulkLoad(array('target' => mongo_id($u['_id'])));
	foreach($n1 as $n) {
		array_push($notifications, $n);
	}
	// search by mail
	$n2 = notification_bulkLoad(array('target' => $u['mail']));
	foreach($n2 as $n) {
		// correct target to be an id
		$n['target'] = mongo_id($u['_id']);
		notification_save($n);
		array_push($notifications, $n);
	}
	// search by string id
	$n3 =  notification_bulkLoad(array('target' => (String) $u['_id']));
	foreach($n3 as $n) {
		array_push($notifications, $n);
	}
	return $notifications;
}
?>
