<?php

// define some globals :
require_once('Globals.php');

require_once('Core/Connect.php');
require_once('Core/Filtre.php');
require_once('Core/HTML.php');
require_once('Core/Landing.php');	
require_once('Core/Location.php');
require_once('Core/Mail.php');	
require_once('Core/Miniature.php');
require_once('Core/MongoDriver.php');
require_once('Core/Preview.php');
require_once('Core/Print_post.php');	
require_once('Core/Regex.php');
require_once('Core/TextCompiler.php');	
require_once('Core/Utils.php');	

require_once('Filtre/preview.php');
require_once('Filtre/web_video.php');

require_once('LibPHP/Ganon/ganon.php');
require_once('LibPHP/PHPMailer-5.2.14/PHPMailerAutoload.php');
require_once('LibPHP/Soundcloud.php');

require_once('Pages/forum.php');
require_once('Pages/main.php');
require_once('Pages/mainmenu.php');
require_once('Pages/nav.php');
require_once('Pages/profile.php');

require_once('Reduc/ReducImage.php');
require_once('Reduc/ReducVideo.php');

require_once('Struct/Accounts.php');
require_once('Struct/Album.php');	
require_once('Struct/File.php');	
require_once('Struct/Forum.php');	
require_once('Struct/Notification.php');	
require_once('Struct/PasswordReset.php');
require_once('Struct/Post.php');
require_once('Struct/Record.php');	
