<?php

namespace App\Controller\Message;

use App\Entity\Group;
use App\Entity\Link;
use App\Entity\Message;
use App\Service\StringUtils;
use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
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

    /**
     * @Route("/messages/search", methods={"POST"})
     */
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $requestData = json_decode($request->getcontent(), true);

        if (empty($requestData['search']) && empty($requestData['hashtags'])) {
            return new JsonResponse(['error' => 'You must provide search terms'], Response::HTTP_BAD_REQUEST);
        }
        $search_terms = explode(" ", $requestData['search']);
        $hashtags = explode(" ", $requestData['hashtags']);

        $hashtags = array_filter(array_map(function ($h) {
            return empty(trim($h)) ? null : "#$h";
        }, $hashtags));

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
            .' ORDER BY m.id DESC'
        );
        $messages = $query->getResult();

        if (empty($messages)) {
            return new JsonResponse(['error' => 'No Message found'], Response::HTTP_NOT_FOUND);
        }

        $totalItems = 0;
        $page = [];
        $i = 0;
        foreach ($messages as $message) {
            $i++;
            $data = $message->getData();
            $score = 0;
            $termsFound = [];

            if (!empty($data["text"])) {
                foreach(explode(" ", StringUtils::remove_accents($data["text"])) as $word) {
                    foreach ($search_terms as $term) {
                        if ($word == $term) {
                            if(in_array($term, $termsFound)) {
                                $score += 5;
                            } else {
                                $score += 500;
                                $termsFound[] = $term;
                            }
                        } else {
                            if (stripos($word, $term) !== false) {
                                if(in_array($term, $termsFound)) {
                                    $score += 1;
                                } else {
                                    $score += 100;
                                    $termsFound[] = $term;
                                }
                            }
                        }
                    }
                    foreach ($hashtags as $hashtag) {
                        if(!in_array($term, $termsFound)) {
                            $score += 1;
                            $termsFound[] = $term;
                        }
                    }
                }
            }

            if (!empty($data["title"])) {
                foreach(explode(" ", StringUtils::remove_accents($data["title"])) as $word) {
                    foreach ($search_terms as $term) {
                        if (stripos($word, $term) !== false) {
                            if(in_array($term, $termsFound)) {
                                $score += 1;
                            } else {
                                $score += 150;
                                $termsFound[] = $term;
                            }
                        }
                    }
                }
            }

            $message_links = $message->getUrls();
            if (!empty($message_links)) {
                $link = $this->em->getRepository(Link::class)->findOneByUrl($message_links[0]);
                if (!empty($link)) {
                    $link_data = $link->getData();
                    if (!empty($link_data)) {
                        if (!empty($link_data["tags"])) {
                            foreach($link_data["tags"] as $tag) {
                                foreach ($search_terms as $term) {
                                    if (stripos($tag, $term) !== false) {
                                        if(in_array($term, $termsFound)) {
                                            $score += 1;
                                        } else {
                                            $score += 50;
                                            $termsFound[] = $term;
                                        }
                                    }
                                }
                            }
                        }
                        if (!empty($link_data["title"])) {
                            foreach(explode(" ", StringUtils::remove_accents($link_data["title"])) as $word) {
                                foreach ($search_terms as $term) {
                                    if (stripos($word, $term) !== false) {
                                        if(in_array($term, $termsFound)) {
                                            $score += 1;
                                        } else {
                                            $score += 50;
                                            $termsFound[] = $term;
                                        }
                                    }
                                }
                            }
                        }
                        if (!empty($link_data["description"])) {
                            foreach(explode(" ", StringUtils::remove_accents($link_data["description"])) as $word) {
                                foreach ($search_terms as $term) {
                                    if (stripos($word, $term) !== false) {
                                        if(in_array($term, $termsFound)) {
                                            $score += 1;
                                        } else {
                                            $score += 50;
                                            $termsFound[] = $term;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if ($score < 1) {
                continue;
            }

            $totalItems++;
            $previewId = $message->getPreview() ? $message->getPreview()->getId() : '';
            $authorId = $message->getAuthor() ? $message->getAuthor()->getId() : '';
            $parentId = $message->getParent() ? $message->getParent()->getId() : '';
            $page[] = [
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

        usort($page, function ($a, $b) {
            if ($a['score'] < $b['score']) {
                return 1;
            }
            if ($a['score'] > $b['score']) {
                return -1;
            }
            return $a['lastActivityDate'] < $b['lastActivityDate'];
        });

        // limit returned results
        $page = array_slice($page, 0, 100);

        $data = [
            'messages' => $page,
            'totalItems' => $totalItems,
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
