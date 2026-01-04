<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

abstract class ApiController extends AbstractController
{
    protected $em;
    protected $serializer;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        $this->em = $em;
        $this->serializer = $serializer;
    }

    /*
     * Standard serialize method for all API controllers
     * Returns JSON and handle circular references by returning an json object with only the id
     * @param null|object $array
     */
    public function serialize(?object $object, array $groups = [])
    {
        // Always add the 'public' group and ensure groups are unique.
        $groups[] = 'public';
        $groups = array_values(array_unique($groups));

        return $this->serializer->serialize(
            $object,
            'json',
            [
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => static function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : '';
                },
                AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
                AbstractObjectNormalizer::CIRCULAR_REFERENCE_LIMIT => 1, // symfony default
                AbstractObjectNormalizer::ALLOW_EXTRA_ATTRIBUTES => true, // symfony default
                'currentUser' => $this->getUser() ? $this->getUser()->getUserIdentifier() : null,
                'groups' => $groups,
            ]
        );
    }

    /*
     * Standard normalize method for all API controllers
     * Returns array and handle circular references by returning an array containing only the id
     * @param null|object $array
     */
    public function normalize($object, array $groups = [])
    {
        // Always add the 'public' group and ensure groups are unique.
        $groups[] = 'public';
        $groups = array_values(array_unique($groups));

        return $this->serializer->normalize(
            $object,
            'json',
            [
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => static function ($object, $format = null, array $context = []) {
                    return \method_exists($object, 'getId') ? ['id' => $object->getId()] : '';
                },
                AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
                AbstractObjectNormalizer::CIRCULAR_REFERENCE_LIMIT => 1, // symfony default
                AbstractObjectNormalizer::ALLOW_EXTRA_ATTRIBUTES => true, // symfony default
                'currentUser' => $this->getUser() ? $this->getUser()->getUserIdentifier() : null,
                'groups' => $groups,
            ]
        );
    }
}
