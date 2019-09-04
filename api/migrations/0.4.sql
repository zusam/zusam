-- Rework indexes on message
-- I have to recreate the table to drop all previous indexes
BEGIN TRANSACTION;
ALTER TABLE `message` RENAME TO `message_old`;
CREATE TABLE `message` (
    id CHAR(36) NOT NULL
    , `author_id` CHAR(36) DEFAULT NULL
    , `group_id` CHAR(36) DEFAULT NULL
    , `parent_id` CHAR(36) DEFAULT NULL
    , `preview_id` CHAR(36) DEFAULT NULL
    , `created_at` INTEGER NOT NULL
    , `data` CLOB DEFAULT NULL
    , `last_activity_date` INTEGER NOT NULL
    , `secret_key` CHAR(36) NOT NULL
    , PRIMARY KEY(id)
);
INSERT INTO `message` (
    id
    , `author_id`
    , `group_id`
    , `parent_id`
    , `preview_id`
    , `created_at`
    , `data`
    , `last_activity_date`
    , `secret_key`
) SELECT
    id
    , `author_id`
    , `group_id`
    , `parent_id`
    , `preview_id`
    , `created_at`
    , `data`
    , `last_activity_date`
    , `secret_key`
FROM `message_old`;
DROP TABLE `message_old`;
COMMIT;
CREATE INDEX IDX_MESSAGEPARENTID ON message (parent_id);
CREATE INDEX IDX_MESSAGEGROUPID ON message (group_id);
CREATE INDEX IDX_MESSAGEAUTHORID ON message (author_id);
CREATE UNIQUE INDEX UNIQ_MESSAGESECRETKEY ON message (secret_key);
CREATE INDEX IDX_MESSAGEPREVIEWID ON message (preview_id);
