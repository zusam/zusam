/* Add secret_key to file */
ALTER TABLE `file` ADD COLUMN `secret_key` CHAR(36) NOT NULL COLLATE BINARY DEFAULT '';

/* Add secret_key to message */
ALTER TABLE `message` ADD COLUMN `secret_key` CHAR(36) NOT NULL COLLATE BINARY DEFAULT '';

/* Add secret_key to link */
ALTER TABLE `link` ADD COLUMN `secret_key` CHAR(36) NOT NULL COLLATE BINARY DEFAULT '';

/* 
    Rename invite_key to secret_key in group
    Sqlite 3.25 supports renaming but is fairly new
*/
BEGIN TRANSACTION;
ALTER TABLE `group` RENAME TO `group_old`;
CREATE TABLE `group` (
    `id` CHAR(36) NOT NULL COLLATE BINARY,
    `created_at` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL COLLATE BINARY,
    `last_activity_date` INTEGER DEFAULT NULL,
    `secret_key` CHAR(36) NOT NULL COLLATE BINARY,
    `data` CLOB DEFAULT NULL,
    PRIMARY KEY(id)
);
INSERT INTO `group` (
    `id`,
    `created_at`,
    `name`,
    `last_activity_date`,
    `secret_key`,
    `data`
) SELECT
    `id`,
    `created_at`,
    `name`,
    `last_activity_date`,
    `invite_key`,
    `data`
FROM `group_old`;
DROP TABLE `group_old`;
COMMIT;

/* 
    Rename api_key to secret_key in user
    Sqlite 3.25 supports renaming but is fairly new
*/
BEGIN TRANSACTION;
ALTER TABLE `user` RENAME TO `user_old`;
CREATE TABLE `user` (
    `id` CHAR(36) NOT NULL COLLATE BINARY,
    `avatar_id` CHAR(36) DEFAULT NULL,
    `created_at` INTEGER NOT NULL,
    `secret_key` CHAR(36) NOT NULL COLLATE BINARY,
    `name` VARCHAR(255) NOT NULL COLLATE BINARY,
    `login` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `data` CLOB DEFAULT NULL,
    `news` CLOB DEFAULT NULL,
    PRIMARY KEY(id),
    CONSTRAINT FK_USER_AVATAR FOREIGN KEY (avatar_id) REFERENCES `file` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
);
INSERT INTO `user` (
    `id`,
    `avatar_id`,
    `created_at`,
    `secret_key`,
    `name`,
    `login`,
    `password`,
    `data`,
    `news`
) SELECT
    `id`,
    `avatar_id`,
    `created_at`,
    `api_key`,
    `name`,
    `login`,
    `password`,
    `data`,
    `news`
FROM `user_old`;
DROP TABLE `user_old`;
COMMIT;
