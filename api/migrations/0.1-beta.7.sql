-- ADD preview_id field in messages
ALTER TABLE `message` ADD COLUMN `preview_id` VARCHAR(255) DEFAULT NULL;
