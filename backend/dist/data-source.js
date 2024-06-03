"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
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
