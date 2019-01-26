-- Remove last_connection from user
BEGIN TRANSACTION;
CREATE TEMPORARY TABLE user_bk (
    id VARCHAR(255) NOT NULL,
    avatar_id VARCHAR(255) DEFAULT NULL,
    created_at INTEGER NOT NULL,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    data CLOB DEFAULT NULL,
    PRIMARY KEY(id)
);
INSERT INTO user_bk SELECT id, avatar_id, created_at, login, password, api_key, name, data FROM user;
DROP TABLE user;
CREATE TABLE user (
    id VARCHAR(255) NOT NULL,
    avatar_id VARCHAR(255) DEFAULT NULL,
    created_at INTEGER NOT NULL,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    data CLOB DEFAULT NULL,
    PRIMARY KEY(id)
);
INSERT INTO user SELECT id, avatar_id, created_at, login, password, api_key, name, data FROM user_bk;
DROP TABLE user_bk;
COMMIT;

-- Add data column to group
ALTER TABLE `group` ADD COLUMN data CLOB DEFAULT NULL;

-- Add news coumn to user
ALTER TABLE `user` ADD COLUMN news CLOB DEFAULT NULL;
