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
    , `is_in_front` TINYINT(1) DEFAULT NULL
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
UPDATE message SET is_in_front = 1 WHERE parent_id IS NULL;

/*
The tmp_notification table is a intermediary table
made to convert old notifications to the new system
*/

-- Create tmp notification table
CREATE TEMPORARY TABLE `tmp_notification` (
    id CHAR(36) NOT NULL --(DC2Type:guid)
    , `owner_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `miniature_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_user_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_group_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_message_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `created_at` INTEGER NOT NULL
    , `type` VARCHAR(255) NOT NULL
    , `secret_key` CHAR(36) NOT NULL --(DC2Type:guid)
    , `target` VARCHAR(255) NOT NULL
    , `data` CLOB DEFAULT NULL --(DC2Type:json)
    , PRIMARY KEY(id)
);

-- insert data from old notifications
INSERT INTO `tmp_notification` (
    id
    , `owner_id`
    , `created_at`
    , `type`
    , `secret_key`
    , `target`
) SELECT
    -- uuidv4 generation
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))
    , user_id
    , 0 -- update after some filtering
    , 'new_message'
    -- uuidv4 generation
    , lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))
    , news_id
FROM (
    WITH RECURSIVE split(user_id, news_id, rest) AS (
        SELECT id, '', news || ',' FROM user
            UNION ALL
        SELECT user_id,
            substr(rest, 0, instr(rest, ',')),
            substr(rest, instr(rest, ',')+1)
        FROM split
        WHERE rest <> ''
    )
    SELECT user_id, news_id FROM split WHERE news_id <> ''
);

-- delete all notifications not related to messages
DELETE FROM tmp_notification AS tn WHERE NOT EXISTS (SELECT * FROM `message` WHERE id = tn.target);

-- update from_* data
UPDATE tmp_notification AS tn SET from_user_id = (SELECT author_id FROM message AS m WHERE tn.target = m.id);
UPDATE tmp_notification AS tn SET miniature_id = (SELECT avatar_id FROM user AS u WHERE tn.from_user_id = u.id);
UPDATE tmp_notification AS tn SET from_group_id = (SELECT group_id FROM message AS m WHERE tn.target = m.id);
UPDATE tmp_notification AS tn SET from_message_id = (SELECT parent_id FROM message AS m WHERE tn.target = m.id);
UPDATE tmp_notification SET from_message_id = target WHERE from_message_id IS NULL;
UPDATE tmp_notification SET created_at = (SELECT created_at FROM message WHERE id = target);

-- keep only notifications for groups that the user actually has
DELETE FROM tmp_notification as n WHERE NOT EXISTS (
    SELECT * FROM users_groups as ug WHERE ug.user_id = n.owner_id AND ug.group_id = n.from_group_id
);

-- Remove news from user
-- Add last_activity_date to user
BEGIN TRANSACTION;
ALTER TABLE `user` RENAME TO `user_old`;
CREATE TABLE `user` (
    `id` CHAR(36) NOT NULL COLLATE BINARY
    , `avatar_id` CHAR(36) DEFAULT NULL
    , `created_at` INTEGER NOT NULL
    , `secret_key` CHAR(36) NOT NULL COLLATE BINARY
    , `name` VARCHAR(255) NOT NULL COLLATE BINARY
    , `login` VARCHAR(255) NOT NULL
    , `password` VARCHAR(255) NOT NULL
    , `data` CLOB DEFAULT NULL
    , `last_activity_date` INTEGER DEFAULT NULL
    , PRIMARY KEY(id)
    , CONSTRAINT FK_USER_AVATAR FOREIGN KEY (avatar_id) REFERENCES `file` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
);
INSERT INTO `user` (
    id
    , `avatar_id`
    , `created_at`
    , `secret_key`
    , `name`
    , `login`
    , `password`
    , `data`
) SELECT
    id
    , `avatar_id`
    , `created_at`
    , `secret_key`
    , `name`
    , `login`
    , `password`
    , `data`
FROM `user_old`;
DROP TABLE `user_old`;
COMMIT;

-- Create new notification table
CREATE TABLE `notification` (
    id CHAR(36) NOT NULL --(DC2Type:guid)
    , `owner_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `miniature_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_user_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_group_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `from_message_id` CHAR(36) DEFAULT NULL --(DC2Type:guid)
    , `created_at` INTEGER NOT NULL
    , `type` VARCHAR(255) NOT NULL
    , `secret_key` CHAR(36) NOT NULL --(DC2Type:guid)
    , `target` VARCHAR(255) NOT NULL
    , `data` CLOB DEFAULT NULL --(DC2Type:json)
    , PRIMARY KEY(id)
    , CONSTRAINT FK_NOTIFOWNERID FOREIGN KEY (owner_id) REFERENCES `user` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
    , CONSTRAINT FK_NOTIFMINIATUREID FOREIGN KEY (miniature_id) REFERENCES `file` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
    , CONSTRAINT FK_NOTIFUSERID FOREIGN KEY (from_user_id) REFERENCES `user` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
    , CONSTRAINT FK_NOTIFGROUPID FOREIGN KEY (from_group_id) REFERENCES `group` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
    , CONSTRAINT FK_NOTIFMESSAGEID FOREIGN KEY (from_message_id) REFERENCES `message` (id) NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE UNIQUE INDEX UNIQ_NOTIFSECRETKEY ON `notification` (secret_key);
CREATE INDEX IDX_NOTIFOWNERID ON notification (owner_id);
CREATE INDEX IDX_NOTIFMINIATUREID ON `notification` (miniature_id);
CREATE INDEX IDX_NOTIFUSERID ON `notification` (from_user_id);
CREATE INDEX IDX_NOTIFGROUPID ON `notification` (from_group_id);
CREATE INDEX IDX_NOTIFMESSAGEID ON `notification` (from_message_id);

-- copy data from tmp_notification
INSERT INTO `notification` (
    id
    , `owner_id`
    , `miniature_id`
    , `from_user_id`
    , `from_group_id`
    , `from_message_id`
    , `created_at`
    , `type`
    , `secret_key`
    , `target`
) SELECT
    id
    , `owner_id`
    , `miniature_id`
    , `from_user_id`
    , `from_group_id`
    , `from_message_id`
    , `created_at`
    , `type`
    , `secret_key`
    , `target`
FROM `tmp_notification`;
DROP TABLE `tmp_notification`;
