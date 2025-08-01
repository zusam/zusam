<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250801090704 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove all notifications that reference users, messages, file, or groups that don\'t exist anymore';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            DELETE FROM `notification`
            WHERE `owner_id` IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM `user` WHERE `user`.id = `notification`.owner_id
              )
        ');

        $this->addSql('
            DELETE FROM `notification`
            WHERE `miniature_id` IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM `file` WHERE `file`.id = `notification`.miniature_id
              )
        ');

        $this->addSql('
            DELETE FROM `notification`
            WHERE `from_user_id` IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM `user` WHERE `user`.id = `notification`.from_user_id
              )
        ');

        $this->addSql('
            DELETE FROM `notification`
            WHERE `from_group_id` IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM `group` WHERE `group`.id = `notification`.from_group_id
              )
        ');

        $this->addSql('
            DELETE FROM `notification`
            WHERE `from_message_id` IS NOT NULL
              AND NOT EXISTS (
                SELECT 1 FROM `message` WHERE `message`.id = `notification`.from_message_id
              )
        ');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException(
            'This migration permanently deletes orphaned notifications and cannot be reversed.'
        );
    }
}
