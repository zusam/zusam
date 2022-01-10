<?php

namespace App\Service;

use App\Entity\File;
use App\Entity\Link;
use App\Service\Image as ImageService;
use App\Service\Link as LinkService;
use Doctrine\ORM\EntityManagerInterface;
use Embed\Embed;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class Url
{
  private $params;
  private $em;
  private $imageService;
  private $linkService;

  public function __construct(
    EntityManagerInterface $em,
    ImageService $imageService,
    ParameterBagInterface $params,
    LinkService $linkService,
  ) {
    $this->params = $params;
    $this->em = $em;
    $this->imageService = $imageService;
    $this->linkService = $linkService;
  }

  public function getPreview($url, $rescan = false): ?string
  {
    $link = $this->getLink($url);
    if ($link) {
      return $link->getPreview() ? '/files/'.$link->getPreview()->getContentUrl() : null;
    }

    return null;
  }

  public function getLink($url, $rescan = false): ?Link
  {
    $filesDir = realpath($this->params->get('dir.files'));
    $link = $this->em->getRepository(Link::class)->findOneByUrl($url);
    if (!empty($link) && !$rescan) {
      return $link;
    }
    if (empty($link)) {
      $link = new Link($url);
      $link->setData(["loading" => true]);
    }

    // immediatly persist the link to avoid race conditions
    // and to force saving a link that could throw an unexpected exception
    $this->em->persist($link);
    $this->em->flush();

    return $this->linkService->hydrateLink($link);
  }

  // taken from https://github.com/guzzle/psr7/blob/089edd38f5b8abba6cb01567c2a8aaa47cec4c72/src/Uri.php#L166
  public static function composeComponents(?string $scheme, ?string $authority, string $path, ?string $query, ?string $fragment): string
  {
    $uri = '';

    // weak type checks to also accept null until we can add scalar type hints
    if ($scheme != '') {
      $uri .= $scheme . ':';
    }

    if ($authority != ''|| $scheme === 'file') {
      $uri .= '//' . $authority;
    }

    $uri .= $path;

    if ($query != '') {
      $uri .= '?' . $query;
    }

    if ($fragment != '') {
      $uri .= '#' . $fragment;
    }

    return $uri;
  }

  // some urls are exceptionally modified before being processed
  public static function exceptionRedirect(string $url): string
  {
    // https://github.com/oscarotero/Embed/issues/458
    $url = preg_replace("/^https?:\/\/youtube.com\/shorts\//", "https://youtube.com/watch?v=", $url);
    return $url;
  }

  public static function getData(string $url): array
  {
    try {
      $embed = new Embed();
      $info = $embed->get(Url::exceptionRedirect($url));

      return [
        'title' => $info->title, //The page title
        'description' => $info->description, //The page description
        'url' => Url::composeComponents( //The canonical url
          $info->url->getScheme(),
          $info->url->getAuthority(),
          $info->url->getPath(),
          $info->url->getQuery(),
          $info->url->getFragment(),
        ),
        'keywords' => $info->keywords, //The page keywords (tags)

        'image' => $info->image, //The image choosen as main image

        'code' => $info->code ? $info->code->html : null, //The code to embed the image, video, etc

        'authorName' => $info->authorName, //The resource author
        'authorUrl' => $info->authorUrl, //The author url

        'cms' => $info->cms, //The cms used
        'language' => $info->language, //The language of the page
        'languages' => $info->languages, //The alternative languages

        'providerName' => $info->providerName, //The provider name of the page (Youtube, Twitter, Instagram, etc)
        'providerUrl' => $info->providerUrl, //The provider url
        'icon' => $info->icon, //The big icon of the site
        'favicon' => $info->favicon, //The favicon of the site (an .ico file or a png with up to 32x32px)

        'publishedTime' => $info->publishedTime, //The published time of the resource
        'license' => $info->license, //The license url of the resource
        'feeds' => $info->feeds, //The RSS/Atom feeds
        'content-type' => $info->getResponse()->getHeader('content-Type'), //The content type of the url
        'origin' => $url, //The original input url
      ];
    } catch (\Exception $e) {
      return [
        'origin' => $url, //The original input url
        'exception' => $e->getMessage(),
      ];
    }
  }
}
