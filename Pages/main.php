<?php

function main(&$u,&$forum,&$GET,&$POST) {
	// BODY
	echo('<body>');

	// SOME INFOS FOR JAVASCRIPT 
	echo('
	<div class="hidden" id="info" data-uid="'.$u['_id'].'" data-avatar="'.account_getAvatar($u).'" data-fid="'.$_SESSION['forum'].'"></div>
	');

	// MAIN MENU
	echo(page_mainmenu($u, $GET['page']));

	// NEW AVATAR
	echo('<div id="newavatar" class="newavatar"><div id="retoucheBox"></div></div>');

	// POST VIEWER
	echo('<div id="slidepostviewer" class="slide slide-over slidefromright"></div>');

	// NEW POST
	echo('
	<div id="slidenewpost" class="slide slide-over slidefromright">
		<div class="nano">
			<div class="nano-content">
				<div id="newpost" class="newpost">
					<div id="typeBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Partagez quelque chose..."></div></div>
					<div class="menu">
						<div class="menu-cell">
							<button class="cancel" onclick="push_hidenewpost()">Annuler</button>
						</div>
						<div class="menu-cell">
							<button onclick="inputFile(\'#typeBox\')" class="action"><i class="icon-attach"></i></button>
						</div>
						<div class="menu-cell">
							<button class="send" onclick="sendIt(\'#typeBox\')">Envoyer</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	');

	// MAIN_PAGE
	echo('<div id="main_page">');

	// NAVBAR
	echo('<nav>');
	echo(page_nav($u, $forum));
	echo('</nav>');

	// MAIN SECTION
	echo('<section>');
	switch($GET['page']) {
		case "profile": 
			echo(page_section_profile($u));
			break;
		case "forum_settings":
			echo(page_section_forum_settings($u, $forum));
			break;
		default:
			echo(page_section_forum($u, $forum));
			break;
	}
	echo('</section>');

	// MAIN_PAGE
	echo('</div>');

	// FOOTER
	$footer = html_footer($GLOBALS['__ROOT_URL__']);
	echo($footer);
}
