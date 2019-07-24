<?php

namespace App\Controller;

use App\Entity\Group;
use App\Entity\Message;
use App\Service\Cache;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class GroupPage extends Controller
{
    private $em;
    private $newMessage;
    private $cache;

    public function __construct(Cache $cache, EntityManagerInterface $em, NewMessage $newMessage)
    {
        $this->em = $em;
        $this->newMessage = $newMessage;
        $this->cache = $cache;
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

        $cached_item = $this->cache->getItem("$id-$n");
        if (!$cached_item->isHit()) {
            $query = $this->em->createQuery(
                "SELECT m FROM App\Entity\Message m"
                ." WHERE m.group = '" . $group->getId() . "'"
                ." AND m.parent IS NULL"
                ." ORDER BY m.lastActivityDate DESC"
            );
            $query->setMaxResults(30);
            $query->setFirstResult(30 * $n);
            $messages = $query->getResult();

            $query = $this->em->createQuery(
                "SELECT COUNT(m.id) AS totalItems FROM App\Entity\Message m"
                ." WHERE m.group = '" . $group->getId() . "'"
                ." AND m.parent IS NULL"
            );
            $totalItems = $query->getResult();

            $page = [];
            foreach ($messages as $message) {
                $previewUrl = $message->getPreview() ? $message->getPreview()->getId() : "";
				$authorUrl = "";
				if ($message->getAuthor()) {
					$authorUrl = $message->getAuthor()->getId();
					$cached_item->tag($message->getAuthor()->getId());
				}
                $page[] = [
                    "id" => $message->getId(),
                    "entityType" => $message->getEntityType(),
                    "data" => $message->getData(),
                    "author" => $authorUrl,
                    "preview" => $previewUrl,
                    "children" => count($message->getChildren()),
                    "lastActivityDate" => $message->getLastActivityDate()
                ];
            }

            $data = [
                "messages" => $page,
                "totalItems" => $totalItems[0]["totalItems"],
            ];
			$cached_item->tag([
				$message->getId(),
				$group->getId(),
			]);
            $cached_item->set($data);
            $this->cache->save($cached_item);
            $data["cache"] = "MISS";
        } else {
            $data = $cached_item->get();
            $data["cache"] = "HIT";
        }

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
