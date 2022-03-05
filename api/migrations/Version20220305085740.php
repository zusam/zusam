<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220305085740 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Tag entity';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE "tag" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_389B783FE54D947 ON "tag" (group_id)');
        $this->addSql('CREATE TABLE tags_messages (tag_id CHAR(36) NOT NULL --(DC2Type:guid)
        , message_id CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(tag_id, message_id))');
        $this->addSql('CREATE INDEX IDX_B194828FBAD26311 ON tags_messages (tag_id)');
        $this->addSql('CREATE INDEX IDX_B194828F537A1329 ON tags_messages (message_id)');
        $this->addSql('DROP INDEX IDX_DA62921D537A1329');
        $this->addSql('DROP INDEX IDX_DA62921DA76ED395');
        $this->addSql('CREATE TEMPORARY TABLE __temp__bookmark AS SELECT id, user_id, message_id, created_at FROM bookmark');
        $this->addSql('DROP TABLE bookmark');
        $this->addSql('CREATE TABLE bookmark (id CHAR(36) NOT NULL --(DC2Type:guid)
        , user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_DA62921DA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_DA62921D537A1329 FOREIGN KEY (message_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO bookmark (id, user_id, message_id, created_at) SELECT id, user_id, message_id, created_at FROM __temp__bookmark');
        $this->addSql('DROP TABLE __temp__bookmark');
        $this->addSql('CREATE INDEX IDX_DA62921D537A1329 ON bookmark (message_id)');
        $this->addSql('CREATE INDEX IDX_DA62921DA76ED395 ON bookmark (user_id)');
        $this->addSql('DROP INDEX UNIQ_36AC99F17F4741F5');
        $this->addSql('DROP INDEX UNIQ_36AC99F1F47645AE');
        $this->addSql('DROP INDEX UNIQ_36AC99F1CDE46FDB');
        $this->addSql('CREATE TEMPORARY TABLE __temp__link AS SELECT id, preview_id, created_at, updated_at, data, url, secret_key FROM link');
        $this->addSql('DROP TABLE link');
        $this->addSql('CREATE TABLE link (id CHAR(36) NOT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, data CLOB NOT NULL --(DC2Type:json)
        , url VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(id), CONSTRAINT FK_36AC99F1CDE46FDB FOREIGN KEY (preview_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO link (id, preview_id, created_at, updated_at, data, url, secret_key) SELECT id, preview_id, created_at, updated_at, data, url, secret_key FROM __temp__link');
        $this->addSql('DROP TABLE __temp__link');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F17F4741F5 ON link (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F1F47645AE ON link (url)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F1CDE46FDB ON link (preview_id)');
        $this->addSql('DROP INDEX IDX_B6BD307FCDE46FDB');
        $this->addSql('DROP INDEX IDX_B6BD307F727ACA70');
        $this->addSql('DROP INDEX IDX_B6BD307FFE54D947');
        $this->addSql('DROP INDEX IDX_B6BD307FF675F31B');
        $this->addSql('DROP INDEX UNIQ_B6BD307F7F4741F5');
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front FROM message');
        $this->addSql('DROP TABLE message');
        $this->addSql('CREATE TABLE message (id CHAR(36) NOT NULL --(DC2Type:guid)
        , author_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , parent_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , is_in_front BOOLEAN NOT NULL, PRIMARY KEY(id), CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES "group" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307F727ACA70 FOREIGN KEY (parent_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B6BD307FCDE46FDB FOREIGN KEY (preview_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO message (id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front) SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE INDEX IDX_B6BD307FCDE46FDB ON message (preview_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F727ACA70 ON message (parent_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FFE54D947 ON message (group_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON message (author_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B6BD307F7F4741F5 ON message (secret_key)');
        $this->addSql('DROP INDEX IDX_B337622293CB796C');
        $this->addSql('DROP INDEX IDX_B3376222537A1329');
        $this->addSql('CREATE TEMPORARY TABLE __temp__messages_files AS SELECT message_id, file_id FROM messages_files');
        $this->addSql('DROP TABLE messages_files');
        $this->addSql('CREATE TABLE messages_files (message_id CHAR(36) NOT NULL --(DC2Type:guid)
        , file_id CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(message_id, file_id), CONSTRAINT FK_B3376222537A1329 FOREIGN KEY (message_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_B337622293CB796C FOREIGN KEY (file_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO messages_files (message_id, file_id) SELECT message_id, file_id FROM __temp__messages_files');
        $this->addSql('DROP TABLE __temp__messages_files');
        $this->addSql('CREATE INDEX IDX_B337622293CB796C ON messages_files (file_id)');
        $this->addSql('CREATE INDEX IDX_B3376222537A1329 ON messages_files (message_id)');
        $this->addSql('DROP INDEX IDX_BF5476CA78DED52E');
        $this->addSql('DROP INDEX IDX_BF5476CAB8BB39DD');
        $this->addSql('DROP INDEX IDX_BF5476CA2130303A');
        $this->addSql('DROP INDEX IDX_BF5476CA903C60DB');
        $this->addSql('DROP INDEX IDX_BF5476CA7E3C61F9');
        $this->addSql('DROP INDEX UNIQ_BF5476CA7F4741F5');
        $this->addSql('CREATE TEMPORARY TABLE __temp__notification AS SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data FROM notification');
        $this->addSql('DROP TABLE notification');
        $this->addSql('CREATE TABLE notification (id CHAR(36) NOT NULL --(DC2Type:guid)
        , owner_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , miniature_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, type VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , target VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , PRIMARY KEY(id), CONSTRAINT FK_BF5476CA7E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA903C60DB FOREIGN KEY (miniature_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA2130303A FOREIGN KEY (from_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CAB8BB39DD FOREIGN KEY (from_group_id) REFERENCES "group" (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_BF5476CA78DED52E FOREIGN KEY (from_message_id) REFERENCES "message" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO notification (id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data) SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data FROM __temp__notification');
        $this->addSql('DROP TABLE __temp__notification');
        $this->addSql('CREATE INDEX IDX_BF5476CA78DED52E ON notification (from_message_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CAB8BB39DD ON notification (from_group_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA2130303A ON notification (from_user_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA903C60DB ON notification (miniature_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA7E3C61F9 ON notification (owner_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BF5476CA7F4741F5 ON notification (secret_key)');
        $this->addSql('DROP INDEX UNIQ_8D93D64986383B10');
        $this->addSql('DROP INDEX UNIQ_8D93D6497F4741F5');
        $this->addSql('DROP INDEX UNIQ_8D93D649AA08CB10');
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, avatar_id, created_at, secret_key, name, login, password, data, last_activity_date FROM user');
        $this->addSql('DROP TABLE user');
        $this->addSql('CREATE TABLE user (id CHAR(36) NOT NULL --(DC2Type:guid)
        , avatar_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , name VARCHAR(255) NOT NULL, login VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER DEFAULT NULL, PRIMARY KEY(id), CONSTRAINT FK_8D93D64986383B10 FOREIGN KEY (avatar_id) REFERENCES "file" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO user (id, avatar_id, created_at, secret_key, name, login, password, data, last_activity_date) SELECT id, avatar_id, created_at, secret_key, name, login, password, data, last_activity_date FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D64986383B10 ON user (avatar_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6497F4741F5 ON user (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649AA08CB10 ON user (login)');
        $this->addSql('DROP INDEX IDX_FF8AB7E0A76ED395');
        $this->addSql('DROP INDEX IDX_FF8AB7E0FE54D947');
        $this->addSql('CREATE TEMPORARY TABLE __temp__users_groups AS SELECT user_id, group_id FROM users_groups');
        $this->addSql('DROP TABLE users_groups');
        $this->addSql('CREATE TABLE users_groups (user_id CHAR(36) NOT NULL --(DC2Type:guid)
        , group_id CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(user_id, group_id), CONSTRAINT FK_FF8AB7E0A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_FF8AB7E0FE54D947 FOREIGN KEY (group_id) REFERENCES "group" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO users_groups (user_id, group_id) SELECT user_id, group_id FROM __temp__users_groups');
        $this->addSql('DROP TABLE __temp__users_groups');
        $this->addSql('CREATE INDEX IDX_FF8AB7E0A76ED395 ON users_groups (user_id)');
        $this->addSql('CREATE INDEX IDX_FF8AB7E0FE54D947 ON users_groups (group_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE "tag"');
        $this->addSql('DROP TABLE tags_messages');
        $this->addSql('DROP INDEX IDX_DA62921DA76ED395');
        $this->addSql('DROP INDEX IDX_DA62921D537A1329');
        $this->addSql('CREATE TEMPORARY TABLE __temp__bookmark AS SELECT id, user_id, message_id, created_at FROM "bookmark"');
        $this->addSql('DROP TABLE "bookmark"');
        $this->addSql('CREATE TABLE "bookmark" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "bookmark" (id, user_id, message_id, created_at) SELECT id, user_id, message_id, created_at FROM __temp__bookmark');
        $this->addSql('DROP TABLE __temp__bookmark');
        $this->addSql('CREATE INDEX IDX_DA62921DA76ED395 ON "bookmark" (user_id)');
        $this->addSql('CREATE INDEX IDX_DA62921D537A1329 ON "bookmark" (message_id)');
        $this->addSql('DROP INDEX UNIQ_36AC99F1F47645AE');
        $this->addSql('DROP INDEX UNIQ_36AC99F17F4741F5');
        $this->addSql('DROP INDEX UNIQ_36AC99F1CDE46FDB');
        $this->addSql('CREATE TEMPORARY TABLE __temp__link AS SELECT id, preview_id, created_at, updated_at, data, url, secret_key FROM "link"');
        $this->addSql('DROP TABLE "link"');
        $this->addSql('CREATE TABLE "link" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, data CLOB NOT NULL --(DC2Type:json)
        , url VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "link" (id, preview_id, created_at, updated_at, data, url, secret_key) SELECT id, preview_id, created_at, updated_at, data, url, secret_key FROM __temp__link');
        $this->addSql('DROP TABLE __temp__link');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F1F47645AE ON "link" (url)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F17F4741F5 ON "link" (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_36AC99F1CDE46FDB ON "link" (preview_id)');
        $this->addSql('DROP INDEX UNIQ_B6BD307F7F4741F5');
        $this->addSql('DROP INDEX IDX_B6BD307FF675F31B');
        $this->addSql('DROP INDEX IDX_B6BD307FFE54D947');
        $this->addSql('DROP INDEX IDX_B6BD307F727ACA70');
        $this->addSql('DROP INDEX IDX_B6BD307FCDE46FDB');
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front FROM "message"');
        $this->addSql('DROP TABLE "message"');
        $this->addSql('CREATE TABLE "message" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , author_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , parent_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , preview_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , is_in_front BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "message" (id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front) SELECT id, author_id, group_id, parent_id, preview_id, created_at, data, last_activity_date, secret_key, is_in_front FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B6BD307F7F4741F5 ON "message" (secret_key)');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON "message" (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FFE54D947 ON "message" (group_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F727ACA70 ON "message" (parent_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FCDE46FDB ON "message" (preview_id)');
        $this->addSql('DROP INDEX IDX_B3376222537A1329');
        $this->addSql('DROP INDEX IDX_B337622293CB796C');
        $this->addSql('CREATE TEMPORARY TABLE __temp__messages_files AS SELECT message_id, file_id FROM messages_files');
        $this->addSql('DROP TABLE messages_files');
        $this->addSql('CREATE TABLE messages_files (message_id CHAR(36) NOT NULL --(DC2Type:guid)
        , file_id CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(message_id, file_id))');
        $this->addSql('INSERT INTO messages_files (message_id, file_id) SELECT message_id, file_id FROM __temp__messages_files');
        $this->addSql('DROP TABLE __temp__messages_files');
        $this->addSql('CREATE INDEX IDX_B3376222537A1329 ON messages_files (message_id)');
        $this->addSql('CREATE INDEX IDX_B337622293CB796C ON messages_files (file_id)');
        $this->addSql('DROP INDEX UNIQ_BF5476CA7F4741F5');
        $this->addSql('DROP INDEX IDX_BF5476CA7E3C61F9');
        $this->addSql('DROP INDEX IDX_BF5476CA903C60DB');
        $this->addSql('DROP INDEX IDX_BF5476CA2130303A');
        $this->addSql('DROP INDEX IDX_BF5476CAB8BB39DD');
        $this->addSql('DROP INDEX IDX_BF5476CA78DED52E');
        $this->addSql('CREATE TEMPORARY TABLE __temp__notification AS SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data FROM "notification"');
        $this->addSql('DROP TABLE "notification"');
        $this->addSql('CREATE TABLE "notification" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , owner_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , miniature_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_user_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_group_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , from_message_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, type VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , target VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "notification" (id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data) SELECT id, owner_id, miniature_id, from_user_id, from_group_id, from_message_id, created_at, type, secret_key, target, data FROM __temp__notification');
        $this->addSql('DROP TABLE __temp__notification');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BF5476CA7F4741F5 ON "notification" (secret_key)');
        $this->addSql('CREATE INDEX IDX_BF5476CA7E3C61F9 ON "notification" (owner_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA903C60DB ON "notification" (miniature_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA2130303A ON "notification" (from_user_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CAB8BB39DD ON "notification" (from_group_id)');
        $this->addSql('CREATE INDEX IDX_BF5476CA78DED52E ON "notification" (from_message_id)');
        $this->addSql('DROP INDEX UNIQ_8D93D649AA08CB10');
        $this->addSql('DROP INDEX UNIQ_8D93D6497F4741F5');
        $this->addSql('DROP INDEX UNIQ_8D93D64986383B10');
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date FROM "user"');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('CREATE TABLE "user" (id CHAR(36) NOT NULL --(DC2Type:guid)
        , avatar_id CHAR(36) DEFAULT NULL --(DC2Type:guid)
        , created_at INTEGER NOT NULL, login VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, secret_key CHAR(36) NOT NULL --(DC2Type:guid)
        , name VARCHAR(255) NOT NULL, data CLOB DEFAULT NULL --(DC2Type:json)
        , last_activity_date INTEGER DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('INSERT INTO "user" (id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date) SELECT id, avatar_id, created_at, login, password, secret_key, name, data, last_activity_date FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649AA08CB10 ON "user" (login)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6497F4741F5 ON "user" (secret_key)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D64986383B10 ON "user" (avatar_id)');
        $this->addSql('DROP INDEX IDX_FF8AB7E0A76ED395');
        $this->addSql('DROP INDEX IDX_FF8AB7E0FE54D947');
        $this->addSql('CREATE TEMPORARY TABLE __temp__users_groups AS SELECT user_id, group_id FROM users_groups');
        $this->addSql('DROP TABLE users_groups');
        $this->addSql('CREATE TABLE users_groups (user_id CHAR(36) NOT NULL --(DC2Type:guid)
        , group_id CHAR(36) NOT NULL --(DC2Type:guid)
        , PRIMARY KEY(user_id, group_id))');
        $this->addSql('INSERT INTO users_groups (user_id, group_id) SELECT user_id, group_id FROM __temp__users_groups');
        $this->addSql('DROP TABLE __temp__users_groups');
        $this->addSql('CREATE INDEX IDX_FF8AB7E0A76ED395 ON users_groups (user_id)');
        $this->addSql('CREATE INDEX IDX_FF8AB7E0FE54D947 ON users_groups (group_id)');
    }
}
