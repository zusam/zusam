<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\File;
use App\Entity\Message;
use App\Entity\User;
use App\Service\Message as MessageService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class Edit extends ApiController
{
    private $messageService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        MessageService $messageService
    ) {
        parent::__construct($em, $serializer);
        $this->messageService = $messageService;
    }

    /**
     * @Route("/messages/{id}", methods={"PUT"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(property="text", type="string"),
     *    @OA\Property(property="title", type="string"),
     *    @OA\Property(
     *      property="files",
     *      type="array",
     *      @OA\Items(
     *        type="string",
     *      )
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=200,
     *  description="Modify a bookmark",
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(
        string $id,
        Request $request,
        #[CurrentUser] User $currentUser
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $message->getAuthor());

        $requestData = json_decode($request->getcontent(), true);
        if (!empty($requestData['data'])) {
            $message->setData($requestData['data']);
        }
        if (!empty($requestData['isInFront'])) {
            $message->setIsInFront($requestData['isInFront']);
        }
        if (!empty($requestData['lastActivityDate'])) {
            $message->setLastActivityDate($requestData['lastActivityDate']);
        }

        $message->setFiles(new ArrayCollection(array_map(function ($fid) {
            return $this->em->getRepository(File::class)->findOneById($fid);
        }, $requestData['files'] ?? [])));

        // Set file order
        if (!empty($requestData['files'])) {
            foreach ($requestData['files'] as $key => $fid) {
                $file = $this->em->getRepository(File::class)->findOneById($fid);
                $file->setFileIndex($key);
                $this->em->persist($file);
            }
        }

        // regen message miniature
        $message->setPreview($this->messageService->genPreview($message, true));

        $currentUser->setLastActivityDate(time());
        $this->em->persist($currentUser);

        $this->em->persist($message);
        $this->em->flush();

        $message_norm = $this->normalize($message, ['read_message']);
        $message_norm["preview"] = $this->normalize($message->getPreview(), ['read_message']);
        $message_norm["author"] = $this->normalize($message->getAuthor(), ['read_message_preview']);

        $lineage = [];
        $parent = $message->getParent();
        while (!empty($parent)) {
            $lineage[] = $parent->getId();
            $parent = $parent->getParent();
        }
        $message_norm["lineage"] = $lineage;


        return new JsonResponse(
            $message_norm,
            Response::HTTP_OK
        );
    }
}
