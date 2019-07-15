<?php

namespace App\Serializer;

use ApiPlatform\Core\Serializer\ItemNormalizer as ApiPlatformItemNormalizer;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\Serializer\Exception\LogicException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class ItemNormalizer extends ApiPlatformItemNormalizer implements NormalizerInterface
{
    /**
     * {@inheritdoc}
     *
     * @throws NoSuchPropertyException
     * @throws LogicException
     */
    protected function getAttributeValue($object, $attribute, $format = null, array $context = [])
    {
        $context['api_attribute'] = $attribute;
        $propertyMetadata = $this->propertyMetadataFactory->create($context['resource_class'], $attribute, $this->getFactoryOptions($context));

        try {
            $attributeValue = $this->propertyAccessor->getValue($object, $attribute);
        } catch (NoSuchPropertyException $e) {
            if (!$propertyMetadata->hasChildInherited()) {
                throw $e;
            }

            $attributeValue = null;
        } catch (EntityNotFoundException $e) {
            // Silently return null when an entity is not found
            // This can happen when an entity was deleted and the database not cleaned up
            return null;
        }

        $type = $propertyMetadata->getType();

        if (
            is_iterable($attributeValue) &&
            $type &&
            $type->isCollection() &&
            ($collectionValueType = $type->getCollectionValueType()) &&
            ($className = $collectionValueType->getClassName()) &&
            $this->resourceClassResolver->isResourceClass($className)
        ) {
            $resourceClass = $this->resourceClassResolver->getResourceClass($attributeValue, $className);
            $childContext = $this->createChildContext($context, $attribute);
            $childContext['resource_class'] = $resourceClass;

            return $this->normalizeCollectionOfRelations($propertyMetadata, $attributeValue, $resourceClass, $format, $childContext);
        }

        if (
            $type &&
            ($className = $type->getClassName()) &&
            $this->resourceClassResolver->isResourceClass($className)
        ) {
            $resourceClass = $this->resourceClassResolver->getResourceClass($attributeValue, $className);
            $childContext = $this->createChildContext($context, $attribute);
            $childContext['resource_class'] = $resourceClass;

            return $this->normalizeRelation($propertyMetadata, $attributeValue, $resourceClass, $format, $childContext);
        }

        if (!$this->serializer instanceof NormalizerInterface) {
            throw new LogicException(sprintf('The injected serializer must be an instance of "%s".', NormalizerInterface::class));
        }

        unset($context['resource_class']);

        return $this->serializer->normalize($attributeValue, $format, $context);
    }
}
