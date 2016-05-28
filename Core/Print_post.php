<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function getRawText($id) {
	
	$p = post_load(array('_id'=>$id));
	if($p == null) {
		return "";
	}
	return $p['text'];
}

function print_full_post($id, $uid) {
	
	// init the html to return
	$html_data = "";

	// get the user
	$u = account_load(array('_id' => $uid));
	if($u == null || $u == false) {
		$u = account_getDummy();
	}
	
	$p = post_load(array('_id'=>$id));
	if($p == null) {
		return "";
	}
	$html_data .= print_post($id, $uid, $p);

	$nb_hidden = max(count($p['children']) - 5, 0);

	if($nb_hidden > 0) {
		if($nb_hidden > 1) {
			$s = "s";
		} else {
			$s = "";
		}
		$html_data .= '<div class="more_comments" onclick="getMoreComments(\''.$id.'\')">Afficher '.$nb_hidden.' autre'.$s.' commentaire'.$s.'</div>';
	}

	$count_hidden = 0;
	$count_shown = 0;
	foreach($p['children'] as $cid) {

		// TODO correct removing child posts in order to not do this
		// loading the child to see if he exists
		$c = post_load(array('_id'=>$cid));
		if($c == false || $c == null) {
			post_removeChild($p, $cid);
		} else {
			if($count_hidden < $nb_hidden) {
				$count_hidden++;
			} else {
				$child_html = print_post($cid, $uid);
				if($child_html != "") {
					//if($count_shown == 0 && $count_hidden == 0) {
					//	$html_data .= '<div class="post-separator"></div>';
					//}
					$html_data .= $child_html;
					$count_shown++;
				}
			}
		}
		post_save($p);
	}
	return $html_data;
}

function print_more_comments($id, $uid) {
	
	// init the html to return
	$html_data = "";

	// get the user
	$u = account_load(array('_id' => $uid));
	if($u == null || $u == false) {
		$u = account_getDummy();
	}
	
	$p = post_load(array('_id'=>$id));
	if($p == null) {
		return "";
	}

	$nb_hidden = max(count($p['children']) - 5, 0);

	$count_hidden = 0;
	foreach($p['children'] as $cid) {

		// TODO correct removing child posts in order to not do this
		// loading the child to see if he exists
		$c = post_load(array('_id'=>$cid));
		if($c == false || $c == null) {
			post_removeChild($p, $cid);
		} else {
			if($count_hidden < $nb_hidden) {
				$count_hidden++;
				$child_html = print_post($cid, $uid, $viewer);
				if($child_html != "") {
					$html_data .= $child_html;
				}
			}
		}
		post_save($p);
	}
	return $html_data;
}

function print_post($id, $uid) {

	// init the html to return
	$html_data = "";

	// get the user
	$u = account_load(array('_id' => $uid));
	if($u == null || $u == false) {
		$u = account_getDummy();
	}
	
	$p = post_load(array('_id'=>$id));
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
	$html_data .= '<div class="date" title="'.date('Y-m-d H:i:s', $p['date']->toDateTime()->getTimestamp()).'">'.convertDate(date('Y-m-d H:i:s', $p['date']->toDateTime()->getTimestamp())).'</div>';
	$html_data .= '</div>';
	$html_data .= '</div></div>';
	$html_data .= '<div class="right-menu">';
		if($p['uid'] == $u['_id']) {
			$html_data .= '
					<div onclick="showoptionsmenu(this)" class="options">
						<i class="icon-down-dir"></i>
						<div class="options-menu">
							<a onclick="editPost(this)">Editer</a>
							<a onclick="deletePost(this)">Supprimer</a>
						</div>
					</div>
			';
		} 
	$html_data .= '</div>';
	$html_data .= '</div>';
	$html_data .= '<div class="';
	if($p['parent'] != null) {
		$html_data .= 'post-com-text ';
	} else {
		$html_data .= 'post-parent-text ';
	}
	$html_data .= 'post-text">';
	$html_data .= '<div class="dynamicBox viewerBox" data-id="'.$p['_id'].'">'.compileText(trim($p['text']), false).'</div>';
	$html_data .= '</div>';
	$html_data .= '</div>';

	return $html_data;
}

function print_post_mini(&$p, $unread) {
	$html = "";
	$inside = "";
	if($p != null && $p != false && ($p['parent'] == null || $p['parent'] == 0)) {

		$inside .= '<div class="post-preview">';
		
		if(empty($p['preview']) || preg_match("/\.jpg/",$p['preview']) == 0) {
			$link = search_miniature($p['text']);
			if($link != "") {
				$p['preview'] = $link;
			}
			post_save($p);
		}
		if(preg_match("/\.jpg$/",$p['preview'])==1) {
			$inside .= '<div class="post-preview-image"><img onload="this.style.opacity=1" class="miniature" src="'.p2l($p['preview']).'"/></div>';
		} else {
			$text = $p['text'];
			$str = strip_tags($text);
			$str = trim($str);
			$str = preg_replace("/\n/","<br>",$str);
			$map = genTextMap($str, false);
			if($map[0][1] != "text" && (count($map) == 1 || mb_strlen($map[0][0]) > 45)) {
				$inside .= '<div><img class="miniature" onload="this.style.opacity=1" src="'.p2l(pathTo2(array("param"=>"assets", "url"=>"noimage", "ext"=>"png"))).'"/></div>';
			} else {
				$inside .= '<div class="text-miniature">';
				$inside .= '<div class="paper"></div>';
				$text = strip_tags(cutIfTooLong($p['text'], 150));
				$inside .= '<div class="text-container"><div class="text"><div>'.$text.'</div></div></div>';
				$inside .= '</div>';
			}
		}

		$inside .= "</div>";

		// get the user
		$op = account_load(array('_id' => $p['uid']));
		
		$inside .= '<div class="post-info">';

		$inside .= '<div class="material-shadow op-avatar">'.account_getAvatarHTML($op).'</div>';

		$inside .= '<div class="date">'.convertDate(date('Y-m-d H:i:s', $p['date']->toDateTime()->getTimestamp())).'</div>';
		
		$inside .= '<div class="comments-indicator">';
		$c = count($p['children']);
		if($c > 0) {
			if($unread) {
				$inside .= '<div class="newcom">'.$c.' <i class="icon-comment"></i></div>';
			} else {
				$inside .= '<div>'.$c.' <i class="icon-comment-empty"></i></div>';
			}
		}

		$inside .= '</div>';
		$inside .= '</div>';

		$html .= '<a class="material-shadow post-mini" href="#'.$p['_id'].'" data-id="'.$p['_id'].'">';
		$html .= '<div class="post-inside">'.$inside.'</div></a>';
	}
	return $html;
}

?>
