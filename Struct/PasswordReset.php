<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function pr_initialize($uid) {
	$pr = [];
	$pr['_id'] = mongo_id();
	$pr['date'] = mongo_date();
	$pr['timestamp'] = time();
	$pr['uid'] = $uid;
	$pr['key'] = sha1(rand().$forum['_id'].time());
	$pr['hashkey'] = hash("sha256", $pr['key']);
	return $pr;
}

function pr_save(&$pr) {
	mongo_save("prs",$pr);
}

function pr_destroy($id) {
	mongo_destroy("prs", $id);
}

function pr_load($array) {
	$pr = mongo_load("prs", $array);
	return $pr;
}

function pr_printPage($id, $key) {
	$pr = pr_load(array('_id'=>$id));
	if($pr != null && $pr != false) {
		
		// verify hash
		if($pr['hashkey'] != hash("sha256", $key)) {
			$html = 'the requested password reset is invalid';
			return $html;
		}

		// first verify if the pr is still valid
		if(time()-$pr['timestamp'] > 86400) {
			$pr_destroy($pr['_id']);
			$html = 'the requested password reset is invalid';
			return $html;
		}
			
		// verify that the user is valid
		$u = account_load(array('_id'=>$pr['uid']));
		if($u == null || $u == false) {
			$pr_destroy($pr['_id']);
			$html = 'the requested password reset is invalid';
			return $html;
		}

		// if all's good, then let's go !
		// TODO add javascript verification of the password confirmation
		$html = '
			<img class="pr-logo-zusam" src="Assets/icons/icon-hires.png"/>
			<form class="passwordResetForm material-shadow" method="post" action="'.$_SERVER['PHP_SELF'].'">
				<input type="hidden" value="'.$id.'" name="id"/>
				<input type="hidden" value="'.$key.'" name="key"/>
				<input type="hidden" value="passwordReset" name="action"/>
				<div class="input-group">
					<label name="password">Nouveau mot de passe :</label>
					<input class="insetInput" type="password" name="password"/><br>
				</div>
				<div class="input-group">
					<label name="password_conf">Confirmez le mot de passe :</label>
					<input class="insetIntput" type="password" name="password_conf"/><br>
				</div>
				<div class="input-group center-flex">
					<input type="submit" name="submit"/>
				</div>
			</form>
		';
		return $html;
	}
}

function pr_request() {
	$html = '
		<form action="" method="">
			<input type="mail" name="mail"/>
			<input type="submit" name="submit"/>
		</form>
	';
	return $html;
}


?>
