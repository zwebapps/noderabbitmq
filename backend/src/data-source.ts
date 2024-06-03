import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "Password123",
    "database": "rabbitmqsr1",
    "entities": ["dist/entity/*.js"],
    "synchronize": true,
    "logging": false
  });