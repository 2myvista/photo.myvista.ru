/**
 * Инициализация схемы YDB.
 *
 * Создаёт таблицы:
 *   1. albums
 *   2. photos
 *   3. photo_album
 *   4. users
 *   5. settings
 *
 * Запуск:
 *   npm run db:init
 *
 * Перед запуском локально необходимо получить IAM-токен:
 *   $env:YC_IAM_TOKEN = yc iam create-token
 *
 * Параметры YDB:
 *   YDB_ENDPOINT — берётся из .env
 *   YDB_DATABASE — берётся из .env
 *
 * Повторный запуск безопасен:
 * существующие таблицы не пересоздаются.
 *
 * ВАЖНО:
 * Этот файл используется только для первоначальной
 * инициализации/изменения схемы базы данных.
 * Обычный backend работает с YDB через repository/service
 * и не должен запускать этот файл.
 */

/**
 * Порядок первоначальной инициализации проекта:
 *
 * 1. Создать YDB database в Yandex Cloud.
 * 2. Настроить YDB_ENDPOINT и YDB_DATABASE в .env.
 * 3. Получить IAM-токен:
 *      $env:YC_IAM_TOKEN = yc iam create-token
 * 4. Выполнить:
 *      npm run db:init
 * 5. Проверить создание таблиц:
 *      albums
 *      photos
 *      photo_album
 *      users
 *      settings
 * 6. После этого запускать backend:
 *      npm run start
 */

import "dotenv/config";

import {
    Driver,
    TokenAuthService,
    Types,
    Column,
    TableDescription,
    TableIndex,
} from "ydb-sdk";

async function createAlbumsTable(driver: Driver): Promise<void> {
    const description = new TableDescription()
        .withColumns(
            new Column("id", Types.UUID),
            new Column("title", Types.UTF8),
            new Column("description", Types.optional(Types.UTF8)),
            new Column("cover_photo_id", Types.optional(Types.UUID)),
            new Column("published", Types.BOOL),
            new Column("created_at", Types.TIMESTAMP),
            new Column("updated_at", Types.TIMESTAMP),
            new Column("sort_order", Types.INT32),
            new Column("slug", Types.UTF8),
            new Column("parent_id", Types.optional(Types.UUID)),
            new Column("photo_count", Types.UINT32),
        )
        .withPrimaryKey("id")
        .withIndex(
            new TableIndex("idx_albums_slug")
                .withIndexColumns("slug")
                .withGlobalUnique(),
        )
        .withIndex(
            new TableIndex("idx_albums_parent_sort")
                .withIndexColumns("parent_id", "sort_order"),
        );

    await driver.tableClient.withSession(async (session) => {
        await session.createTable("albums", description);
    });

    console.log("Created table: albums");
}

async function createPhotosTable(driver: Driver): Promise<void> {
    const description = new TableDescription()
        .withColumns(
            new Column("id", Types.UUID),
            new Column("hash", Types.UTF8),
            new Column("resource_id", Types.UTF8),
            new Column("filename", Types.UTF8),
            new Column("filesize", Types.UINT32),
            new Column("title", Types.UTF8),
            new Column("description", Types.optional(Types.UTF8)),
            new Column("public_url", Types.optional(Types.UTF8)),
            new Column("published", Types.BOOL),
            new Column("width", Types.UINT32),
            new Column("height", Types.UINT32),
            new Column("camera", Types.optional(Types.UTF8)),
            new Column("lens", Types.optional(Types.UTF8)),
            new Column("taken_at", Types.optional(Types.TIMESTAMP)),
            new Column("latitude", Types.optional(Types.DOUBLE)),
            new Column("longitude", Types.optional(Types.DOUBLE)),
            new Column("created_at", Types.TIMESTAMP),
            new Column("updated_at", Types.TIMESTAMP),
        )
        .withPrimaryKey("id")
        .withIndex(
            new TableIndex("idx_photos_hash")
                .withIndexColumns("hash")
                .withGlobalUnique(),
        )
        .withIndex(
            new TableIndex("idx_photos_resource_id")
                .withIndexColumns("resource_id")
                .withGlobalUnique(),
        )
        .withIndex(
            new TableIndex("idx_photos_filename")
                .withIndexColumns("filename")
                .withGlobalUnique(),
        )
        .withIndex(
            new TableIndex("idx_photos_taken_at")
                .withIndexColumns("taken_at"),
        );

    await driver.tableClient.withSession(async (session) => {
        await session.createTable("photos", description);
    });

    console.log("Created table: photos");
}

async function createPhotoAlbumTable(driver: Driver): Promise<void> {
    const description = new TableDescription()
        .withColumns(
            new Column("photo_id", Types.UUID),
            new Column("album_id", Types.UUID),
        )
        .withPrimaryKeys("photo_id", "album_id")
        .withIndex(
            new TableIndex("idx_photo_album_album")
                .withIndexColumns("album_id"),
        );

    await driver.tableClient.withSession(async (session) => {
        await session.createTable("photo_album", description);
    });

    console.log("Created table: photo_album");
}

async function createUsersTable(driver: Driver): Promise<void> {
    const description = new TableDescription()
        .withColumns(
            new Column("id", Types.UUID),
            new Column("login", Types.UTF8),
            new Column("password_hash", Types.UTF8),
            new Column("name", Types.UTF8),
            new Column("role", Types.UTF8),
            new Column("is_active", Types.BOOL),
            new Column("created_at", Types.TIMESTAMP),
            new Column("updated_at", Types.TIMESTAMP),
            new Column("last_login_at", Types.optional(Types.TIMESTAMP)),
        )
        .withPrimaryKey("id")
        .withIndex(
            new TableIndex("idx_users_login")
                .withIndexColumns("login")
                .withGlobalUnique(),
        );

    await driver.tableClient.withSession(async (session) => {
        await session.createTable("users", description);
    });

    console.log("Created table: users");
}

async function createSettingsTable(driver: Driver): Promise<void> {
    const description = new TableDescription()
        .withColumns(
            new Column("key", Types.UTF8),
            new Column("value", Types.UTF8),
            new Column("description", Types.optional(Types.UTF8)),
        )
        .withPrimaryKey("key");

    await driver.tableClient.withSession(async (session) => {
        await session.createTable("settings", description);
    });

    console.log("Created table: settings");
}

async function main(): Promise<void> {
    const endpoint = process.env.YDB_ENDPOINT;
    const database = process.env.YDB_DATABASE;
    const iamToken = process.env.YC_IAM_TOKEN;

    if (!endpoint) {
        throw new Error("YDB_ENDPOINT is not set");
    }

    if (!database) {
        throw new Error("YDB_DATABASE is not set");
    }

    if (!iamToken) {
        throw new Error("YC_IAM_TOKEN is not set");
    }

    console.log("Connecting to YDB:");
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Database: ${database}`);

    const authService = new TokenAuthService(iamToken);

    const driver = new Driver({
        endpoint,
        database,
        authService,
    });

    try {
        await driver.ready(30_000);

        console.log("YDB connection established");

        await createAlbumsTable(driver);
        await createPhotosTable(driver);
        await createPhotoAlbumTable(driver);
        await createUsersTable(driver);
        await createSettingsTable(driver);

        console.log("");
        console.log("YDB schema initialized successfully");
    } finally {
        await driver.destroy();
    }
}

main().catch((error) => {
    console.error("Failed to initialize YDB schema:");
    console.error(error);
    process.exit(1);
});