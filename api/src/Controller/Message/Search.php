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
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

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
                && mb_stripos($text, $term, 0, 'UTF-8') !== false
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * @Route("/messages/search", methods={"POST"})
     * @OA\Parameter(
     *  name="data",
     *  in="body",
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(property="search", type="string"),
     *    @OA\Property(property="group", type="string")
     *  )
     * )
     * @OA\Response(
     *  response=200,
     *  description="Search for a message",
     *  @OA\JsonContent(
     *    type="object",
     *    @OA\Property(
     *      property="messages",
     *      type="array",
     *      @OA\Items(
     *        type="object",
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
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $requestData = json_decode($request->getContent(), true);

        if (empty($requestData['search'])) {
            return new JsonResponse(['error' => 'You must provide search terms'], Response::HTTP_BAD_REQUEST);
        }
        $search_terms = explode("+", $requestData['search']);

        // get the asked group
        if (empty($requestData['group'])) {
            return new JsonResponse(['error' => 'You must give a group id'], Response::HTTP_BAD_REQUEST);
        }
        $group = $this->em->getRepository(Group::class)->findOneById($requestData['group']);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Group not found'], Response::HTTP_NOT_FOUND);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        // Create search query

        $qb = $this->em->createQueryBuilder();
        $qb->select('m')
           ->from('App\Entity\Message', 'm')
           ->leftJoin('m.author', 'a')
           ->where('m.group = :groupId')
           ->andWhere('m.createdAt > :minTimestamp')
           ->setMaxResults(20);

        $parameters = [
            'groupId' => $group->getId(),
            'minTimestamp' => time() - 3600 * 24 * 30 * 600, // only look for messages in the last 6 months
        ];

        // flatten the search terms (and de-duplicate them) before starting the search
        // also remove less than 3 letter terms
        $flattened_search_terms = array_filter(array_unique(array_map(function ($e) {
            return StringUtils::remove_accents($e);
        }, $search_terms)), function ($term) {
            return mb_strlen($term);
        });

        // Add a select expression to count the number of search terms that each message contains
        $selectExpression = '';
        foreach ($flattened_search_terms as $key => $term) {
            // $selectExpression .= "CASE WHEN JSON_EXTRACT(m.data, '$.text') LIKE :term{$key} THEN 2 ELSE 0 END + ";
            // $selectExpression .= "CASE WHEN JSON_EXTRACT(m.data, '$.title') LIKE :term{$key} THEN 4 ELSE 0 END + ";
            $selectExpression .= "CASE WHEN m.data LIKE :term{$key} THEN 2 ELSE 0 END + ";
            $selectExpression .= "CASE WHEN a.name LIKE :term{$key} THEN 1 ELSE 0 END + ";
            $parameters["term{$key}"] = '%'.$term.'%';
        }
        $selectExpression = rtrim($selectExpression, ' + ');

        // Calculate the total number of matches for each message
        $qb->addSelect('(' . $selectExpression . ') as HIDDEN score')->andWhere('score > 0') ;

        // Sort the results by the total number of matches for each message
        $qb->orderBy('score', 'DESC');

        $qb->setParameters($parameters);

        $messages = $qb->getQuery()->getResult();

        $data = [
            'messages' => $this->normalize($messages),
            'totalItems' => count($messages),
            'searchterms' => $search_terms,
        ];
        $response = new JsonResponse($data, JsonResponse::HTTP_OK);

        return $response;
    }
}
