/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
	pgm.createTable("comments", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true,
		},
		thread_id: {
			type: "VARCHAR(50)",
            references: "threads(id)",
			notNull: true,
            onDelete: "CASCADE"
		},
		content: {
			type: "TEXT",
			notNull: true,
		},
		owner: {
			type: "VARCHAR(50)",
            references: "users(id)",
			notNull: true,
            onDelete: "CASCADE"
		},
		created_at: {
			type: "TEXT",
			notNull: false,
		},
		updated_at: {
			type: "TEXT",
			notNull: false,
		},
		deleted_at: {
			type: "TEXT",
			notNull: false,
		},
	});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable("commnents");
};
