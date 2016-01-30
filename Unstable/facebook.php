<?php

// OLD FILE FROM THE FORUM.
// TO ADAPT FOR ZUSAM

	function facebook($url) {

		// facebook image
		if($flag == 0 && preg_match("/https?:\/\/www\.facebook\.com\/.*\/photos\/.*/",$word) == 1) {

			if($option == "light") {

				$graph_id = preg_replace("/.*\/([0-9]+).*/","$1",$word);
				$ch = curl_init('https://graph.facebook.com/'.$graph_id);
				curl_setopt($ch, CURLOPT_HEADER, false);
				curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
				curl_setopt($ch, CURLOPT_ENCODING, "");
				curl_setopt($ch, CURLOPT_USERAGENT, "nibou");
				curl_setopt($ch, CURLOPT_AUTOREFERER, true);
				curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
				curl_setopt($ch, CURLOPT_TIMEOUT, 5);
				curl_setopt($ch, CURLOPT_MAXREDIR, 10);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				$ret = curl_exec($ch);
				curl_close($ch);
				$json = json_decode($ret);
				$pic = $json->images[1]->source;
				if($pic == "") {
					//$pic = "images/overlay_fb.jpg";
				}
				$word = ' <img class="img-cover" src="'.$pic.'"/> ';
				$word .=  '<span class="facebook-badge"><i class="fa fa-facebook"></i></span>';
				$flag = 1;
			} else {

				$word = preg_replace("/(https?:\/\/www.facebook.com\/.+)/",
						"<div class=\"block-center\">
						<div id=\"fb-root\"></div>
						<script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = \"//connect.facebook.net/fr_FR/all.js#xfbml=1\"; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));</script>
						<div  class=\"fb-post\" data-href=\"$1\" data-width=\"600\"><div class=\"fb-xfbml-parse-ignore\"><a href=\"$1\"></a></div></div>
						</div>",$word);
				$flag = 1;
			}

		}

		// facebook video
		if($flag == 0 && preg_match("/https?:\/\/www\.facebook\.com\/video\.php/",$word) == 1) {

			if($option == "light") {

				$graph_id = preg_replace("/.*v=([0-9]+).*/","$1",$word);
				$ch = curl_init('https://graph.facebook.com/'.$graph_id);
				curl_setopt($ch, CURLOPT_HEADER, false);
				curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
				curl_setopt($ch, CURLOPT_ENCODING, "");
				curl_setopt($ch, CURLOPT_USERAGENT, "nibou");
				curl_setopt($ch, CURLOPT_AUTOREFERER, true);
				curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
				curl_setopt($ch, CURLOPT_TIMEOUT, 2);
				curl_setopt($ch, CURLOPT_MAXREDIR, 10);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				$ret = curl_exec($ch);
				curl_close($ch);
				$json = json_decode($ret);
				$pic = $json->format[1]->picture;
				if($pic == "") {
					//$pic = "images/overlay_fb.jpg";
				}
				$word = ' <img class="img-cover" src="'.$pic.'"/> ';
				$word .=  '<span class="facebook-badge"><i class="fa fa-facebook"></i></span>';
				$flag = 1;
			} else {

				$word = preg_replace("/(https?:\/\/www.facebook.com\/.+)/",
						"<div class=\"block-center\">
						<div id=\"fb-root\"></div>
						<script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = \"//connect.facebook.net/fr_FR/all.js#xfbml=1\"; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));</script>
						<div  class=\"fb-post\" data-href=\"$1\" data-width=\"600\"><div class=\"fb-xfbml-parse-ignore\"><a href=\"$1\"></a></div></div>
						</div>",$word);
				$flag = 1;
			}

		}
}
?>
