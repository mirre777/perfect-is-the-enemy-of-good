DROP TABLE IF EXISTS comments;

CREATE TABLE (
    id SERIAL PRIMARY KEY,
    comment VARCHAR(255),
    username VARCHAR(255),
    image_id VARCHAR(255) NOT NULL
);
