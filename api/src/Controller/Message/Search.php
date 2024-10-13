<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Link;
use App\Entity\Message;
use App\Service\StringUtils;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Search extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    public static function has_term($terms, $text): bool
    {
        if (empty($text) || empty($terms)) {
            return false;
        }
        foreach ($terms as $term) {
            if (
                !empty($term)
                && mb_strlen($term) > 2
                && false !== mb_stripos($text, $term, 0, 'UTF-8')
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @OA\Parameter(
     *  name="data",
     *  in="body",
     *
     *  @OA\Schema(
     *    type="object",
     *
     *    @OA\Property(property="search", type="string"),
     *    @OA\Property(property="group", type="string")
     *  )
     * )
     *
     * @OA\Response(
     *  response=200,
     *  description="Search for a message",
     *
     *  @OA\JsonContent(
     *    type="object",
     *
     *    @OA\Property(
     *      property="messages",
     *      type="array",
     *
     *      @OA\Items(
     *        type="object",
     *
     *        @OA\Property(property="id", type="string"),
     *        @OA\Property(property="entityType", type="string"),
     *        @OA\Property(property="data", type="object"),
     *        @OA\Property(property="author", type="string"),
     *        @OA\Property(property="preview", type="string"),
     *        @OA\Property(property="parent", type="string"),
     *        @OA\Property(property="children", type="integer"),
     *        @OA\Property(property="lastActivityDate", type="integer"),
     *        @OA\Property(property="score", type="integer")
     *      )
     *    ),
     *    @OA\Property(property="totalItems", type="integer"),
     *    @OA\Property(property="searchTerms", type="string")
     *  )
     * )
     *
     * @OA\Tag(name="message")
     *
     * @Security(name="api_key")
     */
    #[Route('/messages/search', methods: ['POST'])]
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $requestData = json_decode($request->getContent(), true);

        if (empty($requestData['search'])) {
            return new JsonResponse(['error' => 'You must provide search terms'], Response::HTTP_BAD_REQUEST);
        }
        $search_terms = explode('+', $requestData['search']);

        // get the asked group
        if (empty($requestData['group'])) {
            return new JsonResponse(['error' => 'You must give a group id'], Response::HTTP_BAD_REQUEST);
        }
        $group = $this->em->getRepository(Group::class)->findOneById($requestData['group']);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Group not found'], Response::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $query = $this->em->createQuery(
            "SELECT m FROM App\Entity\Message m"
            ." WHERE m.group = '".$group->getId()."'"
        );
        $messages = $query->iterate();

        // flatten the search terms before starting the search
        $flattened_search_terms = array_map(function ($e) {
            return StringUtils::remove_accents($e);
        }, $search_terms);

        $totalItems = 0;
        $results = [];
        $i = 0;
        foreach ($messages as $row) {
            $message = $row[0];
            ++$i;
            $data = $message->getData();
            $score = 0;

            if (isset($data['text']) && self::has_term($flattened_search_terms, $data['text'])) {
                $score += 100;
            }

            if (isset($data['title']) && self::has_term($flattened_search_terms, $data['title'])) {
                $score += 150;
            }

            try {
                if (
                    !is_null($message->getAuthor())
                    && !is_null($message->getAuthor()->getId())
                    && self::has_term($flattened_search_terms, $message->getAuthor()->getName())
                ) {
                    $score += 50;
                }
            } catch (\Doctrine\ORM\EntityNotFoundException $e) {
                // Just continue without adding anything to the score
                // This try/catch is necessary because doctrine uses proxy classes
                // https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/advanced-configuration.html#proxy-objects
            }

            $message_links = $message->getUrls();
            if (!empty($message_links)) {
                $link = $this->em->getRepository(Link::class)->findOneByUrl($message_links[0]);
                if (!empty($link)) {
                    $link_data = $link->getData();
                    if (!empty($link_data)) {
                        // TODO: remove the evaluation for "tags" since this has only an effect for links generated before zusam 0.5
                        if (isset($link_data['tags']) && self::has_term($flattened_search_terms, implode(' ', $link_data['tags']))) {
                            $score += 25;
                        }
                        if (isset($link_data['keywords']) && self::has_term($flattened_search_terms, implode(' ', $link_data['keywords']))) {
                            $score += 25;
                        }
                        if (isset($link_data['title']) && self::has_term($flattened_search_terms, $link_data['title'])) {
                            $score += 30;
                        }
                        if (isset($link_data['description']) && self::has_term($flattened_search_terms, $link_data['description'])) {
                            $score += 20;
                        }
                    }
                    // detach from Doctrine, so that it can be Garbage-Collected immediately
                    $this->em->detach($link);
                }
            }

            if ($score > 0) {
                ++$totalItems;
                $previewId = $message->getPreview() ? $message->getPreview()->getId() : '';
                $authorId = $message->getAuthor() ? $message->getAuthor()->getId() : '';
                $parentId = $message->getParent() ? $message->getParent()->getId() : '';
                // check if the parent exists
                if (null == $this->em->getRepository(Message::class)->findOneById($parentId)) {
                    $parentId = '';
                }
                $results[] = [
                    'id' => $message->getId(),
                    'entityType' => $message->getEntityType(),
                    'data' => $message->getData(),
                    'author' => $authorId,
                    'preview' => $previewId,
                    'parent' => $parentId,
                    'children' => count($message->getChildren()),
                    'lastActivityDate' => $message->getLastActivityDate(),
                    'score' => $score,
                ];
            }

            // detach from Doctrine, so that it can be Garbage-Collected immediately
            $this->em->detach($row[0]);
        }

        usort($results, function ($a, $b) {
            if ($a['score'] < $b['score']) {
                return 1;
            }
            if ($a['score'] > $b['score']) {
                return -1;
            }

            return $a['lastActivityDate'] < $b['lastActivityDate'];
        });

        // limit returned results
        $results = array_slice($results, 0, 100);

        $data = [
            'messages' => $results,
            'totalItems' => $totalItems,
            'searchterms' => $search_terms,
        ];
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);
        $response->setCache([
            'etag' => md5(json_encode($data)),
            'max_age' => 0,
            's_maxage' => 3600,
            'public' => true,
        ]);

        return $response;
    }
}
