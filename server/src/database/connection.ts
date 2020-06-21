//npm install knex
import knex from 'knex';
import path from 'path';

const connection = knex ({
    //npm install sqlite3
        client: 'sqlite3',
        connection: {
            filename: path.resolve(__dirname, 'database.sqlite')        
        },
        useNullAsDefault: true,
});

export default connection;

// Migrations: Histórico do banco de dados.