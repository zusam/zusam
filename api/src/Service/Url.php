<?php

namespace App\Service;

use App\Entity\Link;
use App\Service\Link as LinkService;
use Doctrine\ORM\EntityManagerInterface;
use Embed\Embed;
use GuzzleHttp;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class Url
{
    private $params;
    private $em;
    private $linkService;

    public function __construct(
        EntityManagerInterface $em,
        LinkService $linkService,
        ParameterBagInterface $params,
    ) {
        $this->params = $params;
        $this->em = $em;
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
            $link->setData(['loading' => true]);
        }

        // immediatly persist the link to avoid race conditions
        // and to force saving a link that could throw an unexpected exception
        $this->em->persist($link);
        $this->em->flush();

        return $this->linkService->hydrateLink($link);
    }

    public function getBaseUrl(): string
    {
        $protocol = $this->params->get('protocol');
        $domain = $this->params->get('domain');
        $port = $this->params->get('port');

        return $protocol.'://'.$domain.($port ? ':'.$port : '');
    }

    // taken from https://github.com/guzzle/psr7/blob/089edd38f5b8abba6cb01567c2a8aaa47cec4c72/src/Uri.php#L166
    public static function composeComponents(?string $scheme, ?string $authority, string $path, ?string $query, ?string $fragment): string
    {
        $uri = '';

        // weak type checks to also accept null until we can add scalar type hints
        if ('' != $scheme) {
            $uri .= $scheme.':';
        }

        if ('' != $authority || 'file' === $scheme) {
            $uri .= '//'.$authority;
        }

        $uri .= $path;

        if ('' != $query) {
            $uri .= '?'.$query;
        }

        if ('' != $fragment) {
            $uri .= '#'.$fragment;
        }

        return $uri;
    }

    // some urls are exceptionally modified before being processed
    public static function exceptionRedirect(string $url): string
    {
        // https://github.com/oscarotero/Embed/issues/458
        $url = preg_replace('/^https?:\/\/(www.)?youtube.com\/shorts\//', 'https://youtube.com/watch?v=', $url);

        return preg_replace('/^https?:\/\/(www.)?youtube.com\/embed\//', 'https://youtube.com/watch?v=', $url);
    }

    public static function getInstagramData(string $url): array
    {
        try {
            $client = new GuzzleHttp\Client();
            $res = $client->request('GET', 'https://api.instagram.com/oembed/?url='.$url);
            $data = json_decode($res->getBody(), true);

            return [
                'authorName' => $data['author_name'],
                'authorUrl' => $data['author_url'],
                'code' => $data['html'],
                'description' => $data['title'],
                'thumbnail_url' => $data['thumbnail_url'],
                'image' => $data['thumbnail_url'],
                'origin' => $url,
                'title' => $data['author_name'],
                'providerName' => $data['provider_name'],
                'providerUrl' => $data['provider_url'],
            ];
        } catch (\Exception $e) {
            return [
                'origin' => $url, // The original input url
                'exception' => $e->getMessage(),
            ];
        }
    }

    public static function getEmbedData(string $url): array
    {
        try {
            $embed = new Embed();
            $info = $embed->get(Url::exceptionRedirect($url));

            return [
                'title' => $info->title, // The page title
                'description' => $info->description, // The page description
                'url' => Url::composeComponents( // The canonical url
                    $info->url->getScheme(),
                    $info->url->getAuthority(),
                    $info->url->getPath(),
                    $info->url->getQuery(),
                    $info->url->getFragment(),
                ),
                'keywords' => $info->keywords, // The page keywords (tags)

                'image' => $info->image, // The image choosen as main image

                'code' => $info->code ? $info->code->html : null, // The code to embed the image, video, etc

                'authorName' => $info->authorName, // The resource author
                'authorUrl' => $info->authorUrl, // The author url

                'cms' => $info->cms, // The cms used
                'language' => $info->language, // The language of the page
                'languages' => $info->languages, // The alternative languages

                'providerName' => $info->providerName, // The provider name of the page (Youtube, Twitter, Instagram, etc)
                'providerUrl' => $info->providerUrl, // The provider url
                'icon' => $info->icon, // The big icon of the site
                'favicon' => $info->favicon, // The favicon of the site (an .ico file or a png with up to 32x32px)

                'publishedTime' => $info->publishedTime, // The published time of the resource
                'license' => $info->license, // The license url of the resource
                'feeds' => $info->feeds, // The RSS/Atom feeds
                'content-type' => $info->getResponse()->getHeader('content-Type'), // The content type of the url
                'origin' => $url, // The original input url
            ];
        } catch (\Exception $e) {
            return [
                'origin' => $url, // The original input url
                'exception' => $e->getMessage(),
            ];
        }
    }

    public static function getData(string $url): array
    {
        $data = Url::getEmbedData($url);
        if ('Instagram' == $data['providerName']) {
            $instagramData = Url::getInstagramData($url);
            $data = array_merge($data, $instagramData);
        }

        return $data;
    }
}
