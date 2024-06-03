import { ConnectionOptions } from 'mongodb';
import { DataSource } from 'typeorm';
import Product from './entity/product';
export const AppDataSource = new DataSource({
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  database: 'mainapp',
  useUnifiedTopology: true,
  entities: [Product],
  synchronize: true,
  url: 'mongodb://root:Password123@localhost:27017/mainapp?authSource=admin',
  logging: false, 
  });


  