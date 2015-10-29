<?php

require_once('Core/Preview.php');

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

$array = array(
	"http://www.lexpress.fr/actualite/societe/justice/air-cocaine-apres-l-evasion-les-interrogations_1730134.html",
	"http://www.lemonde.fr/proche-orient/article/2015/10/27/l-iran-invite-a-participer-a-la-conference-internationale-sur-la-syrie_4798064_3218.html",
	"http://www.lefigaro.fr/politique/le-scan/citations/2015/10/28/25002-20151028ARTFIG00066-regionales-manuel-valls-reintroduit-la-perspective-d-un-front-republicain.php",
	"http://lexpansion.lexpress.fr/entreprises/l-iphone-continue-de-tenir-la-croissance-d-apple-a-bout-de-bras_1730126.html",
	"http://www.lepoint.fr/economie/legere-baisse-du-moral-des-menages-28-10-2015-1977371_28.php",
	"http://www.20minutes.fr/planete/1718659-20151028-rechauffement-golfe-pourrait-etre-trop-chaud-homme-2100",
	"http://www.journaldunet.com/solutions/seo-referencement/1165305-seo-google-injecte-l-intelligence-artificielle-de-rankbrain-dans-son-algo/",
	"http://www.zdnet.fr/actualites/windows-10-atterrissage-sur-la-xbox-one-le-12-novembre-39827214.htm",
	"http://www.zone-numerique.com/motorola-droid-turbo-2-le-smartphone-a-ecran-incassable.html",
	"http://www.virginradio.fr/un-iphone-avec-un-ecran-incassable-bientot-possible-a466366.html",
	"http://www.leparisien.fr/espace-premium/seine-saint-denis-93/lecture-chanson-et-cinema-pour-les-plus-petits-27-10-2015-5221523.php",
	"http://www.lavoixdunord.fr/region/montreuil-deja-501-contrats-d-avenir-signes-dans-le-ia36b49188n3128115",
	"http://www.sciencesetavenir.fr/sante/cancer/20151026.OBS8308/le-risque-de-developper-un-cancer-en-raison-de-la-charcuterie-reste-faible.html",
	"http://www.closermag.fr/people/people-anglo-saxons/encore-sous-le-choc-du-cancer-de-sa-femme-tom-hanks-en-veut-aux-medecins-569933",
	"http://www.ladepeche.fr/article/2015/10/28/2206007-soiree-spectacle-contre-le-cancer.html",
	"http://www.centrepresseaveyron.fr/2015/10/27/viande-et-cancer-les-aveyronnais-ne-s-affolent-pas,978203.php",
	"http://www.mutualite.fr/actualites/cancer-une-technique-innovante-de-reconstruction-mammaire-sans-prothese/",
	"http://www.lanouvellerepublique.fr/Indre/Actualite/Sante/n/Contenus/Articles/2015/10/27/Le-cancer-en-parler-pour-mieux-le-comprendre-2513199",
	"http://www.huffingtonpost.fr/2015/10/27/finalistes-prix-goncourt-boualem-sansal-hedi-kaddour-nathalie-azoulai-mathias-enard-tobie-nathan_n_8398256.html",
	"http://www.ina.fr/contenus-editoriaux/articles-editoriaux/les-prix-litteraires-goncourt-et-renaudot/",
	"http://next.liberation.fr/livres/2015/10/27/goncourt-le-prix-de-l-eternel-spectacle_1409291",
	"http://videos.lexpress.fr/culture/livre/video-le-prix-goncourt-2015-depuis-tunis-entretien-avec-bernard-pivot_1729905.html",
	"http://www.tsa-algerie.com/20151027/prix-goncourt-boulem-sansal-et-son-livre-islamophobe-evinces/",
	"http://www.nordlittoral.fr/france-monde/prix-goncourt-les-quatre-finalistes-devoiles-a-tunis-ia126b0n254872",
	"http://afrique.lepoint.fr/culture/litterature-un-goncourt-pour-l-algerie-en-2015-24-10-2015-1976444_2256.php",
	"http://lci.tf1.fr/people/spectre-une-avant-premiere-royale-pour-james-bond-8675668.html",
	"http://www.metronews.fr/culture/et-si-james-bond-etait-noir-gay-ou-une-femme-pour-roger-moore-c-est-impossible/mojz!ajBXjrqkJ6q4M/",
	"http://www.premiere.fr/Cinema/News-Cinema/Video/James-Bond-quand-Daniel-Craig-se-fait-plumer-au-poker-par-Pierce-Brosnan-4285695",
	"http://www.francesoir.fr/culture-cinema/londres-la-reine-elizabeth-ii-rendez-vous-avec-james-bond",
	"http://www.boursier.com/actualites/reuters/femmes-et-jeunes-ont-toujours-des-emplois-plus-precaires-182010.html?fil8",
	"http://www.lechotouristique.com/article/pourquoi-promovacances-veut-reprendre-fram,77960",
	"http://france3-regions.francetvinfo.fr/alpes/isere/mcphy-energy-va-equiper-paris-d-une-station-de-recharge-pour-vehicules-hydrogene-839151.html",
	"http://www.rtl.fr/culture/web-high-tech/l-europe-met-fin-aux-frais-d-itinerance-le-roaming-7780280674",
	"http://www.challenges.fr/entreprise/20151028.AFP4559/etats-unis-sauf-coup-de-theatre-a-la-fed-pas-de-hausse-des-taux-d-interet-en-vue.html",
	"http://fr.reuters.com/article/frEuroRpt/idFRL8N12R19R20151027",
	"http://www.rfi.fr/economie/20151028-france-allemagne-veulent-accelerer-transition-conference-numerique"	
);

$t1 = microtime(true);

foreach($array as $url) {

	if($url != "" && $url != null) {
		
		$p = preview_initialize($url);
		$ret = json_encode($p);
		$p = json_decode($ret, true);

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
	}
}
	
var_dump(count($array));
$t2 = microtime(true) - $t1;
var_dump($t2);

echo('</body></html>');


?>
