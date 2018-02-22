CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(80) NOT NULL UNIQUE,
  "password" VARCHAR(240) NOT NULL
);

CREATE TABLE "favorites" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT REFERENCES users,
  "manga_id" INT NOT NULL,
  "manga_name" VARCHAR(255) NOT NULL,
  "synopsis" TEXT NOT NULL,
  "manga_image_url" VARCHAR(255) NOT NULL,
  "latest_chapter" INT NOT NULL,
  "last_chapter_read" INT DEFAULT 0,
  "status" VARCHAR(50) NOT NULL,
   UNIQUE ("manga_id", "user_id")
);

/*   UNIQUE ("manga_id", "user_id") is done in order to make is so that the user cannot add the same manga to his favorites*/ 
