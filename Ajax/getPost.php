<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Utils.php');
require_once('Core/Accounts.php');
require_once('Core/Print_post.php');
require_once('Filtre/web_image.php');

$id = $_GET['id'];

//TODO credentials ?
$u = account_load(array('mail' => $_SESSION['mail']));

$html_data = print_full_post($id, $u['_id']);

/* XXX CANNOT BE USED : bug ! cannot apply web_image to any url without an image file preloadded with curl...
// Force reloading of preview
if($p->preview == "") {
	$text = $p->text;
	$ret = preg_match("/https?:\/\/[\w\/=?~,.%&+\-#\!]+/i",$text,$matches);
	if($ret != false && count($matches) > 0) {
		$preview = $matches[0];
		if($preview != "") {
			web_image($preview);
		}
	} else {
		$preview = "";
	}
	$p->preview = $preview;
	$p->save();
}
*/

$r = new StdClass();
$r->html = $html_data;
//$r->raw = $p['text'];
//$r->preview = $p['preview'];
header('Content-Type: text/json; charset=UTF-8');
echo(json_encode($r));

?>
