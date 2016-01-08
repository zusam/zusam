<?php

function html_head() {

	$title = "Zusam";
	$description = "Un espace réellement privé pour vous et votre famille. Echangez photos, vidéos, liens en toute simplicité avec vos proches.";
	$image = "http://zus.am/Assets/ogp.png";

	$html = "";

	$html .= '<head>';
	
	// basic meta tags
	$html .= '<title>'.$title.'</title>';
	$html .= '<meta name="description" content="'.$description.'"/>';
	$html .= '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>';
	$html .= '<meta charset="utf-8"/>';

	// css
	$html .= '<link href="style.css" rel="stylesheet">';
	
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
	$html .= '<meta name="twitter:image" content"'.$image.'" />';
	
	// icons
	$html .= '<link href="Assets/icons/apple-touch-icon.png" rel="apple-touch-icon" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-76x76.png" rel="apple-touch-icon" sizes="76x76" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-120x120.png" rel="apple-touch-icon" sizes="120x120" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-152x152.png" rel="apple-touch-icon" sizes="152x152" />';
	$html .= '<link href="Assets/icons/apple-touch-icon-180x180.png" rel="apple-touch-icon" sizes="180x180" />';
	$html .= '<link href="Assets/icons/icon-hires.png" rel="icon" sizes="192x192" />';
	$html .= '<link href="Assets/icons/icon-normal.png" rel="icon" sizes="128x128" />';
	$html .= '</head>';

	return $html;

}

function html_footer() {

	$html = "";

	$html .= '<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>-->';
	$html .= '<script src="http://connect.soundcloud.com/sdk.js"></script>';
	$html .= '<script src="LibJS/jquery.2.1.4.min.js"></script>';
	$html .= '<script src="LibJS/fastclick.min.js"></script>';
	$html .= '<script src="zusam.min.js"></script>';
	$html .= '</body>';
	$html .= '</html>';

	return $html;

}


?>
