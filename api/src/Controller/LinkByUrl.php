<?php
namespace App\Controller;

use App\Entity\File;
use App\Entity\Link;
use App\Service\Image as ImageService;
use App\Service\Url;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class LinkByUrl extends Controller
{

    private $em;
    private $imageService;

    public function __construct(EntityManagerInterface $em, ImageService $imageService)
    {
        $this->em = $em;
        $this->imageService = $imageService;
    }

    /**
     * @Route("/links/by_url", name="api_links_post_by_url", methods="post")
     */
    public function getLinkByPost(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
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
        $this->denyAccessUnlessGranted("ROLE_USER");
        $url = $request->query->get("url") ?? "";
        if (!$url) {
            return new JsonResponse(["message" => "Invalid url"], JsonResponse::HTTP_BAD_REQUEST);
        }
        return $this->execute(rawurldecode($url));
    }

    private function execute($url, $rescan = false, $onlyData = false): JsonResponse
    {
        $data = $this->getLinkData($url, realpath($this->getParameter("dir.public")), $rescan, $onlyData);
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }

    public function getLinkData($url, $publicDir, $rescan = false, $onlyData = false): array
    {
        $link = $this->em->getRepository(Link::class)->findOneByUrl($url);
        if (empty($link) || $rescan) {
            if (empty($link)) {
                $link = new Link($url);
            }
            $data = Url::getData($url);
            $link->setData(json_encode($data));
            $link->setUpdatedAt(time());
            if (!empty($data["image"])) {
                $preview = new File();
                $preview->setType("image/jpeg");
                $preview->setContentUrl($preview->getId().".jpg");
                $this->imageService->createThumbnail($data["image"], $publicDir."/".$preview->getPath(), 2048, 2048);
                $preview->setSize(filesize($publicDir.$preview->getPath()));
                $link->setPreview($preview);
                $this->em->persist($preview);
            }
            $this->em->persist($link);
            $this->em->flush();
        }
        if (!$onlyData) {
            return [
                "id" => "/api/links/".$link->getId(),
                "data" => $link->getData(),
                "url" => $url,
                "updatedAt" => $link->getUpdatedAt(),
                "preview" => $link->getPreview() ? $link->getPreview()->getPath() : "",
            ];
        } else {
            return json_decode($link->getData(), true);
        }
    }
}
