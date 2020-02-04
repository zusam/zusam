UPDATE "user" SET id = lower(id), avatar_id = lower(avatar_id), secret_key = lower(secret_key);
UPDATE "group" SET id = lower(id), secret_key = lower(secret_key);
UPDATE "message" SET id = lower(id), group_id = lower(group_id), author_id = lower(author_id), parent_id = lower(parent_id), preview_id = lower(preview_id), secret_key = lower(secret_key);
UPDATE "notification" SET id = lower(id), owner_id = lower(owner_id), from_user_id = lower(from_user_id), from_group_id = lower(from_group_id), from_message_id = lower(from_message_id), secret_key = lower(secret_key), target = lower(target);
UPDATE "file" SET id = lower(id), secret_key = lower(secret_key);
UPDATE "users_groups" SET user_id = lower(user_id), group_id = lower(group_id);
UPDATE "messages_files" SET message_id = lower(message_id), file_id = lower(file_id);
UPDATE "link" SET id = lower(id), preview_id = lower(preview_id), secret_key = lower(secret_key);
