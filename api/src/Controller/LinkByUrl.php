<?php
namespace App\Controller;

use App\Entity\Link;
use App\Entity\File;
use App\Service\Url;
use App\Service\Image as ImageService;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class LinkByUrl extends Controller
{
    /**
     * @Route("/links/by_url", name="api_links_post_by_url")
     */
    public function index(Request $request, ImageService $imageService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $url = $data["url"] ?? "";
		if (!$url) {
            return new JsonResponse(["message" => "Invalid url"], JsonResponse::HTTP_BAD_REQUEST);
		}
        $rescan = $data["rescan"] ?? false;
        $onlyData = $data["onlyData"] ?? false;
        $em = $this->getDoctrine()->getManager();
        $link = $this->getDoctrine()->getRepository(Link::class)->findOneByUrl($url);
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
                $preview->setExtension(".jpg");
                $publicDir = realpath($this->getParameter("kernel.project_dir")."/../public/");
                $imageService->createThumbnail($data["image"], $publicDir."/".$preview->getPath(), 2048, 2048);
                $link->setPreview($preview);
                $em->persist($preview);
            }
            $em->persist($link);
            $em->flush();
        }
        if (!$onlyData) {
            return new JsonResponse([
                "id" => "/api/links/".$link->getId(),
                "data" => $link->getData(),
                "url" => $url,
                "updatedAt" => $link->getUpdatedAt(),
                "preview" => $link->getPreview() ? $link->getPreview()->getPath() : "",
            ], JsonResponse::HTTP_OK);
        } else {
            return new JsonResponse(json_decode($link->getData(), true), JsonResponse::HTTP_OK);
        }
    }
}
