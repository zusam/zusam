<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_mainmenu(&$u) {

	$html = "";

	$html .= '
		<div id="mainmenu" class="slide slide-menu slidefromleft">
		<a class="menu-highlight" href="'.$_SERVER['PHP_SELF'].'">Accueil</a>
		<a class="menu-highlight" href="'.$_SERVER['PHP_SELF'].'?page=profile">Profil</a>
		<div class="separator"></div>
	';
	foreach($u['forums'] as $fid) {
		$f = forum_load($fid);
		$html .= '<div class="forum-menu">';
		$html .= '
			<a class="forum-link" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum">'.$f['name'].'</a>
		';
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
		<a class="menu-highlight" onclick="ask(\'Nom du forum :\',25,addForum)">Nouveau forum</a>
		<a class="menu-highlight" onclick="disconnect()">Se déconnecter</a>
	';
	$html .= '
		<div class="separator"></div>
		<div class="separator"></div>
		<div class="separator"></div>
		<div class="separator"></div>
	';
	$html .= notification_print_full($u);
	$html .= '</div>';

	return $html;
}
?>
