<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Post.php');
require_once('Core/Accounts.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Miniature.php');


function print_full_post($id, $uid, &$p) {
	
	// init the html to return
	$html_data = "";

	// get the user
	$u = account_load(array('_id' => $uid));
	if($u == null || $u == false) {
		$u = account_getDummy();
	}
	
	// load the post if not provided
	if($p == null) {
		$p = post_load(array('_id'=>$id));
	}
	if($p == null) {
		return "";
	}
	$html_data .= print_post($id, $uid, $p);
	$html_data .= '<div class="post-separator"></div>';
	foreach($p['children'] as $cid) {

		// TODO correct removing child posts in order to not do this
		// loading the child to see if he exists
		$c = post_load(array('_id'=>$cid));
		if($c == false || $c == null) {
			//deleteValue($cid, $p['children']);
			post_removeChild($p, $cid);
		} else {
			$child_html = print_post($cid, $uid);
			if($child_html != "") {
				$html_data .= $child_html;
			}
		}
		post_save($p);
	}
	return $html_data;

}

function print_post($id, $uid, &$p) {

	// init the html to return
	$html_data = "";

	// get the user
	$u = account_load(array('_id' => $uid));
	if($u == null || $u == false) {
		$u = account_getDummy();
	}
	
	// load the post if not provided
	if($p == null) {
		$p = post_load(array('_id'=>$id));
	}
	if($p == null) {
		return "";
	}

	// get the user
	$op = account_load(array('_id' => $p['uid']));

	$html_data .= ' <div data-preview="'.$p['preview'].'" class="post ';
	// parent ?
	if($p['parent'] != null || $p['parent'] != 0) {
		$html_data .= 'child-post';
	} else {
		$html_data .= 'parent-post';
	}
	$html_data .= ' " data-id="'.$id.'">';
	$html_data .= '
		<div class="post-menu">
		<div class="op" data-uid="'.$p['uid'].'">
			<div class="avatar">'.account_getAvatarHTML($op).'</div>
			<div class="post-info">
	';
	$html_data .= '<div class="first-line">';
	$html_data .= '<div class="author">'.$op['name'].'</div>';
	$html_data .= '</div>';
	$html_data .= '<div class="second-line">';
	$html_data .= '<div class="date">'.convertDate(date('Y-m-d H:i:s', $p['date']->sec)).'</div>';
	//$html_data .= '<i class="fa fa-circle circle-separator"></i><img onclick="addButterfly(this)" class="butterfly" src="Assets/pap7.svg"/>'.count($p['butterflies']);
	$html_data .= '<i class="fa fa-circle circle-separator"></i>';
	if(array_key_exists((String) $u['_id'], $p['butterflies'])) {
		$html_data .= '<div onclick="toggleButterfly(this)" class="butterfly" style="fill:red">'.file_get_contents('Assets/pap7.svg').'</div>';
	} else {
		$html_data .= '<div onclick="toggleButterfly(this)" class="butterfly">'.file_get_contents('Assets/pap7.svg').'</div>';
	}
	$html_data .= count($p['butterflies']);
	$html_data .= '</div>';
	$html_data .= '</div></div>';
	$html_data .= '<div class="right-menu">';
		if($p['uid'] == $u['_id']) {
			$html_data .= '
					<div onclick="toggleoptionsmenu(this)" class="options">
						<i class="fa fa-caret-down"></i>
						<div class="options-menu">
							<a onclick="editPost(this)">Editer</a>
							<a onclick="deletePost(this)">Supprimer</a>
						</div>
					</div>
			';
		} 
	$html_data .= '</div>';
	$html_data .= ' </div> <div class="';
	if($p['parent'] != null && $p['parent'] != 0) {
		$html_data .= 'post-com-text ';
	} else {
		$html_data .= 'post-parent-text ';
	}
	$html_data .= 'dynamicBox viewerBox" data-id="'.$id.'"><div>'.$p['text'].'</div></div>';
	$html_data .= '</div>';

	return $html_data;
}

function print_post_mini(&$p) {
	$html = "";
	if($p != false && ($p['parent'] == null || $p['parent'] == 0)) {
		if($p['preview'] == null) {
			//var_dump($p['preview']);
			$link = search_miniature($p['text']);
			if($link != "") {
				$p['preview'] = $link;
			}
			//var_dump($p['preview']);
			post_save($p);
			//echo('<br>');
		}
		if(!file_exists(get_miniature_path($p['preview']))) {
			if($p['preview'] != "") {
				$link = gen_miniature($p['preview']);
			}
			if($link != null && $link != false && $link != "") {
				$inside = '<img src="'.get_miniature($p['preview']).'?'.time().'"/>';
			} else {
				//$inside = '<img src="'.p2l(pathTo("placeholder", "assets", "jpg")).'"/>';
				$inside = '<div class="text-container">';
				$text = cutIfTooLong($p['text'], 180);
				$inside .= '<div>'.$text.'</div>';
				$inside .= '</div>';
			}
		} else {
			$inside = '<img src="'.get_miniature($p['preview']).'?'.time().'"/>';
		}
		$c = count($p['children']);
		//$b = count($p['butterflies']);
		if($c > 0) {
			$inside .= '<div class="stats">';
			//$inside .= '<div class="butterflies-indicator"><div>'.$b.' '.file_get_contents('Assets/pap7.svg').'</div></div>';
			$inside .= '<div class="comments-indicator"><div>'.$c.' <i class="fa fa-comment"></i></div></div>';
			$inside .= '</div>';
		}
		$html .= '<a class="material-shadow post-mini" href="#'.$p['_id'].'" data-id="'.$p['_id'].'">';
		$html .= '<div class="post-start">'.cutIfTooLong($p['text'],50).'</div>';
		$html .= '<div class="post-preview">'.$inside.'</div></a>';
	}
	return $html;
}


?>
