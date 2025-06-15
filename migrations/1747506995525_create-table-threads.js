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
	pgm.createTable("threads", {
		id: {
			type: "VARCHAR(50)",
			primaryKey: true,
		},
		title: {
			type: "VARCHAR(150)",
			notNull: true,
		},
		body: {
			type: "TEXT",
			notNull: true,
		},
		owner: {
			type: "VARCHAR(50)",
            references: 'users(id)',
			notNull: true,
            onDelete: 'CASCADE',
		},
		created_at: {
			type: "TEXT",
			notNull: true,
		},
		updated_at: {
			type: "TEXT",
			notNull: true,
		},
	});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable("threads");
};
