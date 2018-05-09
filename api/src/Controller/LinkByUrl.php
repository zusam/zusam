<?php
namespace App\Controller;

use App\Entity\Link;
use App\Service\Url;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class LinkByUrl extends Controller
{
    /**
     * @Route("/links/by_url", name="api_links_post_by_url")
     */
    public function index(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $url = $data["url"] ?? "";
        $rescan = $data["rescan"] ?? false;
        $em = $this->getDoctrine()->getManager();
        $link = $this->getDoctrine()->getRepository(Link::class)->findOneByUrl($url);
        if (empty($link) || $rescan) {
            if (empty($link)) {
                $link = new Link($url);
            }
            $data = Url::getData($url);
            $link->setData(json_encode($data));
            $link->setUpdatedAt(time());
            $em->persist($link);
            $em->flush();
        }
        return new JsonResponse([
            "id" => "/api/links/".$link->getId(),
            "data" => json_encode($link->getData()),
            "url" => $url,
            "updatedAt" => $link->getUpdatedAt(),
        ], JsonResponse::HTTP_OK);
    }
}
