"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var product_1 = __importDefault(require("./entity/product"));
var mongodb_1 = require("mongodb");
var data_source_1 = require("./data-source");
var amqp = require("amqplib");
var rabbitMqSettings = {
    protocol: "amqp",
    hostname: "localhost",
    port: 5672,
    username: "admin",
    password: "admin",
    vhost: "/",
    AuthMechanism: ["PLAIN", amqp.PLAIN, "EXTERNAL"],
};
var fetchProductsQueueName = "products";
var createProductQueueName = "create_product";
var updateProdcutQueueName = "updated_product";
var deleteProductQueueName = "delete_product";
data_source_1.AppDataSource.initialize()
    .then(function (db) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            // Connecting RabbitMQ
            amqp.connect(rabbitMqSettings).then(function (conn) {
                conn.createChannel().then(function (channel) { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchProductsQueue, createProductQueue, updateProdcutQueue, deleteProductQueue, productRepository, app;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("RabbitMQ channel", channel.connection.channelMax);
                                return [4 /*yield*/, channel.assertQueue(fetchProductsQueueName)];
                            case 1:
                                fetchProductsQueue = _a.sent();
                                return [4 /*yield*/, channel.assertQueue(createProductQueueName)];
                            case 2:
                                createProductQueue = _a.sent();
                                return [4 /*yield*/, channel.assertQueue(updateProdcutQueueName)];
                            case 3:
                                updateProdcutQueue = _a.sent();
                                return [4 /*yield*/, channel.assertQueue(deleteProductQueueName)];
                            case 4:
                                deleteProductQueue = _a.sent();
                                productRepository = db.getRepository(product_1.default);
                                if (db.isInitialized) {
                                    console.log("----------------------------------");
                                    console.log("Connections is Initialized");
                                    console.log("----------------------------------");
                                    console.log("----------------------------------");
                                }
                                app = (0, express_1.default)();
                                app.use((0, cors_1.default)({
                                    origin: [
                                        "http://localhost:3000",
                                        "https://localhost:8080",
                                        "http://localhost:4200",
                                    ],
                                }));
                                app.use(express_1.default.json());
                                console.log("Listing at port:::3301");
                                app.listen(3301);
                                // create Product RabbitMQ
                                channel.consume(createProductQueueName, function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                                    var productString, fetchedProduct, product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(msg !== null)) return [3 /*break*/, 3];
                                                productString = msg.content.toString();
                                                fetchedProduct = JSON.parse(productString);
                                                product = new product_1.default();
                                                product.admin_id = fetchedProduct.id;
                                                product.name = fetchedProduct.name;
                                                product.likes = fetchedProduct.likes;
                                                if (!product) return [3 /*break*/, 2];
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2:
                                                console.log(product, "<<<<product inserted by other service");
                                                channel.ack(msg);
                                                _a.label = 3;
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                // update Product RabbitMQ
                                channel.consume(updateProdcutQueueName, function (message) {
                                    var fetchedProduct = message.content.toString();
                                    if (Buffer.isBuffer(fetchedProduct)) {
                                        // If fetchedProduct is a Buffer, convert it to a string
                                        console.log(fetchedProduct.toString(), 1);
                                    }
                                    else {
                                        // If fetchedProduct is an object, convert it to a JSON string
                                        console.log(JSON.stringify(fetchedProduct, null, 2));
                                    }
                                });
                                // create Product RabbitMQ
                                channel.consume(deleteProductQueueName, function (message) {
                                    var fetchedProduct = Buffer.from(message.content.toString());
                                    console.log(fetchedProduct, "<<<<deleteProductQueue");
                                });
                                app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, productRepository.find()];
                                            case 1:
                                                product = _a.sent();
                                                return [2 /*return*/, res.send(product).json()];
                                        }
                                    });
                                }); });
                                app.post("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, productRepository.save(req.body)];
                                            case 1:
                                                product = _a.sent();
                                                // sending data to Queue
                                                return [2 /*return*/, res.send(product).json()];
                                        }
                                    });
                                }); });
                                app.get("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var id, product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                id = req.params.id;
                                                return [4 /*yield*/, productRepository.findOne({
                                                        where: { _id: new mongodb_1.ObjectId(id) },
                                                    })];
                                            case 1:
                                                product = _a.sent();
                                                return [2 /*return*/, res.send(product).json()];
                                        }
                                    });
                                }); });
                                app.put("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var id, product, result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                id = req.params.id;
                                                return [4 /*yield*/, productRepository.findOneBy({
                                                        _id: new mongodb_1.ObjectId(id),
                                                    })];
                                            case 1:
                                                product = _a.sent();
                                                productRepository.merge(product, req.body);
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 2:
                                                result = _a.sent();
                                                return [2 /*return*/, res.send(result).json()];
                                        }
                                    });
                                }); });
                                app.delete("/api/product/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var id, product;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                id = req.params.id;
                                                return [4 /*yield*/, productRepository.delete({
                                                        _id: new mongodb_1.ObjectId(id)
                                                    })];
                                            case 1:
                                                product = _a.sent();
                                                return [2 /*return*/, res.json(product)];
                                        }
                                    });
                                }); });
                                app.put("/api/product/:id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                    var id, product, result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                id = req.params.id;
                                                return [4 /*yield*/, productRepository.findOneBy({
                                                        _id: new mongodb_1.ObjectId(id),
                                                    })];
                                            case 1:
                                                product = _a.sent();
                                                if (product === null || product === void 0 ? void 0 : product.likes)
                                                    product.likes++;
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 2:
                                                result = _a.sent();
                                                return [2 /*return*/, res.send(result).json()];
                                        }
                                    });
                                }); });
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        }
        catch (err) {
            console.log(err);
        }
        return [2 /*return*/];
    });
}); })
    .catch(function (error) { return console.log("erorr db -> ", error); });
