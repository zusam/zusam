<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Accounts.php');

function pr_initialize($uid) {
	$pr = [];
	$pr['_id'] = new MongoId();
	$pr['date'] = new MongoDate();
	$pr['timestamp'] = time();
	$pr['uid'] = $uid;
	$pr['key'] = sha1(rand().$forum['_id'].time());
	$pr['hashkey'] = hash("sha256", $pr['key']);
	return $pr;
}

function pr_save(&$pr) {
	$m = new MongoClient();
	$prs = $m->selectDB("zusam")->selectCollection("prs");
	$mid = new MongoId($pr['_id']);
	$prs->update(array('_id' => $mid), $pr, array('upsert' => true));
}

function pr_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$prs = $m->selectDB("zusam")->selectCollection("prs");
	$prs->remove(array('_id' => $mid));
}

function pr_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$prs = $m->selectDB("zusam")->selectCollection("prs");
	$pr = $prs->findOne($array);
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
				<input type="text" class="hidden" value="'.$id.'" name="id"></input>
				<input type="text" class="hidden" value="'.$key.'" name="key"></input>
				<input type="text" class="hidden" value="passwordReset" name="action"></input>
				<div class="input-group">
					<label name="password">Nouveau mot de passe :</label>
					<input type="password" name="password"></input><br>
				</div>
				<div class="input-group">
					<label name="password_conf">Confirmez le mot de passe :</label>
					<input type="password" name="password_conf"></input><br>
				</div>
				<div class="input-group center-flex">
					<input type="submit" name="submit"></input>
				</div>
			</form>
		';
		return $html;
	}
}

function pr_request() {
	$html = '
		<form action="" method="">
			<input type="mail" name="mail"></input>
			<input type="submit" name="submit"></input>
		</form>
	';
	return $html;
}


?>
