CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(80) NOT NULL UNIQUE,
  "password" VARCHAR(240) NOT NULL
);

CREATE TABLE "favorites" (
  "id" SERIAL PRIMARY KEY,
  "manga_name" VARCHAR(255) NOT NULL,
  "user_id" INT REFERENCES users,
  "api_url" VARCHAR(255) NOT NULL,
  "last_chapter_read" INT DEFAULT 0
);