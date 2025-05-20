<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250520004944 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__group AS SELECT id, created_at, name, last_activity_date, secret_key, data FROM "group"');
        $this->addSql('DROP TABLE "group"');
        $this->addSql('CREATE TABLE "group" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, name VARCHAR(255) NOT NULL, last_activity_date INTEGER DEFAULT NULL, secret_key VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , invite_key VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "group" (id, created_at, name, last_activity_date, secret_key, data) SELECT id, created_at, name, last_activity_date, secret_key, data FROM __temp__group');
        $this->addSql('DROP TABLE __temp__group');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6DC044C57F4741F5 ON "group" (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6DC044C5916567E ON "group" (invite_key)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__group AS SELECT id, secret_key, created_at, name, last_activity_date, data FROM "group"');
        $this->addSql('DROP TABLE "group"');
        $this->addSql('CREATE TABLE "group" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , secret_key VARCHAR(255) NOT NULL, created_at INTEGER NOT NULL, name VARCHAR(255) NOT NULL, last_activity_date INTEGER DEFAULT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "group" (id, secret_key, created_at, name, last_activity_date, data) SELECT id, secret_key, created_at, name, last_activity_date, data FROM __temp__group');
        $this->addSql('DROP TABLE __temp__group');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_6DC044C57F4741F5 ON "group" (secret_key)');
    }
}
