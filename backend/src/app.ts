import express, { Request, Response } from "express";

import cors from "cors";
import { AppDataSource } from "./data-source";
import Product from "./entity/product";

const amqp = require("amqplib");

const fetchProducts = "products";
const createProduct = "create_product";
const updateProduct = "updated_product";
const deleteProduct = "delete_product";

const rabbitMqSettings = {
  protocol: "amqp",
  hostname: "localhost",
  port: 5672,
  username: "admin",
  password: "admin",
  vhost: "/",
  AuthMechanism: ["PLAIN", amqp.PLAIN, "EXTERNAL"],
};

AppDataSource.initialize()
  .then((db) => {
    try {
      // Connecting RabbitMQ
      amqp.connect(rabbitMqSettings).then((conn: any) => {
        if(!conn) {
          console.log('Channel creation failed');
        }
        conn.createChannel().then(async (channel: any) => {
          console.log("RabbitMQ channel", channel.channel);

          // queue is asserted for rabbit mq
          const fetchProductsQueue = await channel.assertQueue(fetchProducts, {
            durable: true
        });
          const createProductQueue = await channel.assertQueue(createProduct);
          const updateProdcutQueue = await channel.assertQueue(updateProduct);
          const deleteProductQueue = await channel.assertQueue(deleteProduct);

          const productRepository = db.getRepository(Product);
          if (db.isInitialized) {
            console.log("----------------------------------");
            console.log("Connections is Initialized");
            console.log("----------------------------------");
            console.log("----------------------------------");
          }
          const app = express();

          app.use(
            cors({
              origin: [
                "http://localhost:3000",
                "https://localhost:8080",
                "http://localhost:4200",
              ],
            })
          );

          app.use(express.json());

          console.log("Listing at port:::3300");
          app.listen(3300);

          app.get("/api/products", async (req: Request, res: Response) => {
            const product = await productRepository.find();
            console.log(product);
            return res.send(product).json();
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            const product = await productRepository.save(req.body);
            console.log("/api/products", product);
            channel.sendToQueue(
              createProduct,
              Buffer.from(JSON.stringify(product))
            );
            return res.send(product).status(2000).json();
          });

          app.get("/api/product/:id", async (req: Request, res: Response) => {
            const { id } = req.params;
            const product = await productRepository.findOne({
              where: { id: Number(id) },
            });
            return res.send(product).json();
          });

          app.put("/api/product/:id", async (req: Request, res: Response) => {
            const { id } = req.params;

            const product = await productRepository.findOne({
              where: { id: Number(id) },
            });

            productRepository.merge(product as Product, req.body);
            const result:Product = await productRepository.save(product as Product);

            console.log("/api/product/:id", result);
            channel.sendToQueue(
              updateProduct,
              Buffer.from(JSON.stringify(result))
            );

            return res.send(result).json();
          });

          app.delete(
            "/api/product/:id",
            async (req: Request, res: Response) => {
              const { id } = req.params;
              const product = await productRepository.delete({
                id: Number(id),
              });

              channel.sendToQueue(
                deleteProduct,
                Buffer.from(JSON.stringify(id))
              );

              return res.json(product);
            }
          );

          app.put(
            "/api/product/:id/like",
            async (req: Request, res: Response) => {
              const { id } = req.params;
              const product = await productRepository.findOne({
                where: { id: Number(id) },
              });

              if (product?.likes) product.likes++;
              const result = await productRepository.save(product as Product);

              console.log("/api/product/:id", result);
              if (product) {
                channel.sendToQueue(
                  updateProduct,
                  Buffer.from(JSON.stringify(product))
                );
              }

              return res.send(result).json();
            }
          );
        });
      });
    } catch (err) {
      console.log(err);
    }
  })
  .catch((error) => console.log(error));
