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

    // SSRF guard: only allow http(s) urls whose host resolves exclusively to
    // public IP addresses. Blocks loopback, private, reserved and link-local
    // ranges (including the cloud metadata address 169.254.169.254).
    //
    // This is a best-effort filter, not a complete SSRF fix. Known gaps:
    // - TOCTOU / DNS rebinding: we resolve and validate the host here, but
    //   the HTTP clients that actually fetch it (GuzzleHttp\Client, Embed)
    //   re-resolve the host independently when they connect. An attacker
    //   controlling DNS for the host (very short TTL) can answer with a
    //   public IP for this check and a private/metadata IP moments later for
    //   the real connection. Fixing this requires pinning the IP validated
    //   here for the actual connection (e.g. curl's CURLOPT_RESOLVE) instead
    //   of trusting a second hostname resolution to agree with the first.
    // - Redirects: this only validates the input url. GuzzleHttp\Client and
    //   Embed both follow redirects by default, and a redirect target is
    //   never re-validated, so a url that is public on the first hop can
    //   still 3xx to a private/metadata address.
    public static function isPublicHttpUrl(?string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        $parts = parse_url($url);
        if (false === $parts || empty($parts['scheme']) || empty($parts['host'])) {
            return false;
        }

        if (!in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
            return false;
        }

        $host = $parts['host'];
        // strip brackets from ipv6 literals (e.g. [::1])
        $host = trim($host, '[]');

        // Resolve the host to every IP it points to and reject if any is non-public.
        $ips = self::resolveHost($host);
        if (empty($ips)) {
            return false;
        }

        foreach ($ips as $ip) {
            if (!self::isPublicIp($ip)) {
                return false;
            }
        }

        return true;
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
        if (!self::isPublicHttpUrl($url)) {
            return [
                'origin' => $url,
                'exception' => 'blocked url',
            ];
        }

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
        if (!self::isPublicHttpUrl($url)) {
            return [
                'origin' => $url,
                'exception' => 'blocked url',
            ];
        }
        $data = Url::getEmbedData($url);
        if ('Instagram' == $data['providerName']) {
            $instagramData = Url::getInstagramData($url);
            $data = array_merge($data, $instagramData);
        }

        return $data;
    }

    // Uses two different resolution mechanisms, which is intentional:
    // gethostbynamel() goes through the system resolver (honors /etc/hosts
    // and NSS), matching what the outbound HTTP client will actually connect
    // to, but PHP has no equivalent of it for AAAA records, so IPv6 falls
    // back to dns_get_record(), which queries DNS directly and ignores
    // /etc/hosts. Either way, this is a point-in-time snapshot: see the
    // TOCTOU/DNS-rebinding note on isPublicHttpUrl() above.
    private static function resolveHost(string $host): array
    {
        // host is already an IP literal
        if (false !== filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        $ips = [];
        $ipv4 = gethostbynamel($host);
        if (is_array($ipv4)) {
            $ips = $ipv4;
        }

        $records = @dns_get_record($host, DNS_AAAA);
        if (is_array($records)) {
            foreach ($records as $record) {
                if (!empty($record['ipv6'])) {
                    $ips[] = $record['ipv6'];
                }
            }
        }

        return $ips;
    }

    private static function isPublicIp(string $ip): bool
    {
        // Reject private and reserved ranges. FILTER_FLAG_NO_RES_RANGE covers
        // loopback (127.0.0.0/8), link-local (169.254.0.0/16) and other reserved
        // blocks; FILTER_FLAG_NO_PRIV_RANGE covers 10/8, 172.16/12, 192.168/16,
        // fc00::/7 and fe80::/10.
        if (false === filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }

        // Explicitly reject IPv6 loopback and IPv4-mapped IPv6 addresses, which
        // the reserved-range flags do not always catch.
        $packed = @inet_pton($ip);
        if (false === $packed) {
            return false;
        }
        if ('::1' === $ip) {
            return false;
        }
        // IPv4-mapped IPv6 (::ffff:a.b.c.d): re-check the embedded IPv4 address.
        if (16 === strlen($packed) && 0 === substr_compare($packed, "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff", 0, 12)) {
            $mapped = inet_ntop(substr($packed, 12));

            return false !== $mapped && self::isPublicIp($mapped);
        }

        return true;
    }
}
