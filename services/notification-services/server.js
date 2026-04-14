import express from "express"
import cors from "cors"
import {startConsumer} from "./rabbitmq/consumer.js"

const app = express()
const PORT = process.env.PORT || 5006;
console.log("Starting Notification Service on PORT:", PORT);

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());


app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

const startServer = async () => {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[OK] Notification Service running on port ${PORT}`);
    });
    await startConsumer();

  } catch (err) {
    console.error(err);
  }
};

startServer();
