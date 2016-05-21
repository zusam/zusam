<?php

function html_head($root_url) {

	$title = "Zusam";
	$description = "Un espace réellement privé pour vous et votre famille. Echangez photos, vidéos, liens en toute simplicité avec vos proches.";
	$image = $root_url."Assets/ogp.png";

	$html = "";

	$html .= '<head>';
	
	// basic meta tags
	$html .= '<title>'.$title.'</title>';
	$html .= '<meta name="description" content="'.$description.'"/>';
	$html .= '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>';
	$html .= '<meta charset="UTF-8"/>';

	// font
	$html .= '<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">';
	$html .= '<link href="Fonts/fonticon.css?'.filemtime("Fonts/fonticon.css").'" rel="stylesheet">';


	// css
	$html .= '<link href="style.css?'.filemtime("style.css").'" rel="stylesheet">';

	// ogp
	$html .= '<meta property="og:title" content="'.$title.'" />';
	$html .= '<meta property="og:description" content="'.$description.'" />';
	$html .= '<meta property="og:url" content="http://zus.am" />';
	$html .= '<meta property="og:image" content="'.$image.'" />';
	$html .= '<meta property="og:type" content="website" />';
	$html .= '<meta property="og:locale" content="fr_FR" />';
	$html .= '<meta property="og:site_name" content="Zusam" />';

	// twitter cards
	$html .= '<meta name="twitter:card" content="summary" />';
	$html .= '<meta name="twitter:title" content="'.$title.'" />';
	$html .= '<meta name="twitter:description" content="'.$description.'" />';
	$html .= '<meta name="twitter:image" content="'.$image.'" />';
	
	// icons
	$html .= '<link href="Assets/icons/apple-touch-icon.png" rel="apple-touch-icon" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-180x180.png" rel="apple-touch-icon" sizes="180x180" />';
	$html .= '<link href="Assets/icons/icon-hires.png" rel="icon" sizes="192x192" />';
	$html .= '<link href="Assets/icons/icon-normal.png" rel="icon" sizes="128x128" />';


	// loading time calculation
	$html .= '<script>window.startLoading = new Date().getTime();</script>';

	$html .= '</head>';

	return $html;

}

function html_footer($root_url) {

	$html = "";

	// preload some ressources
	$html .= '<img src="Assets/placeholder-mini-post.png" class="hidden">';


	// passing global variables to javascript
	$html .= '
		<script>
			regex = '.json_encode($GLOBALS['regex'],JSON_UNESCAPED_UNICODE).';
			origin_url = "'.$root_url.'";
		</script>
	';

	$html .= '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>';
	//masonry incoming ?
	//$html .= '<script src="https://npmcdn.com/masonry-layout@4.0/dist/masonry.pkgd.min.js"></script>';
	$html .= '<script src="JS.js?'.filemtime("JS.js").'"></script>';
	$html .= '<script src="LIBJS.js?'.filemtime("LIBJS.js").'"></script>';
	$html .= '<script src="https://connect.soundcloud.com/sdk.js"></script>';
	$html .= '</body>';
	$html .= '</html>';

	return $html;

}


?>
