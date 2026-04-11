import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

export const sendToQueue = async (data) => {
  try {
    console.log("Step 1 - inside sendToQueue function", data.email);
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
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

    console.log("Message actually sent to RabbitMQ:", data.email);

    
    setTimeout(() => {
      connection.close();
    }, 500);

  } catch (error) {
    console.error("Error in sendToQueue:", error.message);
    throw error; 
  }
}
