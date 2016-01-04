<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_mainmenu(&$u, $page) {

	$html = "";
	$html .= '
		<div id="mainmenu" class="slide slide-menu slidefromleft">
		<a class="menu-profil menu-action ';
	if($page == "profile") {
		$html .= 'selected';
	}
	$html .= '" href="'.$_SERVER['PHP_SELF'].'?page=profile">'.account_getAvatarHTML($u).$u['name'].'</a>';
	$html .= '<div class="separator"></div>';
	$html .= '<div class="section-title">Groupes';
	$html .= '</div>';
	foreach($u['forums'] as $fid=>$v) {
		if($fid != "") {
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false) {
				$html .= '<div class="forum-menu ';
				if($_SESSION['forum'] == $fid) {
					$html .= 'selected';
				}
				$html .= '">';
				$html .= ' <a class="menu-highlight forum-link ';
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
		}
	}
	$html .= '<div class="forum-menu" onclick="ask(\'Nom du forum :\',25,addForum)"><span class="fontgrey menu-highlight forum-link">+ Nouveau groupe</span></div>';
	$html .= '<div class="separator"></div>';
	$notifications = array_reverse(load_notifications($u));
	if(count($notifications) > 0) {
		$html .= '<div class="section-title">Notifications</div>';
		foreach($notifications as $n) {
			$html .= notification_print($n);
		}
	}
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
