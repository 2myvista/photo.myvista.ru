CREATE TABLE albums (
    id Uuid NOT NULL,
    title Utf8 NOT NULL,
    description Utf8,
    cover_photo_id Uuid,
    published Bool NOT NULL,
    created_at Timestamp NOT NULL,
    updated_at Timestamp NOT NULL,
    sort_order Int32 NOT NULL,
    slug Utf8 NOT NULL,
    parent_id Uuid,
    photo_count Uint32 NOT NULL,

    INDEX idx_albums_slug GLOBAL UNIQUE SYNC ON (slug),
    INDEX idx_albums_parent_sort GLOBAL ON (parent_id, sort_order),

    PRIMARY KEY (id)
);


CREATE TABLE photos (
    id Uuid NOT NULL,
    hash Utf8 NOT NULL,
    resource_id Utf8 NOT NULL,
    filename Utf8 NOT NULL,
    filesize Uint32 NOT NULL,
    title Utf8 NOT NULL,
    description Utf8,
    public_url Utf8,
    published Bool NOT NULL,
    width Uint32 NOT NULL,
    height Uint32 NOT NULL,
    camera Utf8,
    lens Utf8,
    taken_at Timestamp,
    latitude Double,
    longitude Double,
    created_at Timestamp NOT NULL,
    updated_at Timestamp NOT NULL,

    INDEX idx_photos_hash GLOBAL UNIQUE SYNC ON (hash),
    INDEX idx_photos_resource_id GLOBAL UNIQUE SYNC ON (resource_id),
    INDEX idx_photos_filename GLOBAL UNIQUE SYNC ON (filename),
    INDEX idx_photos_taken_at GLOBAL ON (taken_at),

    PRIMARY KEY (id)
);


CREATE TABLE photo_album (
    photo_id Uuid NOT NULL,
    album_id Uuid NOT NULL,

    INDEX idx_photo_album_album_id GLOBAL ON (album_id),

    PRIMARY KEY (photo_id, album_id)
);


CREATE TABLE users (
    id Uuid NOT NULL,
    login Utf8 NOT NULL,
    password_hash Utf8 NOT NULL,
    name Utf8 NOT NULL,
    role Utf8 NOT NULL,
    is_active Bool NOT NULL,
    created_at Timestamp NOT NULL,
    updated_at Timestamp NOT NULL,
    last_login_at Timestamp,

    INDEX idx_users_login GLOBAL UNIQUE SYNC ON (login),

    PRIMARY KEY (id)
);


CREATE TABLE settings (
    key Utf8 NOT NULL,
    value Utf8 NOT NULL,
    description Utf8,

    PRIMARY KEY (key)
);