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
        }
        $data = Url::getData($url);
        // enhance data by adding a preview if there is none for the video
        if (empty($data['image']) && !empty($data['type']) && 'video' === $data['type']) {
            $image = ImageService::extractImageFromVideo($data['url'], $this->params->get('binaries.ffmpeg'));
            if (!empty($image) && file_exists($image)) {
                $data['image'] = $filesDir.'/'.Uuid::uuidv4($data['url']);
                rename($image, $data['image']);
            }
        }
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
        // check again if the link was not processed
        // it can happen while processing the link (race condition)
        $doubleLink = $this->em->getRepository(Link::class)->findOneByUrl($url);
        if (empty($doubleLink)) {
            $this->em->persist($link);
            $this->em->flush();
        } else {
            // if there was already a link, use it instead
            $link = $doubleLink;
        }

        return $link;
    }

    public static function getData(string $url): array
    {
        try {
            $info = Embed::create($url);

            return [
                'tags' => $info->tags, //The page keywords (tags)
                'feeds' => $info->feeds, //The RSS/Atom feeds
                'title' => $info->title, //The page title
                'description' => $info->description, //The page description
                'url' => $info->url, //The canonical url
                'type' => $info->type, //The page type (link, video, image, rich)
                'content-type' => $info->getResponse()->getHeader('content-Type'), //The content type of the url

                'images' => $info->images, //List of all images found in the page
                'image' => $info->image, //The image choosen as main image
                'imageWidth' => $info->imageWidth, //The width of the main image
                'imageHeight' => $info->imageHeight, //The height of the main image

                'code' => $info->code, //The code to embed the image, video, etc
                'width' => $info->width, //The width of the embed code
                'height' => $info->height, //The height of the embed code
                'aspectRatio' => $info->aspectRatio, //The aspect ratio (width/height)

                'authorName' => $info->authorName, //The resource author
                'authorUrl' => $info->authorUrl, //The author url

                'providerName' => $info->providerName, //The provider name of the page (Youtube, Twitter, Instagram, etc)
                'providerUrl' => $info->providerUrl, //The provider url
                'providerIcons' => $info->providerIcons, //All provider icons found in the page
                'providerIcon' => $info->providerIcon, //The icon choosen as main icon
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}
