<?php
namespace App\Controller;

use App\Entity\Group;
use App\Entity\Message;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class Groups extends Controller
{
    /**
     * @Route("/groups/{id}/messages", name="group_messages")
     */
    public function index($id): JsonResponse
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $group = $this->getDoctrine()->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(["message" => "Not found"], JsonResponse::HTTP_NOT_FOUND);
        }

        $messages = [];
        foreach($group->getMessages() as $message) {
            if (empty($message->getParent())) {
                $messages[] = $message;
            }
        }

        // sort messages by lastActivityDate
        usort($messages, function($a, $b) {
            if ($a->getLastActivityDate() < $b->getLastActivityDate()) {
                return 1;
            }
            return -1;
        });

        $data = array_map(function($e) {
            return "/api/messages/".$e->getId();
        }, $messages);
        $response = new JSONResponse($data, JSONResponse::HTTP_OK);
        $response->setCache(array(
            "etag"          => md5(json_encode($data)),
            "max_age"       => 0,
            "s_maxage"      => 3600,
            "public"        => true,
        ));
        return $response;
    }
}
