<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250726212720 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Start by setting the type to standard for all messages (there are no other types for now)
        // We're doing this because some old messages could have a NULL type
        $this->addSql('UPDATE message SET type = "standard";');
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order FROM message');
        $this->addSql('DROP TABLE message');
        $this->addSql('CREATE TABLE message (id CHAR(36) NOT NULL --(DC2Type:guid)
        , author_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , parent_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , is_in_front BOOLEAN NOT NULL, type VARCHAR(255) NOT NULL DEFAULT "standard", sort_order INTEGER DEFAULT NULL, PRIMARY KEY(id), CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES "group" (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307F727ACA70 FOREIGN KEY (parent_id) REFERENCES message (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FCDE46FDB FOREIGN KEY (preview_id) REFERENCES file (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO message (id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order) SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B6BD307F7F4741F5 ON message (secret_key)');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON message (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FFE54D947 ON message (group_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F727ACA70 ON message (parent_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FCDE46FDB ON message (preview_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__notification AS SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data, read FROM notification');
        $this->addSql('DROP TABLE notification');
        $this->addSql('CREATE TABLE notification (id CHAR(36) NOT NULL --(DC2Type:guid)
        , owner_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , miniature_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, type VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , target VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , read BOOLEAN NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_BF5476CA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA903C60DB FOREIGN KEY (miniature_id) REFERENCES file (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA2130303A FOREIGN KEY (from_user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CAB8BB39DD FOREIGN KEY (from_group_id) REFERENCES "group" (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA78DED52E FOREIGN KEY (from_message_id) REFERENCES message (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO notification (id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data, read) SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data, read FROM __temp__notification');
        $this->addSql('DROP TABLE __temp__notification');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BF5476CA7F4741F5 ON notification (secret_key)');
        $this->addSql('CREATE INDEX IDX_BF5476CA7E3C61F9 ON notification (owner_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA903C60DB ON notification (miniature_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA2130303A ON notification (from_user_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CAB8BB39DD ON notification (from_group_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA78DED52E ON notification (from_message_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__system AS SELECT "key", value, created_at FROM system');
        $this->addSql('DROP TABLE system');
        $this->addSql('CREATE TABLE system ("key" CHAR(36) NOT NULL --(DC2Type:guid)
        , value CLOB NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY("key"))');
        $this->addSql('INSERT INTO system ("key", value, created_at) SELECT "key", value, created_at FROM __temp__system');
        $this->addSql('DROP TABLE __temp__system');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order FROM "message"');
        $this->addSql('DROP TABLE "message"');
        $this->addSql('CREATE TABLE "message" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , author_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , parent_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , is_in_front BOOLEAN NOT NULL, type VARCHAR(255) DEFAULT NULL, sort_order INTEGER DEFAULT NULL, PRIMARY KEY(id), CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES "group" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307F727ACA70 FOREIGN KEY (parent_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FCDE46FDB FOREIGN KEY (preview_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO "message" (id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order) SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front, type, sort_order FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B6BD307F7F4741F5 ON "message" (secret_key)');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON "message" (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FFE54D947 ON "message" (group_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F727ACA70 ON "message" (parent_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FCDE46FDB ON "message" (preview_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__notification AS SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, read, data FROM "notification"');
        $this->addSql('DROP TABLE "notification"');
        $this->addSql('CREATE TABLE "notification" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , owner_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , miniature_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, type VARCHAR(255) DEFAULT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , target VARCHAR(255) NOT NULL, read BOOLEAN NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , PRIMARY KEY(id), CONSTRAINT FK_BF5476CA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA903C60DB FOREIGN KEY (miniature_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA2130303A FOREIGN KEY (from_user_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CAB8BB39DD FOREIGN KEY (from_group_id) REFERENCES "group" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA78DED52E FOREIGN KEY (from_message_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO "notification" (id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, read, data) SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, read, data FROM __temp__notification');
        $this->addSql('DROP TABLE __temp__notification');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BF5476CA7F4741F5 ON "notification" (secret_key)');
        $this->addSql('CREATE INDEX IDX_BF5476CA7E3C61F9 ON "notification" (owner_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA903C60DB ON "notification" (miniature_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA2130303A ON "notification" (from_user_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CAB8BB39DD ON "notification" (from_group_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA78DED52E ON "notification" (from_message_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__system AS SELECT "key", value, created_at FROM system');
        $this->addSql('DROP TABLE system');
        $this->addSql('CREATE TABLE system ("key" VARCHAR(255) NOT NULL, value CLOB NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY("key"))');
        $this->addSql('INSERT INTO system ("key", value, created_at) SELECT "key", value, created_at FROM __temp__system');
        $this->addSql('DROP TABLE __temp__system');
    }
}
