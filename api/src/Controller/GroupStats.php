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

class GroupStats extends Controller
{
    private $em;
    private $newMessage;

    public function __construct(EntityManagerInterface $em, NewMessage $newMessage)
    {
        $this->em = $em;
        $this->newMessage = $newMessage;
    }

    /**
     * @Route("/groups/{id}/stats", name="api_groups_get_stats", methods="get")
     */
    public function index(string $id)
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(["message" => "Group not found"], JsonResponse::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression("user in object.getUsersAsArray()"), $group);

        $totalMessages = $this->em->createQuery(
            "SELECT
                SUM(CASE WHEN m.parent IS NULL THEN 1 ELSE 0 END) parentMessages,
                SUM(CASE WHEN m.parent IS NOT NULL THEN 1 ELSE 0 END) childMessages
            FROM App\Entity\Message m
            WHERE m.group = '" . $group->getId() . "'"
        )->getResult();

        $users = $this->em->createQuery(
            "SELECT
                u.id,
                u.name,
                a.contentUrl AS avatar,
                SUM(CASE WHEN m.parent IS NULL THEN 1 ELSE 0 END) parentMessages,
                SUM(CASE WHEN m.parent IS NOT NULL THEN 1 ELSE 0 END) childMessages
            FROM App\Entity\User u
            JOIN u.avatar AS a
            JOIN u.messages AS m
            JOIN u.groups AS g
            WHERE m.group = '" . $group->getId() . "'
            AND g.id = '" . $group->getId() . "'
            GROUP BY u.id"
        )->getResult();

        $data = [
            "id" => $group->getId(),
            "parentMessages" => $totalMessages[0]["parentMessages"],
            "childMessages" => $totalMessages[0]["childMessages"],
        ];
        $data["users"] = $users;

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
