<?php

namespace App\Service;

use Embed\Embed;

class Url
{
    public static function getData(string $url): array
    {
        try {
            $info = Embed::create($url);
            return [
                "tags" => $info->tags, //The page keywords (tags)
                "linkedData" => $info->linkedData, //The linked-data info (http://json-ld.org/)
                "feeds" => $info->feeds, //The RSS/Atom feeds
                "title" => $info->title, //The page title
                "description" => $info->description, //The page description
                "url" => $info->url, //The canonical url
                "type" => $info->type, //The page type (link, video, image, rich)
                "content-type" => $info->getResponse()->getHeader("content-Type"), //The content type of the url

                "images" => $info->images, //List of all images found in the page
                "image" => $info->image, //The image choosen as main image
                "imageWidth" => $info->imageWidth, //The width of the main image
                "imageHeight" => $info->imageHeight, //The height of the main image

                "code" => $info->code, //The code to embed the image, video, etc
                "width" => $info->width, //The width of the embed code
                "height" => $info->height, //The height of the embed code
                "aspectRatio" => $info->aspectRatio, //The aspect ratio (width/height)

                "authorName" => $info->authorName, //The resource author
                "authorUrl" => $info->authorUrl, //The author url

                "providerName" => $info->providerName, //The provider name of the page (Youtube, Twitter, Instagram, etc)
                "providerUrl" => $info->providerUrl, //The provider url
                "providerIcons" => $info->providerIcons, //All provider icons found in the page
                "providerIcon" => $info->providerIcon, //The icon choosen as main icon

                "publishedDate" => $info->publishedDate, //The published date of the resource
                "license" => $info->license, //The license url of the resource
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}
