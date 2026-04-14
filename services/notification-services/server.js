import express from "express"
import cors from "cors"
import {startConsumer} from "./rabbitmq/consumer.js"

const app = express()

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

const startServer = async () => {
  try {
    app.listen(5006, "0.0.0.0", () => {
      console.log("Notification Service running on port 5006");
    });
    await startConsumer();

  } catch (err) {
    console.error(err);
  }
};

startServer();





