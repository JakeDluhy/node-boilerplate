exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments().primary();
    table.string('first_name');
    table.string('last_name');
    table.string('email').unique().index();
    table.string('password');
    table.integer('active').defaultTo(0);
    table.boolean('mailing_list');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
