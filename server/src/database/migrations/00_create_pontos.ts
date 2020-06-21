import Knex from 'knex';

export async function up(knex: Knex) {
    //Ex: criar tabela

    return knex.schema.createTable('pontos', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();
    })
}

    
export async function down(knex: Knex) {
    //Ex: deleta tabela criada
    
    return knex.schema.dropTable('pontos');
}
