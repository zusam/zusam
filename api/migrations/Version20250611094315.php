<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250611094315 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE message ADD COLUMN sort_order INTEGER DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TEMPORARY TABLE __temp__message AS SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type FROM "message"
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE "message"
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE "message" (id CHAR(36) NOT NULL --(DC2Type:guid)
            , author_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
            , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
            , parent_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
            , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
            , created_at INTEGER NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
            , last_activity_date INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
            , is_in_front BOOLEAN NOT NULL, type VARCHAR(255) NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES "group" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307F727ACA70 FOREIGN KEY (parent_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FCDE46FDB FOREIGN KEY (preview_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)
        SQL);
        $this->addSql(<<<'SQL'
            INSERT INTO "message" (id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type) SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type FROM __temp__message
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE __temp__message
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_B6BD307F7F4741F5 ON "message" (secret_key)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_B6BD307FF675F31B ON "message" (author_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_B6BD307FFE54D947 ON "message" (group_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_B6BD307F727ACA70 ON "message" (parent_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_B6BD307FCDE46FDB ON "message" (preview_id)
        SQL);
    }
}
