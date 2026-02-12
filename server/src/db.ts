import knex from 'knex';
import * as dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stringcase = require('knex-stringcase').default as (options: { app: string; db: string }) => object;

dotenv.config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // port: Number(process.env.DB_PORT), // Certifique-se de definir DB_PORT no .env (ex: 5432 para Postgres)
    typeCast: function (field: any, next: any) {
      // Retorna datas como string no formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
      if (field.type === 'DATE' || field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        const value = field.string();
        return value; // Retorna como string do banco
      }
      return next();
    }
  },
  ...stringcase({
    app: 'camel', // Formato usado no código (camelCase)
    db: 'snake',  // Formato usado no banco de dados (snake_case)
  }),
  pool: { min: 0, max: 7 }
});

db.raw('SELECT 1')
  .then(() => console.log('✅ Conexão com o banco de dados estabelecida com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar no banco de dados:', err));

export default db;
