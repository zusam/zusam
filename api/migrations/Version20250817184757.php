<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250817184757 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Removes orphaned file references from messages.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DELETE FROM messages_files WHERE file_id NOT IN (SELECT id FROM file)');
        $this->addSql('UPDATE message SET preview_id = NULL WHERE preview_id IS NOT NULL AND preview_id NOT IN (SELECT id FROM file)');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException(
            'This migration permanently deletes orphaned previews and messages_files and cannot be reversed.'
        );
    }
}
