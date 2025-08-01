<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250726214502 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove all bookmarks which target message does not exist anymore';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            DELETE FROM `bookmark`
            WHERE NOT EXISTS (
                SELECT 1 FROM `message` WHERE `message`.id = `bookmark`.message_id
            )
        ');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException(
            'This migration permanently deletes orphaned bookmark data and cannot be reverted.'
        );
    }
}
