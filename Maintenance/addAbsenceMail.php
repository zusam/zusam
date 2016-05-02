<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

//chunk of code that can be removed after a while
$users = account_bulkLoad([]);
foreach($users as $u) {
	if(!isset($u['absenceMail'])) {
		$u['absenceMail'] = "yes";
		account_save($u);
	}
}
