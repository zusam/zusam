ALTER TABLE `group` ADD COLUMN `last_activity_date` INTEGER;
/*
DROP COLUMN does not work with SQLite.
cf: https://www.sqlite.org/lang_altertable.html
possible workaround in the future: https://stackoverflow.com/a/5987838
-- ALTER TABLE `user` DROP COLUMN `last_connection`;
*/
