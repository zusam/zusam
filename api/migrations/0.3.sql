CREATE TABLE "log" (
    id CHAR(36) NOT NULL --(DC2Type:guid)
    , created_at INTEGER NOT NULL
    , message CLOB NOT NULL
    , level INTEGER NOT NULL
    , level_name VARCHAR(255) NOT NULL
    , context CLOB NOT NULL --(DC2Type:array)
    , channel VARCHAR(255) NOT NULL, extra CLOB NOT NULL --(DC2Type:array)
    , PRIMARY KEY(id)
);
CREATE TABLE "system" (
    "key" VARCHAR(255) NOT NULL
    , value CLOB NOT NULL
    , created_at INTEGER NOT NULL
    , PRIMARY KEY("key")
);
