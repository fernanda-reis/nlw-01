import Knex from 'knex';

export async function up(knex: Knex) {
    //Ex: criar tabela
    return knex.schema.createTable('pontos_items', table => {
        table.increments('id').primary();

        table.integer('ponto_id')
        .notNullable()
        .references('id')
        .inTable('pontos');

        table.integer('item_id')
        .notNullable()
        .references('id')
        .inTable('items');
    })

}

    
export async function down(knex: Knex) {
    //Ex: deleta tabela criada
    return knex.schema.dropTable('pontos_items');

}
