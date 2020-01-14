<?php

namespace App\Normalizer;

use Symfony\Component\Serializer\Normalizer\ObjectNormalizer as SymfonyObjectNormalizer;
use Symfony\Component\PropertyAccess\PropertyAccessorInterface;
use Symfony\Component\PropertyInfo\PropertyTypeExtractorInterface;
use Symfony\Component\Serializer\Mapping\ClassDiscriminatorResolverInterface;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactoryInterface;
use Symfony\Component\Serializer\NameConverter\NameConverterInterface;

/**
 * Adds a MAX_TREE_DEPTH limitation to symfony's objectNormalizer.
 *
 * The usual objectNormalizer has a MAX_DEPTH limitation that can be used but it's
 * counting depth of objects of the same class (not global depth of the resulting tree).
 * See 4.3 implementation here:
 * https://github.com/symfony/symfony/blob/4.3/src/Symfony/Component/Serializer/Normalizer/AbstractObjectNormalizer.php#L527
 */
class ObjectNormalizer extends SymfonyObjectNormalizer
{
    /**
     * How deep the resulting normalized tree can be.
     * The default value is 1.
     */
    public const TREE_DEPTH_LIMIT = 'tree_depth_limit';

    /**
     * Set to true to respect the max tree depth.
     */
    public const ENABLE_MAX_TREE_DEPTH = 'enable_max_tree_depth';

    /**
     * Handler to call when max tree depth is reached.
     *
     * If you specify no handler, a MaxTreeDepthException is thrown.
     *
     * The method will be called with ($object, $format, $context) and its
     * return value is returned as the result of the normalize call.
     */
    public const MAX_TREE_DEPTH_HANDLER = 'max_tree_depth_handler';

    /**
     * @internal
     */
    protected const TREE_DEPTH_LIMIT_COUNTERS = 'tree_depth_limit_counters';

    /**
     * @internal
     */
    private $discriminatorCache = [];

    public function __construct(
        ClassMetadataFactoryInterface $classMetadataFactory = null,
        NameConverterInterface $nameConverter = null,
        PropertyAccessorInterface $propertyAccessor = null,
        PropertyTypeExtractorInterface $propertyTypeExtractor = null,
        ClassDiscriminatorResolverInterface $classDiscriminatorResolver = null,
        callable $objectClassResolver = null,
        array $defaultContext = []
    ) {
        parent::__construct($classMetadataFactory, $nameConverter, $propertyAccessor, $propertyTypeExtractor, $classDiscriminatorResolver, $objectClassResolver, $defaultContext);
        $this->defaultContext[self::TREE_DEPTH_LIMIT] = 1;
    }

    /**
     * Detects if the configured max tree depth limit is reached.
     *
     * @param object $object
     * @param array  $context
     *
     * @return bool
     *
     * @throws MaxTreeDepthException
     */
    protected function isMaxTreeDepth($object, &$context)
    {
        $enableMaxTreeDepth = $context[self::ENABLE_MAX_TREE_DEPTH] ?? $this->defaultContext[self::ENABLE_MAX_TREE_DEPTH] ?? false;
        if (!$enableMaxTreeDepth) {
            return false;
        }
        $treeDepthLimit = $context[self::TREE_DEPTH_LIMIT] ?? $this->defaultContext[self::TREE_DEPTH_LIMIT] ?? $this->treeDepthLimit;
        if (isset($context[self::TREE_DEPTH_LIMIT_COUNTERS])) {
            if ($context[self::TREE_DEPTH_LIMIT_COUNTERS] >= $treeDepthLimit) {
                unset($context[self::TREE_DEPTH_LIMIT_COUNTERS]);

                return true;
            }
            ++$context[self::TREE_DEPTH_LIMIT_COUNTERS];
        } else {
            $context[self::TREE_DEPTH_LIMIT_COUNTERS] = 1;
        }

        return false;
    }

    /**
     * Handles a max tree depth.
     *
     * If a max tree depth handler is set, it will be called. Otherwise, a
     * {@class MaxTreeDepthException} will be thrown.
     *
     * @param object      $object
     * @param string|null $format
     * @param array       $context
     *
     * @return mixed
     *
     * @throws MaxTreeDepthException
     */
    protected function handleMaxTreeDepth($object, string $format = null, array $context = [])
    {
        $maxTreeDepthHandler = $context[self::MAX_TREE_DEPTH_HANDLER] ?? $this->defaultContext[self::MAX_TREE_DEPTH_HANDLER] ?? $this->maxTreeDepthHandler;
        if ($maxTreeDepthHandler) {
            return $maxTreeDepthHandler($object, $format, $context);
        }
        throw new MaxTreeDepthException(sprintf('Max tree depth has been reached when serializing the object of class "%s" (configured limit: %d)', \get_class($object), $this->treeDepthLimit));
    }

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        if ($this->isMaxTreeDepth($object, $context)) {
            return $this->handleMaxTreeDepth($object, $format, $context);
        }

        // Remove the "read_me" group if we normalize a user that is not us.
        if ('User' === array_values(array_slice(explode('\\', get_class($object)), -1))[0]) {
            if (!isset($context['currentUser']) || $object->getId() !== $context['currentUser']) {
                $context['groups'] = array_filter($context['groups'], function ($g) {
                    return 'read_me' !== $g;
                });
            }
        }

        return parent::normalize($object, $format, $context);
    }

    /**
     * {@inheritdoc}
     */
    protected function getAllowedAttributes($classOrObject, array $context, $attributesAsString = false)
    {
        $allowExtraAttributes = $context[self::ALLOW_EXTRA_ATTRIBUTES] ?? $this->defaultContext[self::ALLOW_EXTRA_ATTRIBUTES];
        if (!$this->classMetadataFactory) {
            if (!$allowExtraAttributes) {
                throw new LogicException(sprintf('A class metadata factory must be provided in the constructor when setting "%s" to false.', self::ALLOW_EXTRA_ATTRIBUTES));
            }

            return false;
        }

        $tmpGroups = $context[self::GROUPS] ?? $this->defaultContext[self::GROUPS] ?? null;
        $groups = (\is_array($tmpGroups) || is_scalar($tmpGroups)) ? (array) $tmpGroups : false;
        if (false === $groups && $allowExtraAttributes) {
            return false;
        }

        $allowedAttributes = [];
        foreach ($this->classMetadataFactory->getMetadataFor($classOrObject)->getAttributesMetadata() as $attributeMetadata) {
            $name = $attributeMetadata->getName();

            if (
                (
                    false === $groups
                    || in_array('*', $attributeMetadata->getGroups())
                    || array_intersect($attributeMetadata->getGroups(), $groups)
                )
                && $this->isAllowedAttribute($classOrObject, $name, null, $context)
            ) {
                $allowedAttributes[] = $attributesAsString ? $name : $attributeMetadata;
            }
        }

        return $allowedAttributes;
    }

    /**
     * {@inheritdoc}
     */
    protected function getAttributeValue(object $object, string $attribute, string $format = null, array $context = [])
    {
        $cacheKey = \get_class($object);
        if (!\array_key_exists($cacheKey, $this->discriminatorCache)) {
            $this->discriminatorCache[$cacheKey] = null;
            if (null !== $this->classDiscriminatorResolver) {
                $mapping = $this->classDiscriminatorResolver->getMappingForMappedObject($object);
                $this->discriminatorCache[$cacheKey] = null === $mapping ? null : $mapping->getTypeProperty();
            }
        }

        if ($attribute === $this->discriminatorCache[$cacheKey]) {
            return $this->classDiscriminatorResolver->getTypeForMappedObject($object);
        } else {
            try {
                return $this->propertyAccessor->getValue($object, $attribute);
            } catch (\Exception $e) {
                // TODO: log exception
                return NULL;
            }
        }
    }
}
