<?php

namespace App\Controller\Bookmark;

use App\Controller\ApiController;
use App\Entity\Bookmark;
use App\Entity\User;
use App\Entity\Message;
use App\Service\Bookmark as BookmarkService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Create extends ApiController
{
    private $bookmarkService;

    public function __construct(
        BookmarkService $bookmarkService,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
    ) {
        parent::__construct($em, $serializer);
        $this->bookmarkService = $bookmarkService;
    }

    /**
     * @Route("/bookmarks", methods={"POST"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(
     *      property="message",
     *      type="string"
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=201,
     *  description="Create a bookmark",
     *  @Model(type=App\Entity\Bookmark::class, groups={"read_bookmark"})
     * )
     * @OA\Tag(name="bookmark")
     * @Security(name="api_key")
     */
    public function index(
        Request $request,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $requestData = json_decode($request->getcontent(), true);
        if (empty($requestData)) {
            return new JsonResponse(
                ['error' => 'Bad Request'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $messageEntity = $this->em->getRepository(Message::class)->findOneById($requestData['message']);

        $bookmark = $this->bookmarkService->create($currentUser, $messageEntity);
        $this->em->persist($bookmark);

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);

        $this->em->flush();

        return new Response(
            $this->serialize($bookmark, ['read_bookmark']),
            Response::HTTP_OK
        );
    }
}
