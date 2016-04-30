<?php

global $regex;
$regex = array(
	'gfycat' => '(https?:\/\/gfycat.com\/)([^\s]+)',
	'facebook_video' => '(https?:\/\/www.facebook.com\/.*videos\/[0-9]+)([^\s]+)',
	'imgur' => '(https?:\/\/imgur.com\/)([^\s]+)',
	'instagram' => '(https?:\/\/www.instagram.com\/)([^\s]+)',
	//'onedrive' => '(https?:\/\/onedrive.live.com\/)([^\s]+)',
	'googleDrive' => '(https?:\/\/drive.google.com\/)([^\s]+)',
	'soundcloud' => '(https?:\/\/soundcloud.com\/)([^\s]+)',
	'vine' => '(https?:\/\/vine.co\/v\/)([\w\-]+)',
	'dailymotion' => '(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)',
	'vimeo' => '(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)',
	'youtube2' => 'https?:\/\/youtu\.be\/[\w\/=?~.%&+\-#]+',
	'youtube' => 'https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+',
	'video' => 'https?:\/\/[^\s]+(\.mp4|\.webm|\.gifv)(\?\w*)?',
	'image' => 'https?:\/\/[\w\/=?~.%&+\-#\!\']+(\.jpg|\.bmp|\.jpeg|\.png)([^\s]+)?',
	'gif' => 'https?:\/\/[\w\/=?~.%&+\-#\!\']+(\.gif(?!v))(\?[\w\/=?~.%&+\-#\!\']+)?',
	'file' => '\{\:[a-zA-Z0-9]+\:\}',
	'link' => 'https?:\/\/[^\s]+'
);

// convert string to be usable in php regex
function r2p($str) {
	return "/".$str."\s+/i";
}

// convert string to be usable to encapsulate in php
function r2ep($str) {
	return "/(".$str.")/i";
}
