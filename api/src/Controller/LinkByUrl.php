<?php
namespace App\Controller;

use App\Entity\Link;
use App\Service\Url as UrlService;
use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class LinkByUrl extends Controller
{
    private $urlService;

    public function __construct (UrlService $urlService) {
        $this->urlService = $urlService;
    }

    /**
     * @Route("/links/by_url", name="api_links_post_by_url", methods="post")
     */
    public function getLinkByPost(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $url = $data["url"] ?? "";
        if (!$url) {
            return new JsonResponse(["message" => "Invalid url"], JsonResponse::HTTP_BAD_REQUEST);
        }
        $rescan = $data["rescan"] ?? false;
        $onlyData = $data["onlyData"] ?? false;
        return $this->execute($url, $rescan, $onlyData);
    }

    /**
     * @Route("/links/by_url", name="api_links_get_by_url", methods="get")
     */
    public function getLinkByGet(Request $request): JsonResponse
    {
        $url = $request->query->get("url") ?? "";
        if (!$url) {
            return new JsonResponse(["message" => "Invalid url"], JsonResponse::HTTP_BAD_REQUEST);
        }
        return $this->execute(rawurldecode($url));
    }

    private function execute($url, $rescan = false, $onlyData = false): JsonResponse
    {
        $data = $this->getLinkData($url, $rescan, $onlyData);
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }

    public function getLinkData($url, $rescan = false, $onlyData = false): array
    {
        $link = $this->urlService->getLink($url, $rescan);
        if (!$onlyData) {
            return [
                "id" => $link->getId(),
                "data" => $link->getData(),
                "url" => $url,
                "updatedAt" => $link->getUpdatedAt(),
                "preview" => $link->getPreview() ? [
                    "id" => $link->getPreview()->getId(),
                    "entityType" => $link->getPreview()->getEntityType(),
                ]: "",
            ];
        } else {
            return json_decode($link->getData(), true);
        }
    }
}
