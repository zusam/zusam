<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

$stats = [];
$users = account_bulkLoad(array("absenceMail"=>"yes"));
foreach($users as $u) {

	if(intval($u['timestamp']) < time() - 60*60*24*7) {

		if(isset($u['unread']) && count($u['unread']) > 0) {
			$n = 0;
			foreach($u['unread'] as $pid) {
				$p = post_load(array("_id"=>$pid));
				if(!empty($p)) {
					if(count($p['children']) > 0) {
						$n++;
						continue;
					}
					if(!isset($p['parent']) || $p['parent'] == null || $p['parent'] == 0 || empty($p['parent']) || $p['parent'] == "") {
						$n++;	
					} 
				}
			}
			if(isset($stats[$n])) {
				$stats[$n] = $stats[$n] + 1;
			} else {
				$stats[$n] = 1;
			}

			//if($n > 10000000) {
			//	$content = '
			//		<html>
			//			<head>
			//				<meta charset="UTF-8">
			//			</head>
			//			<body>
			//				<p>
			//					Bonjour '.$u['name'].',<br><br><br>
			//					Cela fait plus d\'une semaine que vous n\'êtes pas venu sur Zusam et il y a du nouveau !<br>
			//					'.$n.' messages ont été publiés en votre absence.<br><br>
			//					Vous pouvez aller lire ces messages en vous connectant à votre compte 
			//					<a href="http://zus.am">Zusam</a><br>
			//					Cordialement,<br>
			//					L\'équipe de Zusam
			//				</p>
			//			</body>
			//		</html>
			//	';

			//	$subject = $n.' nouveaux messages sur Zusam !';
			//	mail_general($u['mail'], $subject, $content);
			//}
		}
	}
}

$previous_stats = json_decode(file_get_contents("Log/absenceMail.log"), true);
if($previous_stats == null) {
	$previous_stats = [];
}
array_push($previous_stats, array("date"=>time(),"stats"=>$stats));
$json_string = json_encode($previous_stats);
file_put_contents("Log/absenceMail.log",$json_string);


?>
