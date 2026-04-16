# 🎬 Hotstar Clone – Microservices Streaming Platform

A **production-grade Hotstar-like streaming platform** built using **Microservices Architecture, DevOps, Messaging Queues, and Cloud Storage**.

This project simulates a real-world OTT system with **authentication, video streaming, async notifications, and scalable backend services**.

---

## 🏗️ System Architecture (Flow)

```
                 ┌──────────────┐
                 │   Frontend   │
                 │  (React.js)  │
                 └──────┬───────┘
                        │
                 ┌──────▼────────┐
                 │  API Gateway  │
                 └──────┬────────┘
     ┌──────────────────┼─────────────────────┐
     │                  │                     │
┌────▼────┐     ┌───────▼──────┐     ┌────────▼────────┐
│ Auth    │     │ User Service │     │ Video Service   │
│ Service │     │              │     │ (Admin Only)    │
└────┬────┘     └──────┬───────┘     └────────┬────────┘
     │                 │                      │
     │                 │                      │
     │        ┌────────▼────────┐     ┌───────▼────────┐
     │        │ MongoDB         │     │ AWS S3          │
     │        │ (User Data)     │     │ (Video Storage) │
     │        └─────────────────┘     └─────────────────┘
     │
     │ (Login Event)
     ▼
┌───────────────┐
│   RabbitMQ    │
└──────┬────────┘
       ▼
┌───────────────┐
│ Notification  │
│ Service       │
│ (Email भेजे)  │
└───────────────┘

                ┌──────────────────────┐
                │ Streaming Service    │
                │ (S3 से Video Stream) │
                └──────────────────────┘
```

---

## 🔄 Complete Flow Explanation

### 🔐 Authentication Flow

* User → Frontend → API Gateway → Auth Service
* Login/Signup handled via JWT
* On successful login:

  * Event sent to **RabbitMQ**
  * Notification Service consumes event
  * Email sent to user 📧

---

### 👤 User Service

* Only responsible for:

  * User profile (name, profile image)
* Data stored in **MongoDB**

---

### 🎥 Video Upload Flow (Admin Only)

* Admin uploads video via API Gateway → Video Service
* Video stored in **AWS S3**
* Metadata (title, description, URL) stored in **MongoDB**

---

### ▶️ Video Streaming Flow

* User requests video → API Gateway → Streaming Service
* Streaming Service fetches video from **S3**
* Streams video to frontend

---

### 📨 Notification System

* Auth Service → RabbitMQ → Notification Service
* Used for:

  * Login alerts
  * System notifications

---

## 🚀 Tech Stack

### Backend

* Node.js, Express.js
* Microservices Architecture

### Frontend

* React.js, Redux Toolkit, Tailwind CSS

### Database

* MongoDB

### Cloud & Storage

* AWS EC2 (Deployment)
* AWS S3 (Video Storage)

### Messaging & Cache

* RabbitMQ (Async events)
* Redis (Caching)

### DevOps

* Docker, Docker Compose
* Jenkins CI/CD
* SonarQube

### Monitoring

* Prometheus
* Grafana

---

## ⚙️ Key Features

* 🔐 JWT Authentication
* 🎥 Video Upload (Admin Only)
* ☁️ AWS S3 Video Storage
* ▶️ Scalable Video Streaming Service
* 📨 Event-driven Notification System
* 📊 Real-time Monitoring (Prometheus + Grafana)
* 🐳 Dockerized Microservices
* 🚀 CI/CD Pipeline (Jenkins)

---

## 📂 Project Structure

```
Hotstar-Clone/
│
├── api-gateway/
├── auth-service/
├── user-service/
├── video-service/
├── streaming-service/
├── notification-service/
├── frontend/
├── docker-compose.yml
```

---

## 🐳 Run Locally

```bash
git clone https://github.com/yashchauhan66/Hotstar-CLone.git
cd Hotstar-CLone

docker compose up --build -d
```

---

## 📊 Monitoring

* Prometheus collects metrics from all services
* Grafana dashboards:

  * API Requests
  * Response Time
  * Service Health
  * System Metrics

---

## 🔁 CI/CD Pipeline

* Jenkins Pipeline:

  * Code Checkout
  * SonarQube Analysis
  * Docker Build
  * Deploy to EC2

---

## 🌍 Deployment

* Hosted on AWS EC2
* Fully Dockerized production setup

---

## 📌 Key Highlights

* Real-world microservices architecture
* Event-driven system using RabbitMQ
* Scalable video streaming using S3
* Production-level monitoring setup
* End-to-end DevOps pipeline

---

## 👨‍💻 Author

**Yash Chauhan**

* 📧 [yashchauhan6660@gmail.com](mailto:yashchauhan6660@gmail.com)
* 📱 9389507913
* 🌐 Portfolio: https://portfolio-two-orpin-43.vercel.app/
* 💻 GitHub: https://github.com/yashchauhan66

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
