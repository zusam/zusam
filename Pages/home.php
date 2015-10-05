<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	

function page_section_home(&$u) {
	
	$html = "";

	$html .='<div id="container">';

	$list = array_reverse($u['forums']);

	for($i=0;$i<count($list);$i++) {
		$f = forum_load($list[$i]);
		$html .= '
			<a title="'.$f['name'].'" class="forum-mini" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum" data-id="'.$f['_id'].'">
				'.forum_getAvatarHTML($f).'
				<!--<img title="'.$f['name'].'" src="'.forum_getAvatar($f).'"/>-->
				<span>'.$f['name'].'</span>
			</a>
		';
	}
	$html .= '</div>';

	return $html;
}

?>
