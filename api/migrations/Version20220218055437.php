<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220218055437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix not unique user logins';
    }

    public function up(Schema $schema): void
    {
        // remove duplicate logins that are older or not as active as their counterpart
        $this->addSql('DELETE FROM user WHERE rowid NOT IN (
          SELECT MAX(rowid) FROM user GROUP BY login ORDER BY last_activity_date, created_at
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649AA08CB10 ON user (login)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_8D93D649AA08CB10');
    }
}
