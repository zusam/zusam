<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Core/Location.php');

function acount_getDummy() {
	$ac = [];
	$ac['_id'] = -1;
	$ac['date'] = -1;
	$ac['mail'] = "";
	$ac['name'] = "Utilisateur inconnu";
	$ac['password'] = "";
	$ac['forums'] = [];
	$ac['salt'] = "888888888888";
	return $ac;
}

function account_initialize($mail, $password) {
	$ac = [];
	$ac['_id'] = new MongoId();
	$ac['date'] = new MongoDate();
	$ac['mail'] = $mail;
	$ac['name'] = preg_replace("/^(.*)@.*$/","$1",$mail);
	$ac['password'] = password_hash($password, PASSWORD_BCRYPT);
	$ac['forums'] = [];
	$ac['salt'] = bin2hex(openssl_random_pseudo_bytes(6));
	return $ac;
}

function account_save(&$ac) {
	$m = new MongoClient();
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$mid = new MongoId($ac['_id']);
	$accounts->update(array('_id' => $mid), $ac, array('upsert' => true));
}

function account_load($array) {
	if($array['_id'] != null && $array['_id'] != "") {
		$array['_id'] = new MongoId($array['_id']);
	}
	$m = new MongoClient();
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$ac = $accounts->findOne($array);
	return $ac;
}

function account_getAvatar(&$ac) {
	//dummy
	if($ac['_id'] == -1) {
		return "";
	}
	$loc = array("url"=>$ac['_id'], "param"=>"avatar", "ext"=>"jpg");
	if(file_exists(pathTo2($loc))) {
		$avatar = p2l(pathTo2($loc));
	} else {
		return "";
	}
	return $avatar;
}

function account_genIdenticon(&$ac) {

	list($r,$g,$b) = sscanf(substr($ac['salt'],0,6), "%02x%02x%02x");
	$rl = floor((255+$r)/2);
	$gl = floor((255+$g)/2);
	$bl = floor((255+$b)/2);
	$rd = floor((0+$r)/2);
	$gd = floor((0+$g)/2);
	$bd = floor((0+$b)/2);

	$html = '';
	$html .= '
		<div class="identicon" style="background:rgb('."$rd,$gd,$bd".')">
			<div style="background:rgb('."$rl,$gl,$bl".')" class="head"></div>
			<div class="shoulder" style="background:rgb('."$rd,$gd,$bd".')" ></div>
			<div style="background:rgb('."$rl,$gl,$bl".')" class="body"></div>
		</div>
	';

	return $html;
}

function account_getAvatarHTML(&$ac) {
	$html = "";
	$avatar = account_getAvatar($ac);
	if($avatar == "") {
		$html = account_genIdenticon($ac);	
	} else {
		$html = '<img src="'.$avatar.'"/>';
	}
	return $html;
}

function account_destroy($id) {
	$m = new MongoClient();
	$mid = new MongoId($id);
	$accounts = $m->selectDB("zusam")->selectCollection("accounts");
	$accounts->remove(array('_id' => $mid));
}

?>
