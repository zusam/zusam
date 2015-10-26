<?php

require_once('Core/Preview.php');


$url = $_GET['url'];

if($url != "") {
	$p = preview_initialize($url);
	$ret = json_encode($p);
	$p = json_decode($ret, true);
}

echo('
<html>
<head>
	<meta charset="utf-8"/>
	<link href="style.css" rel="stylesheet">
	<style>
	.debug_info {
		width: 540px;
		margin: 10px auto;
		text-align: center;
	}
	.form_element {
		width: 100%;
		margin: 2px 0px;
		padding: 2px;
	}

	</style>
</head>
<body style="background:white">
');

echo('<form class="debug_info" action="'.$_SERVER['PHP_SELF'].'" method="GET">
		<div><input class="form_element" name="url" type="text" placeholder="URL de la preview à générer"></div>
		<div><input class="form_element" type="submit" value="Générer"></div>
	</form>');

if($url != "" && $url != null) {

	echo('<p class="debug_info"> Preview générée en '.$p['total_time'].'s</p>');

	echo('<div class="post-parent-text dynamicBox">');
	echo('<span class="deletable">');
	if($p['image']['url'] != null) {
		$preview = '<div class="preview"><img onerror="this.src=\'http://www.nibou.eu/zusam/web/assets/no_image.png\';" src="'.$p['image']['url'].'"/></div>';
	} else {
		$preview = "";
	}
	if($p['title'] != null && $p['title'] != "") {
		$title = '<div class="title">'.$p['title'].'</div>';
	} else {
		$title = "";
	}
	if($p['description'] != null && $p['description'] != "") {
		$description = '<div class="description">'.$p['description'].'</div>';
	} else {
		$description = "";
	}
	if($preview != "" || ($title != "" && $description != "")) {
		if($p['image'] != "" && $p['image']['width'] != null && $p['image']['height'] != null && $p['image']['width'] < 380) {
			echo('<a class="article_small" href="'.$p['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$p['base_url'].'</div></a>');
		} else {
			echo('<a class="article_big" href="'.$p['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$p['base_url'].'</div></a>');
		}
	}
	echo('</span>');
	echo('</div>');
	echo('<br>');

	echo('<p class="debug_info"> Candidate previews</p>');
	foreach($p['candidates'] as $img) {

		echo('<div class="post-parent-text dynamicBox">');
		echo('<span class="deletable">');
		if($img['url'] != null) {
			$preview = '<div class="preview"><img onerror="this.src=\'http://www.nibou.eu/zusam/web/assets/no_image.png\';" src="'.$img['url'].'"/></div>';
		} else {
			$preview = "";
		}
		if($p['image'] != "" && $img['width'] != null && $img['height'] != null && $img['width'] < 380) {
			echo('<a class="article_small" href="'.$p['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$p['base_url'].'</div></a>');
		} else {
			echo('<a class="article_big" href="'.$p['url'].'" target="_blank">'.$preview.$title.$description.'<div class="base_url">'.$p['base_url'].'</div></a>');
		}
		echo('</span>');
		echo('</div>');
		echo('<br>');
	}
	
	echo('<br>');
	var_dump($p);
}

echo('</body></html>');


?>
