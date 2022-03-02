<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220218061656 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set message.is_in_front to 0 when it is NULL';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE message SET is_in_front = 0 WHERE is_in_front IS NULL');
    }

    public function down(Schema $schema): void
    {
    }
}
