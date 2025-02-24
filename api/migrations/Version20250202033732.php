<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250202033732 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user ADD COLUMN last_notification_email_check INTEGER DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date FROM "user"');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('CREATE TABLE "user" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , avatar_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, login VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , name VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER DEFAULT NULL, PRIMARY KEY(id), CONSTRAINT FK_8D93D64986383B10 FOREIGN KEY (avatar_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO "user" (id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date) SELECT id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649AA08CB10 ON "user" (login)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6497F4741F5 ON "user" (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D64986383B10 ON "user" (avatar_id)');
    }
}
