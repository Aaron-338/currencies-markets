import { DataSource, DataSourceOptions } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ivrex',
  entities: [join(__dirname, '/../**/*.entity{.js,.ts}')],
  migrations: [join(__dirname, '/../migrations/*{.js,.ts}')],
  synchronize: true, // Keep this as false for production to use migrations
};

const dataSource = new DataSource(config);
export default dataSource;
