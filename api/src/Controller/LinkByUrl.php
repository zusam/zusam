<?php
namespace App\Controller;

use App\Entity\File;
use App\Entity\Link;
use App\Service\Uuid;
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
	private $ffmpegPath;

    public function __construct(EntityManagerInterface $em, ImageService $imageService, $binaries)
    {
        $this->em = $em;
        $this->imageService = $imageService;
		$this->ffmpegPath = $binaries["ffmpeg"];
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
        $data = $this->getLinkData($url, realpath($this->getParameter("dir.files")), $rescan, $onlyData);
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }

    public function getLinkData($url, $filesDir, $rescan = false, $onlyData = false): array
    {
        $link = $this->em->getRepository(Link::class)->findOneByUrl($url);
        if (empty($link) || $rescan) {
            if (empty($link)) {
                $link = new Link($url);
            }
            $data = Url::getData($url);
            // enhance data by adding a preview if there is none for the video
            if (empty($data["image"]) && !empty($data["type"]) && $data["type"] === "video") {
                $image = ImageService::extractImageFromVideo($data["url"], $this->ffmpegPath);
                $data["image"] = $filesDir."/".Uuid::uuidv4($data["url"]);
                rename($image, $data["image"]);
            }
            $link->setData(json_encode($data));
            $link->setUpdatedAt(time());
            if (!empty($data["image"])) {
                try {
                    $preview = new File();
                    $preview->setType("image/jpeg");
                    $preview->setContentUrl($preview->getId().".jpg");
                    $this->imageService->createThumbnail($data["image"], $filesDir."/".$preview->getContentUrl(), 2048, 2048);
                    $preview->setSize(filesize($filesDir."/".$preview->getContentUrl()));
                    $link->setPreview($preview);
                    $this->em->persist($preview);
                } catch(\Exception $e) {
                    // Something went wrong. What should we do ?
                    // TODO
                }
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
                "preview" => $link->getPreview() ? "/files/".$link->getPreview()->getContentUrl() : "",
            ];
        } else {
            return json_decode($link->getData(), true);
        }
    }
}
