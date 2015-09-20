<?php

// THIS IS A SIDE PROJECT FOR NOW.

include('Ganon/ganon.php');
//include('Simple_html_dom/simple_html_dom.php');

function getElementValue($element) {

//echo("processing : ".$element->dumpLocation()."<br>");

	// initialize all values for this node
	$v = 0;
	$article = new stdClass();
	$article->value = 0;
	$article->text = "";
	$article->elmt = $element;
	$selected = [];
	$total_points = 0;
	$total_txt = "";

	// we do not want these
	if($element->tag == "script" || $element->tag == "style" || $element->tag == "figure" || $element->tag == "form") {
		return $article;
	}

	if($element->childCount() > 0) {

		// process all children
		for ($i = 0; $i < $element->childCount(); $i++) {
			$e = $element->getChild($i);
			//if($e->tag == "header" || $e->tag == "div" || $e->tag == "span") {
			$ret = getElementValue($e);
			if($ret->value > 3) {
				$paragraph = new stdClass();
				$paragraph->value = $ret->value;
				$paragraph->text = $ret->text;
				//$paragraph->elmt = $e;
				$selected[] = $paragraph;
				$total_points += $paragraph->value;
				$total_txt .= $paragraph->text;
			}
		}

		//// now that this is done, we need to decide if all this is a great article or if a paragraph is already containing all the cool stuff
		//// this can be done only if enough points were gathered
		//if(total_points > 10) {
		//	for($i = 0; $i < count($selected); $i++) {
		//		$p = $selected[$i]->value / $total_points;		
		//		// if more than 95% of the information
		//		if($p > 0.95) {
		//			$article->value = $selected[$i]->value;
		//			$article->text = $selected[$i]->text;
		//			break;
		//			echo('<h2>ANOMALY : ('.$article->value.')</h2>');
		//			echo($article->text);
		//			echo('<br>');
		//		}
		//	}
		//}

		//// if nothing particular was found, carry on
		//if($article->value == 0) {
		//	$article->value = $total_points;
		//	$article->text = $total_txt;
		//	if($total_points > 3) {
		//		echo('<h2>NORMAL : ('.$article->value.')</h2>');
		//		echo($article->elmt->dumpLocation()."<br>");
		//		echo($article->text);
		//		echo('<br>');
		//	}
		//}

		$article->value = $total_points;
		$tag = getTag($element);
		$ttag = getTag($element, true);
		$article->text = $tag.$total_txt.$ttag;
		return $article;


	} else {  
		// no child ? Then we return our value
		if(preg_match("/^h[1-6]$/",$element->tag)==1 || $element->tag == "p" || $element->tag == "code" || $element->tag == "~text~" || $element->tag == "a") {
			$article->value = getValue($element);
			$tag = getTag($element);
			$ttag = getTag($element, true);
			$article->text = $tag.$element->getPlainTextUTF8().$ttag;
			//$article->elmt = $element;
			return $article;
		} else {
			return $article;
		}
	}
}

function getTag($e, $closing) {
	$tag = $e->tag;
	if($tag == "~text~") {
		return "";
	}
	if($closing) {
		return "</".$tag.">";
	} else {
		return "<".$tag.">";
	}
}

function getValue($e) {
	$str = $e->getPlainTextUTF8();
	if(preg_match("/^\s*$/",$str)==1) {
		return 0;
	}
	$v = 0;

	if(preg_match("/^h.$/",$e->tag)==1) {
		$v += 5;
	} else {
		if(strlen($str) < 25) {
			return 0;
		}
		if($e->tag == "li") {
			$v -= 3;
		}
		if($e->tag == "a") {
			$v += 5;
		}
	}
	$v += min(floor(strlen($str)/100), 3);
	$v += min(substr_count($str, ","), 5);
	//$v -= min(count(preg_match_all("/[=+><{}]/",$str)), 5);
	return max($v, 0);
}

function extractText($element) {
	for ($i = 0; $i < $element->childCount(); $i++) {
		$e = $element->getChild($i);
		if($e->tag == "header" || $e->tag == "div" || $e->tag == "span" || $e->tag == "ul") {
			extractText($e);
		} else {
			if(preg_match("/^h[1-6]$/",$e->tag)==1 || $e->tag == "p" || $e->tag == "code" || $e->tag == "~text~" || $e->tag == "li") {
				$v = getValue($e);
				if($v > 0) {
					echo('<span style="color:orange;font-weight:bold">'.$v."</span><br>");
					$tag = getTag($e);
					$ttag = getTag($e, true);
					echo($tag.$e->getPlainTextUTF8().$ttag);
					echo('<br>');
				}
			} 
		}
	}
}


function getHTML($url) {
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
	$header = curl_exec($ch);
	curl_close($ch);
	$html = str_get_dom($header);
	return $html;
}


$url = $_GET['url'];
$html = getHTML($url);
$body = $html('body')[0];

for($i = 0; $i < $body->childCount(); $i++) {
	$article = getElementValue($body->getChild($i));
	if($article->value > 0) {
		echo('<h1 style="color:green"> FOUND VALUE : ('.$article->value.')</h1>');
		echo($body->getChild($i)->childCount());
		echo('<br>');
		echo($body->getChild($i)->dumpLocation()."<br>");
		echo($article->text);
	}
}


exit;

$selected = [];

foreach($html('article, div') as $node) {
	$v = getElementValue($node);
	if($v > 30) {
		$selected[] = $node;
		echo('<h1 style="color:green"> PASSED : ('.$v.')</h1>');
		//echo($node->dumpLocation()."<br>");
		extractText($node);
	} else {
		if($v > 0) {
			//echo('<h1 style="color:red"> FAILED : ('.$v.')</h1>');
			//echo($node->getInnerText());
		}
	}
}



?>
