<?php

namespace App\Service;

use App\Entity\File;
use App\Entity\Link;
use App\Service\Image as ImageService;
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
  private $security;

  public function __construct(
    EntityManagerInterface $em,
    ImageService $imageService,
    ParameterBagInterface $params,
    Security $security
  ) {
    $this->params = $params;
    $this->em = $em;
    $this->imageService = $imageService;
    $this->security = $security;
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

    $data = Url::getData($url);
    $data["loading"] = false;
    $link->setData($data);
    $link->setUpdatedAt(time());
    if (!empty($data['image'])) {
      try {
        $preview = new File();
        $preview->setType('image/jpeg');
        $preview->setContentUrl($preview->getId().'.jpg');
        $this->imageService->createThumbnail($data['image'], $filesDir.'/'.$preview->getContentUrl(), 2048, 2048);
        $preview->setSize(filesize($filesDir.'/'.$preview->getContentUrl()));
        $link->setPreview($preview);
        $this->em->persist($preview);
      } catch (\Exception $e) {
        // Something went wrong. What should we do ?
        // TODO
      }
    }
    $this->em->persist($link);
    $this->em->flush();

    return $link;
  }

  public static function getData(string $url): array
  {
    try {
      $embed = new Embed();
      $info = $embed->get($url);

      return [
        'title' => $info->title, //The page title
        'description' => $info->description, //The page description
        'url' => "" //The canonical url
          .$info->url->getScheme()
          .$info->url->getAuthority()
          .$info->url->getPath()
          .$info->url->getQuery()
          .$info->url->getFragment(),
        'keywords' => $info->keywords, //The page keywords (tags)

        'image' => $info->image, //The image choosen as main image

        'code' => $info->code->html, //The code to embed the image, video, etc

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
