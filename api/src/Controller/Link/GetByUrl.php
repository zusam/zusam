<?php

namespace App\Controller\Link;

use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\Url as UrlService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

class GetByUrl extends ApiController
{
    private $urlService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlService $urlService
    ) {
        parent::__construct($em, $serializer);
        $this->urlService = $urlService;
    }

    /**
     * @Route("/links/by_url", methods={"POST"})
     * @SWG\Parameter(
     *  name="url",
     *  in="body",
     *  @SWG\Schema(
     *    type="string"
     *  )
     * )
     * @SWG\Parameter(
     *  name="rescan",
     *  in="body",
     *  @SWG\Schema(
     *    type="boolean"
     *  )
     * )
     * @SWG\Parameter(
     *  name="onlyData",
     *  in="body",
     *  @SWG\Schema(
     *    type="boolean"
     *  )
     * )
     * @SWG\Response(
     *  response=200,
     *  description="Get a link by its url",
     *  @SWG\Schema(
     *    type="object",
     *    @SWG\Property(property="id", type="string"),
     *    @SWG\Property(property="data", type="object"),
     *    @SWG\Property(property="url", type="string"),
     *    @SWG\Property(property="updatedAt", type="integer"),
     *    @SWG\Property(
     *      property="preview",
     *      type="object",
     *      @SWG\Property(property="id", type="string"),
     *      @SWG\Property(property="entityType", type="string")
     *    )
     *  )
     * )
     * @SWG\Tag(name="link")
     * @Security(name="api_key")
     */
    public function getLinkByPost(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $data = json_decode($request->getContent(), true);
        $url = $data['url'] ?? '';
        if (!$url) {
            return new JsonResponse(['error' => 'Invalid url'], Response::HTTP_BAD_REQUEST);
        }
        $rescan = $data['rescan'] ?? false;
        $onlyData = $data['onlyData'] ?? false;

        return $this->execute($url, $rescan, $onlyData);
    }

    /**
     * @Route("/links/by_url", methods={"GET"})
     * @SWG\Parameter(
     *  name="url",
     *  in="query",
     *  type="string"
     * )
     * @SWG\Response(
     *  response=200,
     *  description="Get a link by its url",
     *  @SWG\Schema(
     *    type="object",
     *    @SWG\Property(property="id", type="string"),
     *    @SWG\Property(property="data", type="object"),
     *    @SWG\Property(property="url", type="string"),
     *    @SWG\Property(property="updatedAt", type="integer"),
     *    @SWG\Property(
     *      property="preview",
     *      type="object",
     *      @SWG\Property(property="id", type="string"),
     *      @SWG\Property(property="entityType", type="string")
     *    )
     *  )
     * )
     * @SWG\Tag(name="link")
     * @Security(name="api_key")
     */
    public function getLinkByGet(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $url = $request->query->get('url') ?? '';
        if (!$url) {
            return new JsonResponse(['error' => 'Invalid url'], Response::HTTP_BAD_REQUEST);
        }

        return $this->execute(rawurldecode($url));
    }

    private function execute(string $url, bool $rescan = false, bool $onlyData = false): Response
    {
        $data = $this->getLinkData($url, $rescan, $onlyData);
        $response = new JsonResponse($data, Response::HTTP_OK);
        $response->setCache([
            'etag' => md5(json_encode($data)),
            'max_age' => 0,
            's_maxage' => 3600,
            'public' => true,
        ]);

        return $response;
    }

    public function getLinkData(string $url, bool $rescan = false, bool $onlyData = false): array
    {
        $link = $this->urlService->getLink($url, $rescan);
        if (!$onlyData) {
            return [
                'id' => $link->getId(),
                'data' => $link->getData(),
                'url' => $url,
                'updatedAt' => $link->getUpdatedAt(),
                'preview' => $link->getPreview() ? [
                    'id' => $link->getPreview()->getId(),
                    'entityType' => $link->getPreview()->getEntityType(),
                ] : '',
            ];
        } else {
            return json_decode($link->getData(), true);
        }
    }
}
