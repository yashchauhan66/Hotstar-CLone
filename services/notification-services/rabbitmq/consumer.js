import amqp from "amqplib";
import { sendEmail } from "../sendEmail/emailService.js";

export const startConsumer = async () => {
  const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  
  while (true) {
    try {
      console.log("Connecting to RabbitMQ (Consumer)...");
      const connection = await amqp.connect(RABBIT_URL);
      const channel = await connection.createChannel();
      const queueName = "Hanuman";

      await channel.assertQueue(queueName, { durable: true });
      channel.prefetch(1);

      console.log("Notification Consumer Ready. Waiting for messages...");

      channel.consume(queueName, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          console.log("Notification Received:", data.email);
          if (data.type === "LOGIN_SUCCESS") {
            await sendEmail(data);
          }
          channel.ack(msg);
        } catch (err) {
          console.error("Error processing message:", err.message);
          channel.nack(msg, false, true);
        }
      });
      break;
    } catch (err) {
      console.error("RabbitMQ Consumer connection failed, retrying in 5s...", err.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};