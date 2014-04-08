------------------------------
--         DATABASE         --
------------------------------
CREATE DATABASE jelly_db;

\c jelly_db;

-------------------------------
--      MESSAGES TABLE       --
-------------------------------
CREATE TABLE messages (
    id           serial primary key not null,
    stored       timestamp  not null default CURRENT_TIMESTAMP,
    sender       varchar(50) NOT NULL,
    receiver     varchar(50),
    type         varchar(50),
    roomId       varchar(50) NOT NULL,
    message      varchar(32000) NOT NULL
);

-------------------------------
--      EVENTS TABLE         --
-------------------------------
CREATE TABLE events (
    id           serial primary key not null,
    stored       timestamp  not null default CURRENT_TIMESTAMP,
    sender       varchar(50) NOT NULL,
    receiver     varchar(50),
    roomId       varchar(50) NOT NULL,
    event        varchar(50) NOT NULL
);
