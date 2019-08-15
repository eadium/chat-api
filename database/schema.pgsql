DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS user_chat CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    CITEXT NOT NULL UNIQUE,
    created     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chats (
    id          SERIAL PRIMARY KEY,
    name        CITEXT NOT NULL UNIQUE,
    created     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
    id          SERIAL PRIMARY KEY,
    chat_id     INT NOT NULL REFERENCES chats(id),
    author_id   INT NOT NULL REFERENCES users(id),
    text        TEXT NOT NULL,
    created     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_chat (
    chat_id   INT REFERENCES chats(id),
    user_id   INT REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_chats_users ON user_chat(chat_id, user_id);