<?php

namespace App\Controller;

use App\Controller\LinkByUrl;
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
    private $linkByUrl;

    public function __construct(EntityManagerInterface $em, LinkByUrl $linkByUrl)
    {
        $this->em = $em;
        $this->linkByUrl = $linkByUrl;
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
            $page[] = [
                "@id" => "/api/messages/" . $messages[30 * $n + $i]->getId(),
                "id" => $messages[30 * $n + $i]->getId(),
                "data" => $messages[30 * $n + $i]->getData(),
                "author" => "/api/users/" . $messages[30 * $n + $i]->getAuthor()->getId(),
                "preview" => $this->genPreview($messages[30 * $n + $i]),
                "children" => count($messages[30 * $n + $i]->getChildren()),
                "lastActivityDate" => $messages[30 * $n + $i]->getLastActivityDate()
            ];
        }
        return new JsonResponse([
            "messages" => $page,
            "totalItems" => count($messages),
        ], JsonResponse::HTTP_OK);
    }

    public function genPreview(Message $message): ?string
    {
        // get preview with files
        if (count($message->getFiles()) > 0) {
            $firstFile = null;
            foreach($message->getFiles() as $file) {
                if (!$firstFile || $file->getFileIndex() < $firstFile->getFileIndex()) {
                    $firstFile = $file;
                }
            }
            return $firstFile ? "/files/".$firstFile->getContentUrl() : null;
        }
        // if no files, search for preview in text
        $text = $message->getData(true)["text"];
        preg_match("/https?:\/\/[^\s]+/", $text, $links);
        if (!empty($links) && !empty($links[0])) {
            $e = $this->linkByUrl->getLinkData($links[0], realpath($this->getParameter("dir.files")), false, false);
            return empty($e["preview"]) ? null : $e["preview"];
        }
        return null;
    }
}
