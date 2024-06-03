"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var product_1 = __importDefault(require("./entity/product"));
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'mainapp',
    useUnifiedTopology: true,
    entities: [product_1.default],
    synchronize: true,
    url: 'mongodb://root:Password123@localhost:27017/mainapp?authSource=admin',
    logging: false,
});
