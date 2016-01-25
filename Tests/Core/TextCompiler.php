<?php

chdir(realpath(dirname(__FILE__))."/../../");
require_once('Core/TextCompiler.php');
require_once('LibPHP/Ganon/ganon.php');

function getNewsGoogleLinks() {
	$html = getHTMLRessource("https://news.google.com");
	$links = $html('a.article');
	$hrefs = [];
	foreach($links as $link) {
		$h = $link->href;
		if(isset($h) && $h != "") {
			//if(preg_match("/^\//",$h)==1) {
			//	$h = "https://www.reddit.com".$h;
			//}
			$hrefs[] = $h;
		}
	}
	return $hrefs;
}

function getRedditLinks() {
	$html = getHTMLRessource("https://www.reddit.com");
	$links = $html('a.title');
	$hrefs = [];
	foreach($links as $link) {
		$h = $link->href;
		if(isset($h) && $h != "") {
			if(preg_match("/^\//",$h)==1) {
				$h = "https://www.reddit.com".$h;
			}
			$hrefs[] = $h;
		}
	}
	return $hrefs;
}

function getHTMLRessource($url) {

	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_ENCODING, "");
	curl_setopt($ch, CURLOPT_USERAGENT, "");
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch, CURLOPT_MAXREDIR, 10);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIEFILE, "/tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_COOKIEJAR, "/tmp/cookie.txt");
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	$html_string = curl_exec($ch);
	curl_close($ch);
	
	//remove script/style tags
	$dom = new DOMDocument();
	$html_string = to_utf8($html_string);
	$html_string = mb_convert_encoding($html_string, 'HTML-ENTITIES', "UTF-8"); 
	$dom->loadHTML($html_string);
	$remove = [];
	$script = $dom->getElementsByTagName('script');
	foreach($script as $item) {
		$remove[] = $item;
	}
	$style = $dom->getElementsByTagName('style');
	foreach($style as $item) {
		$remove[] = $item;
	}
	foreach ($remove as $item) {
		$item->parentNode->removeChild($item); 
	}
	$html_string = $dom->saveHTML();
	$html = str_get_dom($html_string);

	return $html;
}

function bulkTest_compileText() {

	$test = array(
		"",
		"a",
		"[[a]]",
		"[[[[a]]]]",
		"http://zus.am",
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat semper magna, vel blandit urna interdum ut.",
		"http://motherboard.vice.com/read/jeff-bezos-rocket-reached-space-and-returned-yet-again",
		"http://www.ladepeche.fr/article/2016/01/22/2261365-prise-d-otage-et-fusillade-dans-un-monoprix-a-lille.html",
		"https://www.reddit.com/r/AskReddit/comments/42c25q/why_did_the_wife_make_you_sleep_on_the_sofa_last/",
		"http://sports.yahoo.com/news/water-polo-attendance-record-hosts-serbia-land-euro-183206597--spt.html",
		"https://www.reddit.com/r/Showerthoughts/comments/42c223/isnt_giving_someone_shampoo_for_secret_santa/",
		"http://imgur.com/24AJWka",
		"https://www.reddit.com/r/Fitness/comments/42c2cm/help_me_implement_snatch_and_clean_and_jerk_into/",
		"https://youtu.be/g75lrBKi55E",
		"https://i.imgur.com/8QU9YfR.jpg",
		"http://i.imgur.com/V1HMBvO.jpg",
		"http://i.imgur.com/kU3chMe.gifv",
		"https://gfycat.com/UnfinishedForkedBluet",
		"http://imgur.com/UatkKan.gifv",
		"http://www.globalpost.com/article/6723725/2016/01/22/japan-accepts-27-refugees-last-year-rejects-99",
		"https://m.imgur.com/osjUvD6",
		"https://en.wikipedia.org/wiki/Aurora_(Disney_character)",
		"http://www.bbc.co.uk/news/entertainment-arts-35381354",
		"https://imgur.com/a/AeGsu",
		"http://imgur.com/Jud0vSa",
		"http://i.imgur.com/mJyABlG.jpg",
		"https://farm9.staticflickr.com/8566/15680928823_7cefca1808_k.jpg",
		"https://www.reddit.com/r/AskReddit/comments/42asa3/which_persistent_misconceptionmyth_annoys_you_the/",
		"https://cdn0.artstation.com/p/assets/images/images/000/916/864/large/stanley-barros-portraitgirl-lowjpg.jpg?1436121313",
		"http://imgur.com/6dZhOHk",
		"https://youtu.be/2qpI49SuDTo?t=21s",
		"https://www.reddit.com/r/Jokes/comments/42aj2i/what_do_you_call_5_black_people_having_sex/",
		"https://www.reddit.com/r/Showerthoughts/comments/42axmv/reddit_cares_more_about_leonardos_oscar_than/",
		"http://www.sciencedaily.com/releases/2016/01/160122145457.htm",
		"http://www.paulcombs.net/the-sonic-typewriter-blog/the-worlds-most-beautiful-bookstores",
		"http://www.gifbin-media.info/2016/01/mutual-peace-offerings.html",
		"http://www.detroitnews.com/story/entertainment/music/2016/01/22/pearl-jam-donates-flint-water-crisis/79173162/",
		"https://www.reddit.com/r/askscience/comments/42av75/whats_going_on_with_technetium/",
		"http://www.engadget.com/2016/01/22/intel-compute-stick-2016-review/",
		"https://www.reddit.com/r/LifeProTips/comments/42a4ac/lpt_if_you_live_in_the_blizzard_affected_areas/"
	);

	$test2 = array(
		"https://i.imgur.com/8QU9YfR.jpg",
		"http://i.imgur.com/V1HMBvO.jpg",
		"http://i.imgur.com/kU3chMe.gifv",
		"https://gfycat.com/UnfinishedForkedBluet",
		"http://imgur.com/UatkKan.gifv",
		"http://i.imgur.com/mJyABlG.jpg",
		"http://imgur.com/6dZhOHk",
		"https://youtu.be/2qpI49SuDTo?t=21s",
	);

	$test3 = "
	{:ij8ricz3i59h460m9dp0ja1g:}{:ij8rjytktfakmzcpypffgqz:}{:ij8rm3nhijz17rhzndfm63qc:}{:ij8rnuad15vjjo2kt9lllekli:}{:ij8rqe0hca5osg6yhtsfre6s6:}{:ij8rte6bsse9qqlpexcjnpdc:}{:ij8rv1mbnmrq3jwfxtsr9axc:}{:ij8rxpgnrxf4ksu5n1nt974s:}{:ij8rze4y0y5r2ezbzuwhzljl:}
	";
	//$redditLinks = getRedditLinks();
	//$newsGoogleLinks = getNewsGoogleLinks();
	//$t = $newsGoogleLinks[0];

	$html = '<html>';
	$html .= '<head>';
	$html .= '<meta name="description" content="'.$description.'"/>';
	$html .= '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>';
	$html .= '<meta charset="utf-8"/>';
	$html .= '<link href="style.css" rel="stylesheet">';
	$html .= '</head><body>';
	echo($html);

	echo('<div id="post-viewer" style="width:530px">');
	
	//$i = 0;
	foreach($test2 as $t) {
	//$t = $test3;
		//echo('"'.$t.'",<br>');
		$tt = compileText($t);
		echo('<textarea>'.$t.'</textarea>');
		echo('<br>');
		echo('<div class="post-parent-text dynamicBox viewerBox">');
		echo($tt);
		echo('</div>');
		echo('<br><br>');

	}

	echo('</div>');
	echo('</body></html>');

	//$tt = compileText("http://zus.am");


}

bulkTest_compileText();


