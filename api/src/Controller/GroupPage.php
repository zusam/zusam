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

        // filter out children messages
        $messages = array_filter($group->getMessages()->getValues(), function($m) {
            return $m->getParent() == null;
        });

        // sort by lastActivityDate
        usort($messages, function($m1, $m2) {
            return $m1->getLastActivityDate() > $m2->getLastActivityDate() ? -1 : 1;
        });

        // prepare page "n" (with max 30 items)
        $page = [];
        for ($i = 0; $i + $n * 30 < count($messages) && $i < 30; $i++) {
            $preview = $messages[30 * $n + $i]->getPreview();
            $page[] = [
                "@id" => "/api/messages/" . $messages[30 * $n + $i]->getId(),
                "id" => $messages[30 * $n + $i]->getId(),
                "data" => $messages[30 * $n + $i]->getData(),
                "author" => "/api/users/" . $messages[30 * $n + $i]->getAuthor()->getId(),
                "preview" => $preview ? "/api/files/" . $preview->getContentUrl() : "",
                "children" => count($messages[30 * $n + $i]->getChildren()),
                "lastActivityDate" => $messages[30 * $n + $i]->getLastActivityDate()
            ];
        }
        return new JsonResponse([
            "messages" => $page,
            "totalItems" => count($messages),
        ], JsonResponse::HTTP_OK);
    }
}
