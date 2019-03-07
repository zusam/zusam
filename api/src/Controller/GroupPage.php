<?php

namespace App\Controller;

use App\Entity\Group;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\ExpressionLanguage\Expression;

class GroupPage extends Controller
{
    private $em;
    private $newMessage;

    public function __construct(EntityManagerInterface $em, NewMessage $newMessage)
    {
        $this->em = $em;
        $this->newMessage = $newMessage;
    }

    /**
     * @Route("/groups/{id}/page/{n}", name="api_groups_get_page", methods="get")
     */
    public function index(string $id, int $n)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(["message" => "Group not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $group);

        // remove group from the news of the requesting user
        $user = $this->getUser();
        $user->removeNews($group->getId());
        $this->em->persist($user);
        $this->em->flush();

        $query = $this->em->createQuery(
            "SELECT m FROM App\Entity\Message m"
            ." WHERE m.group = '" . $group->getId() . "'"
            ." AND m.parent IS NULL"
            ." ORDER BY m.lastActivityDate DESC"
        );
        $query->setMaxResults(30);
        $query->setFirstResult(30 * $n);
        $messages = $query->getResult();

        $page = [];
        foreach ($messages as $message) {
            $preview = $message->getPreview();
            $page[] = [
                "@id" => "/api/messages/" . $message->getId(),
                "id" => $message->getId(),
                "data" => $message->getData(),
                "author" => "/api/users/" . $message->getAuthor()->getId(),
                "preview" => $preview ? "/api/files/" . $preview->getContentUrl() : "",
                "children" => count($message->getChildren()),
                "lastActivityDate" => $message->getLastActivityDate()
            ];
        }

        $data = [
            "messages" => $page,
            "totalItems" => count($messages),
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
