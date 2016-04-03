<?php
session_start();
// Report all errors except E_NOTICE   
error_reporting(E_ALL ^ E_NOTICE);

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Include.php');

$POST['fid'] = "5625fb7e307d598c5d5898ab";
$POST['list'] = "[]";
$_SESSION['uid'] = "56251782307d593b395898ab";
$POST['number'] = 22;

			$u = account_load(array('_id'=>$_SESSION['uid']));
			$list = json_decode($POST['list'], true);
			
			$fid = $POST['fid'];
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false && in_array($_SESSION['uid'], $f['users'])) {
				$news = array_reverse($f['news']);
				$n = intval($POST['number']);
				if($n == 0) {
					$n = 30;
				}
				$j = 0;
				$i = 0;
				$html = "";
				$newslist = [];

				// max 300 posts backwards
				while($i < $n && $j < count($news) && $j < 300) {
					if(!in_array($news[$j], $list)) {
						$p = post_load(array('_id'=>$news[$j]));
						if($p != null && $p != false) {
							$i++;
							if(in_array((String) $p['_id'], $u['unread'])) {
								$html .= print_post_mini($p, true);
							} else {
								$html .= print_post_mini($p, false);
							}
							//$newslist[] = $news[$j];
							array_push($newslist, $news[$j]);
						} else {
							//var_dump($news[$j]);
							//deleteValue($news[$j], $f['news']);		
							//forum_save($f);
						}
					}
					$j++;
				}

				//forum_save($f);
				
				$r = new StdClass();
				$r->html = $html;
				//$r->html = "";
				$r->list = $newslist;
				$r->count = $i;
				$r->load = $j;
				if($i < $n) {
					$r->end = true;
				} else {
					$r->end = false;
				}
				//header('Content-Type: text/json; charset=UTF-8');
				//echo(json_encode($r));
				var_dump($r);
			}
			exit;
?>
