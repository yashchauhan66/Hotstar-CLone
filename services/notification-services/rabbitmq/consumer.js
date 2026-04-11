// consumer.js
import amqp from "amqplib";
import { sendEmail } from "../sendEmail/emailService.js";

export const startConsumer = async () => {
  try {
    console.log(" Starting Notification Consumer...");

    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    const queueName = "Hanuman";

    await channel.assertQueue(queueName, { durable: true });


    channel.prefetch(1);

    console.log(" Waiting for messages...");

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());

        console.log(" Received:", data);

        if (data.type === "LOGIN_SUCCESS") {
          await sendEmail(data);
        }

        channel.ack(msg); 

      } catch (err) {
        console.error(" Error:", err);

        
        channel.nack(msg, false, true);
      }
    });

  } catch (err) {
    console.error(" Consumer Error:", err);
  }
};