<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_mainmenu(&$u) {

	$html = "";

		//<a class="menu-highlight" onclick="loadPage(\'profile\')">'.$u['name'].'</a>
	$html .= '
		<div id="mainmenu" class="slide slide-menu slidefromleft">
		<a class="menu-highlight" href="'.$_SERVER['PHP_SELF'].'">Accueil</a>
		<a class="menu-highlight" href="'.$_SERVER['PHP_SELF'].'?page=profile">Profil</a>
		<!--<a class="myname menu-highlight" onclick="ask(\'Votre nom :\',25,changename)" title="changer de nom">'.$u['name'].'</a>-->
		<!--<a class="menu-highlight" onclick="togglenewavatar()">Changer de photo</a>-->
		<div class="separator"></div>
	';
	foreach($u['forums'] as $fid) {
		$f = forum_load($fid);
		$html .= '<div class="forum-menu">';
		$html .= '
			<a class="forum-link" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum">'.$f['name'].'</a>
		';
		/*
		$html .= '
			<div class="forum-link" onclick="loadPage(\'forum\', \''.$f['_id'].'\')">'.$f['name'].'</div>
		';
		*/
		/*
		$html .= '
			<form class="forum-link" method="post" action="'.$_SERVER['PHP_SELF'].'">
				<input class="hidden" type="text" name="fid" value="'.$f['_id'].'">
				<input type="submit" value="'.$f['name'].'">
			</form>		
		';
		*/
		if($f['admin'] == $u['_id']) {
			$html .= '
				<a class="forum-settings" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum_settings">
					<i class="fa fa-gear fa-spin-hover">
					</i>
				</a>
			';
			/*
			$html .= '
				<div class="forum-settings" onclick="loadPage(\'forum_settings\',\''.$f['_id'].'\')">
					<i class="fa fa-gear fa-spin-hover">
					</i>
				</div>
			';
			*/
			/*
			$html .= '
				<div class="forum-settings" onclick="ask(\'Adresse mail :\',150,inviteUser,\''.$f['_id'].'\')">
					<i class="fa fa-user-plus">
					</i>
				</div>
			';
			*/
		}
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
