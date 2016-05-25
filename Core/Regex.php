<?php

global $regex;
$regex = array(
	'gfycat' => '(https?:\/\/gfycat.com\/)',
	'facebook_video' => '(https?:\/\/www.facebook.com\/.*videos\/[0-9]+)',
	'imgur' => '(https?:\/\/imgur.com\/)',
	'instagram' => '(https?:\/\/www.instagram.com\/)',
	//'onedrive' => '(https?:\/\/onedrive.live.com\/)',
	'googleDrive' => '(https?:\/\/drive.google.com\/)',
	'soundcloud' => '(https?:\/\/soundcloud.com\/)',
	'vine' => '(https?:\/\/vine.co\/v\/)([\w\-]+)',
	'dailymotion' => '(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)',
	'vimeo' => '(https?:\/\/vimeo.com\/)([^\s]*)([0-9]+)',
	'youtube2' => '(https?:\/\/youtu\.be\/)([\w\/=?~.%&+\-#]+)',
	'youtube' => '(https?:\/\/(www|m)\.youtube\.com\/watch[\w\/=?~.%&+\-#]+)',
	'video' => '(https?:\/\/[^\s]+)(\.mp4|\.webm|\.gifv)',
	'image' => '(https?:\/\/[^\s]+)(\.jpg|\.bmp|\.jpeg|\.png)',
	'gif' => 'https?:\/\/[^\s]+(\.gif(?!v))',
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
