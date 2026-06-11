
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL
);

CREATE TABLE saves (
    userId uuid REFERENCES users(id),
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nodes JSONB NOT NULL,
    edges JSONB 
);

