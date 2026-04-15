import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

export const sendToQueue = async (data) => {
  const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  let connection;
  
  while (true) {
    try {
      connection = await amqp.connect(RABBIT_URL);
      const channel = await connection.createChannel();
      const queueName = "Hanuman";

      await channel.assertQueue(queueName, { durable: true });

      const message = JSON.stringify({
        type: data.type || "LOGIN_SUCCESS",
        email: data.email,
        subject: data.subject,
        text: data.text,
      });

      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });

      console.log("Message sent to RabbitMQ (Auth Service):", data.email);

      setTimeout(() => {
        connection.close();
      }, 500);
      break;
    } catch (error) {
      console.error("RabbitMQ connection failed (Producer), retrying in 5s...", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
