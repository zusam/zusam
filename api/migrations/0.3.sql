CREATE TABLE `log` (
    id CHAR(36) NOT NULL --(DC2Type:guid)
    , `created_at` INTEGER NOT NULL
    , `message` CLOB NOT NULL
    , `level` INTEGER NOT NULL
    , `level_name` VARCHAR(255) NOT NULL
    , `context` CLOB NOT NULL --(DC2Type:array)
    , `channel` VARCHAR(255) NOT NULL, extra CLOB NOT NULL --(DC2Type:array)
    , PRIMARY KEY(id)
);
CREATE TABLE `system` (
    `key` VARCHAR(255) NOT NULL
    , `value` CLOB NOT NULL
    , `created_at` INTEGER NOT NULL
    , PRIMARY KEY("key")
);

-- Rework indexes on messages_files (enables message sharing)
-- I have to recreate the table to drop all previous indexes
BEGIN TRANSACTION;
ALTER TABLE `messages_files` RENAME TO `messages_files_old`;
CREATE TABLE `messages_files` (
    `message_id` VARCHAR(255) NOT NULL,
    `file_id` VARCHAR(255) NOT NULL,
    PRIMARY KEY(message_id, file_id)
);
INSERT INTO `messages_files` (
    `message_id`,
    `file_id`
) SELECT
    `message_id`,
    `file_id`
FROM `messages_files_old`;
DROP TABLE `messages_files_old`;
COMMIT;
CREATE INDEX IDX_MESSAGEID ON messages_files (message_id);
CREATE INDEX IDX_FILEID ON messages_files (file_id);
