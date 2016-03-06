<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

if($_SESSION['connected']) {

	// secure post variables for mongodb
	$GET = [];
	foreach($_GET as $K=>$V) {
		$GET[$K] = (String) $V;
	}

	if($GET['action'] != null && $GET['action'] != "") {

		// TODO protect
		if($GET['action'] == "getPostStats") {
			$uid = $GET['uid'];
			//$fid = $GET['fid'];
			$pid = $GET['pid'];
			$r = new StdClass();

			$u = account_load(array('_id' => $uid));
			//$f = forum_load(array('_id'=>$fid));
			$p = post_load(array('_id'=>$pid));
			if($p != null && $p != false) {
				$coms = 0;
				foreach($p['children'] as $cid) {
					$c = post_load(array('_id'=>$cid));
					if($c != null && $c != false) {
						$coms++;
					} else {
						post_removeChild($p, $cid);
					}
				}
				post_save($p);
				$r->coms = $coms;
			
				if(in_array($pid,$u['unread'])) {
					$r->unread = true;
				} else {
					$r->unread = false;
				}
				
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
			}
			exit;
		}

		// TODO protect ?
		if($GET['action'] == "getProgress") {

			$fileId = $GET['fileId'];

			$response = new StdClass();
			if(file_exists('tmp/'.$fileId)) {
				$p = file('tmp/'.$fileId);
				$pc = count($p);
				for($i=0;$i<$pc;$i++) {
					if(preg_match("/^out_time_ms/",$p[$pc-$i])==1) {
						$out_time_ms = preg_replace("/^out_time_ms=(\d+)/","$1",$p[$pc-$i]);
						break;
					}
				}
				$response->progress = $out_time_ms;
			} else {
				$response->progress = false;
			}

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;

		}

		// TODO protect
		if($GET['action'] == "getAvatar") {

			$uid = $GET['uid'];

			$response = new StdClass();
			$response->avatar = p2l(pathTo2(array("url"=>$uid,"param"=>"avatar","ext"=>"jpg")));

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;
		}

		// TODO protect
		if($GET['action'] == "getMoreComments") {

			$pid = $GET['pid'];
 
			$u = account_load(array('_id' => $_SESSION['uid']));
			$p = post_load(array('_id' => $pid));
	
			//if($p['forum'] == mongo_id($_SESSION['forum']) && isset($u['forums'][$_SESSION['forum']])) { 
				$r = new StdClass();
				$html_data = print_more_comments($pid, $u['_id']);
				$r->html = $html_data;
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
			//}
			exit;
		}

		// TODO protect
		if($GET['action'] == "getPost") {

			$id = $GET['id'];
 
			$u = account_load(array('_id' => $_SESSION['uid']));
			$p = post_load(array('_id' => $id));
	
			//if($p['forum'] == mongo_id($_SESSION['forum']) && isset($u['forums'][$_SESSION['forum']])) { 
				$r = new StdClass();
				//$r->before = $u['unread'];
				account_readPost($u, $id);
				account_save($u);
				//$r->after = $u['unread'];
				$html_data = print_full_post($id, $u['_id']);
				$r->html = $html_data;
				//$r->raw = getRawText($id);
				//$r->encap = encapsuleKnownLinks($r->raw);
				//$r->decap = decapsuleLinks(encapsuleKnownLinks($r->raw));
				//$r->comp = compileText($r->raw);
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
			//}
			exit;
		}

		// TODO protect
		if($GET['action'] == "getRaw") {

			$pid = $GET['pid'];
			//$uid = $GET['uid'];

			//$u = account_load(array('_id' => mongo_id($uid)));
			$p = post_load(array('_id'=>mongo_id($pid)));
			$raw = $p['text'];
			$r = new StdClass();
			$r->raw = $raw;
			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($r));
			exit;
		}
	}
}
