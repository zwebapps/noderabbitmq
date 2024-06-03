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
var data_source_1 = require("./data-source");
var product_1 = __importDefault(require("./entity/product"));
var amqp = require("amqplib");
var fetchProducts = "products";
var createProduct = "create_product";
var updateProduct = "updated_product";
var deleteProduct = "delete_product";
var rabbitMqSettings = {
    protocol: "amqp",
    hostname: "localhost",
    port: 5672,
    username: "admin",
    password: "admin",
    vhost: "/",
    AuthMechanism: ["PLAIN", amqp.PLAIN, "EXTERNAL"],
};
data_source_1.AppDataSource.initialize()
    .then(function (db) {
    try {
        // Connecting RabbitMQ
        amqp.connect(rabbitMqSettings).then(function (conn) {
            if (!conn) {
                console.log('Channel creation failed');
            }
            conn.createChannel().then(function (channel) { return __awaiter(void 0, void 0, void 0, function () {
                var fetchProductsQueue, createProductQueue, updateProdcutQueue, deleteProductQueue, productRepository, app;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("RabbitMQ channel", channel.channel);
                            return [4 /*yield*/, channel.assertQueue(fetchProducts, {
                                    durable: true
                                })];
                        case 1:
                            fetchProductsQueue = _a.sent();
                            return [4 /*yield*/, channel.assertQueue(createProduct)];
                        case 2:
                            createProductQueue = _a.sent();
                            return [4 /*yield*/, channel.assertQueue(updateProduct)];
                        case 3:
                            updateProdcutQueue = _a.sent();
                            return [4 /*yield*/, channel.assertQueue(deleteProduct)];
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
                            console.log("Listing at port:::3300");
                            app.listen(3300);
                            app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                                var product;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, productRepository.find()];
                                        case 1:
                                            product = _a.sent();
                                            console.log(product);
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
                                            console.log("/api/products", product);
                                            channel.sendToQueue(createProduct, Buffer.from(JSON.stringify(product)));
                                            return [2 /*return*/, res.send(product).status(2000).json()];
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
                                                    where: { id: Number(id) },
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
                                            return [4 /*yield*/, productRepository.findOne({
                                                    where: { id: Number(id) },
                                                })];
                                        case 1:
                                            product = _a.sent();
                                            productRepository.merge(product, req.body);
                                            return [4 /*yield*/, productRepository.save(product)];
                                        case 2:
                                            result = _a.sent();
                                            console.log("/api/product/:id", result);
                                            channel.sendToQueue(updateProduct, Buffer.from(JSON.stringify(result)));
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
                                                    id: Number(id),
                                                })];
                                        case 1:
                                            product = _a.sent();
                                            channel.sendToQueue(deleteProduct, Buffer.from(JSON.stringify(id)));
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
                                            return [4 /*yield*/, productRepository.findOne({
                                                    where: { id: Number(id) },
                                                })];
                                        case 1:
                                            product = _a.sent();
                                            if (product === null || product === void 0 ? void 0 : product.likes)
                                                product.likes++;
                                            return [4 /*yield*/, productRepository.save(product)];
                                        case 2:
                                            result = _a.sent();
                                            console.log("/api/product/:id", result);
                                            if (product) {
                                                channel.sendToQueue(updateProduct, Buffer.from(JSON.stringify(product)));
                                            }
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
})
    .catch(function (error) { return console.log(error); });
