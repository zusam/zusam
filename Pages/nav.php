<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function page_nav(&$u, &$forum) {

	$html = "";

	$html .= '<div class="left-module-nav">';
	$html .= '<div class="my_avatar" onclick="toggleslidefromleft(\'#mainmenu\')">'.account_getAvatarHTML($u).'</div>';
	$html .= '<a href="'.$_SERVER['REQUEST_URI'].'"><img class="logo" src="Assets/logo.png"/></a>';
	$html .= '</div>';
	if($_SESSION['forum'] != "") {
		$html .= '<div class="forum-name"><span>'.$forum['name'].'<span></div>';
		$html .= '<div class="right-module-nav">';
		$html .= '<button class="action" onclick="push_shownewpost()"><i class="icon-pencil"></i></button>';
		$html .= '</div>';
	} else {
		$html .= '<div class="right-module-nav">';
		$html .= '</div>';
	}

	return $html;

}

