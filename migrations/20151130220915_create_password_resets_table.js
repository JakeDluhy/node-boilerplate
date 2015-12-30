exports.up = function(knex, Promise) {
  return knex.schema.createTable('password_resets', function(table) {
    table.increments().primary();
    table.string('reset_code').unique().index();
    table.integer('user_id').unique().index().references('users.id');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('password_resets');
};
