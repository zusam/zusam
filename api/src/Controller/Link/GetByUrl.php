<?php
namespace App\Controller\Link;

use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Link;
use App\Service\Url as UrlService;
use App\Service\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class GetByUrl extends ApiController
{
    private $urlService;

    public function __construct (
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlService $urlService
    ) {
        parent::__construct($em, $serializer);
        $this->urlService = $urlService;
    }

    /**
     * @Route("/links/by_url", methods={"POST"})
     */
    public function getLinkByPost(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $url = $data["url"] ?? "";
        if (!$url) {
            return new JsonResponse(["error" => "Invalid url"], Response::HTTP_BAD_REQUEST);
        }
        $rescan = $data["rescan"] ?? false;
        $onlyData = $data["onlyData"] ?? false;
        return $this->execute($url, $rescan, $onlyData);
    }

    /**
     * @Route("/links/by_url", methods={"GET", "HEAD"})
     */
    public function getLinkByGet(Request $request): Response
    {
        $url = $request->query->get("url") ?? "";
        if (!$url) {
            return new JsonResponse(["error" => "Invalid url"], Response::HTTP_BAD_REQUEST);
        }
        return $this->execute(rawurldecode($url));
    }

    private function execute(string $url, bool $rescan = false, bool $onlyData = false): Response
    {
        $data = $this->getLinkData($url, $rescan, $onlyData);
        $response = new JsonResponse($data, Response::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }

    public function getLinkData(string $url, bool $rescan = false, bool $onlyData = false): array
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
