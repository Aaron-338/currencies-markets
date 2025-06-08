import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '12345678',
  database: 'ivrex',
  entities: [path.join(process.cwd(), 'dist/**/*.entity{.js,.ts}')],
  migrations: [path.join(process.cwd(), 'dist/migrations/*.js')], // Path to your compiled migration files
  synchronize: false, // Keep this as false for production to use migrations
};

export const AppDataSource = new DataSource(config); 