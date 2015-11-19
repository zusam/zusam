<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	

function page_section_home(&$u) {
	
	$html = "";

	$html .= '<div class="big-title">Vos groupes</div>';
	$html .='<div id="container">';


	$notifs = load_invitations($u);
	foreach($notifs as $n) {
		$f = forum_load(array('_id'=>$n['source']));
		if($f != false) {
			$html .= '
				<div title="'.$f['name'].'" class="material-shadow invit-mini" data-id="'.$n['_id'].'">
					'.forum_getAvatarHTML($f).'
					<div class="title">'.$n['text'].'</div>
					<div class="action-menu">
						<button class="action" onclick="addUserToForum(this)">Rejoindre le groupe</button>
						<button class="action" onclick="removeNotification(this)"><i class="fa fa-remove"></i></button>
					</div>
				</div>
			';
		}
	}


	$list = array_reverse($u['forums']);

	for($i=0;$i<count($list);$i++) {
		$f = forum_load(array('_id'=>$list[$i]));
		$html .= '
			<a title="'.$f['name'].'" class="material-shadow forum-mini" href="'.$_SERVER['PHP_SELF'].'?fid='.$f['_id'].'&page=forum" data-id="'.$f['_id'].'">
				'.forum_getAvatarHTML($f).'
			</a>
		';
	}
	$html .= '</div>';

	return $html;
}

?>
