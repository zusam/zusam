<?php
namespace App\Controller;

use App\Entity\Message;
use App\Controller\LinkByUrl;
use App\Service\Image as ImageService;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MessagePreview extends Controller
{
    /**
     * @Route("/message-previews/{id}", name="message-previews")
     */
    public function index(string $id, LinkByUrl $linkByUrl, ImageService $imageService): JsonResponse
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $message = $this->getDoctrine()->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JSONResponse(["message" => "Message not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $msgData = $message->getData(true);
        $text = $msgData["text"] ?? "";
        $title = $msgData["title"] ?? "";
        preg_match_all("/https?:\/\/[^\s]+/", $text, $matches);
        $url = count($matches[0]) ? $matches[0][0] : "";
        if (count($message->getFiles()) > 0) {
            $preview = $message->getFiles()->first()->getPath();
        } else {
            $link = $linkByUrl->getLinkData($url, false, false, $imageService);
            $preview = $link["preview"];
        }
        $data = [
            "@id" => "/api/message-previews/".$id,
            "author" => [
                "avatar" => $message->getAuthor()->getAvatar()->getPath(),
            ],
            "preview" => $preview,
            "lastActivityDate" => $message->getLastActivityDate(),
            "title" => $title,
            "children_count" => count($message->getChildren()),
        ];
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }
}
