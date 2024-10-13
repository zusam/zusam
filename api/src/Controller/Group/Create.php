<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\User;
use App\Service\Group as GroupService;
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
    private $groupService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        GroupService $groupService,
    ) {
        parent::__construct($em, $serializer);
        $this->groupService = $groupService;
    }

    /**
     * @Route("/groups", methods={"POST"})
     *
     * @OA\RequestBody(
     *
     *  @OA\Schema(
     *    type="object",
     *
     *    @OA\Property(
     *      property="name",
     *      type="string"
     *    ),
     *  )
     * )
     *
     * @OA\Response(
     *  response=201,
     *  description="Create a group",
     *
     *  @Model(type=App\Entity\Group::class, groups={"read_group"})
     * )
     *
     * @OA\Tag(name="group")
     *
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

        $group = $this->groupService->create($requestData['name'], $currentUser);

        return new Response(
            $this->serialize($group, ['read_group']),
            Response::HTTP_OK
        );
    }
}
