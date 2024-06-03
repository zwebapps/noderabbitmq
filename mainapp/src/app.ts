import express, { Request, Response } from "express";

import cors from "cors";
import Product from "./entity/product";
import { ObjectId } from "mongodb";
import { AppDataSource } from "./data-source";

const amqp = require("amqplib");

const rabbitMqSettings = {
  protocol: "amqp",
  hostname: "localhost",
  port: 5672,
  username: "admin",
  password: "admin",
  vhost: "/",
  AuthMechanism: ["PLAIN", amqp.PLAIN, "EXTERNAL"],
};

const fetchProductsQueueName = "products";
const createProductQueueName = "create_product";
const updateProdcutQueueName = "updated_product";
const deleteProductQueueName = "delete_product";

AppDataSource.initialize()
  .then(async (db) => {
    try {
      // Connecting RabbitMQ
      amqp.connect(rabbitMqSettings).then((conn: any) => {
        conn.createChannel().then(async (channel: any) => {

          console.log("RabbitMQ channel", channel.connection.channelMax);

          // queue is asserted for rabbit mq
          const fetchProductsQueue = await channel.assertQueue(fetchProductsQueueName);
          const createProductQueue = await channel.assertQueue(createProductQueueName);
          const updateProdcutQueue = await channel.assertQueue(updateProdcutQueueName);
          const deleteProductQueue = await channel.assertQueue(deleteProductQueueName);

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

          console.log("Listing at port:::3301");
          app.listen(3301);

          // create Product RabbitMQ
          channel.consume(createProductQueueName, async (msg:any) => {
            if (msg !== null) {
              // Convert the buffer back to a JSON string
              const productString = msg.content.toString();
              // Parse the JSON string to an object
              const fetchedProduct = JSON.parse(productString);

              // Acknowledge the message
              const product: Product = new Product();
              product.admin_id = fetchedProduct.id;
              product.name = fetchedProduct.name;
              product.likes = fetchedProduct.likes;
              if(product) {
                await productRepository.save(product);
              }
              console.log(product,"<<<<product inserted by other service")
              channel.ack(msg);
            }
          });

           // update Product RabbitMQ
          channel.consume(updateProdcutQueueName, async (message:any) => {
            const fetchedProduct: any = JSON.parse(message.content.toString())            
              const product = await productRepository.findOneBy({
                admin_id: JSON.stringify(fetchedProduct.id),
              });
            

            if (product?.likes) product.likes++;
            const result = await productRepository.save(product as Product);
          });

           // create Product RabbitMQ
          channel.consume(deleteProductQueueName, (message:any) => {
          const fetchedProduct: any = Buffer.from(message.content.toString())
            console.log(fetchedProduct, "<<<<deleteProductQueue");
          });

          app.get("/api/products", async (req: Request, res: Response) => {
            const product = await productRepository.find();
            return res.send(product).json();
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            const product = await productRepository.save(req.body);
            // sending data to Queue
            return res.send(product).json();
          });

          app.get("/api/product/:id", async (req: Request, res: Response) => {
            const { id } = req.params;
            const product = await productRepository.findOne({
              where: { _id: new ObjectId(id) },
            });
            return res.send(product).json();
          });

          app.put("/api/product/:id", async (req: Request, res: Response) => {
            const { id } = req.params;
            const product = await productRepository.findOneBy({
              _id: new ObjectId(id),
            });
            productRepository.merge(product as Product, req.body);
            const result = await productRepository.save(product as Product);
            return res.send(result).json();
          });

          app.delete(
            "/api/product/:id",
            async (req: Request, res: Response) => {
              const { id } = req.params;
              const product = await productRepository.delete({
                _id: new ObjectId(id)
              });
              return res.json(product);
            }
          );

          app.put(
            "/api/product/:id/like",
            async (req: Request, res: Response) => {
              const { id } = req.params;
              const product = await productRepository.findOneBy({
                _id: new ObjectId(id),
              });

              if (product?.likes) product.likes++;
              const result = await productRepository.save(product as Product);
              return res.send(result).json();
            }
          );
        });
      });
    } catch (err) {
      console.log(err);
    }
  })
  .catch((error) => console.log("erorr db -> ", error));
