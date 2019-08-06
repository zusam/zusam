<?php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\ExpressionLanguage\Expression;

class PutUser extends AbstractController
{
    private $em;
    private $encoder;

    public function __construct(EntityManagerInterface $em, UserPasswordEncoderInterface $encoder)
    {
        $this->em = $em;
        $this->encoder = $encoder;
    }

    public function __invoke(User $data): User
    {
        $this->denyAccessUnlessGranted("ROLE_USER");
        $this->denyAccessUnlessGranted(new Expression("user == object"), $data);
        $pass_infos = password_get_info($data->getPassword());
        if ($pass_infos["algo"] === 0) {
            $data->setPassword($this->encoder->encodePassword($data, $data->getPassword()));
        }
        $this->em->persist($data);
        $this->em->flush();
        return $data;
    }
}
