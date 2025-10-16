# KioskPOS

A modern, self-hosted Point of Sale (POS) system built with modern web technologies.  
Includes features like inventory management, invoicing, product variants, and Swish/Slack support.

## About

- Built-in admin interface to manage everything.
- Automatic invoicing for outstanding balances.
- Products and product variants.
- Stock management with inventory tracking.
- Google login for admin.
- User-friendly self-service POS.
- Guest payments.
- Swish QR code (for use in Sweden).
- Slack notifications for receipts, invoices, and product requests.
- Email notifications for receipts, invoices, and product requests.
- Multi-language support.
- Role management.

##  Getting started

#### Prerequisites
- Node.js (Version: >=22.x)
- PostgreSQL
- pnpm (recommended)

## 🐳 Docker

We provide a Docker container for KioskPOS, which is published on DockerHub.

DockerHub: https://hub.docker.com/r/alexanderwassbjer/kioskpos

You can pull the Docker image from that registry and run it with your preferred container hosting provider.

## 🚀 Deployment

To deploy the app, simply use the provided **Docker Compose** file:

```bash
docker-compose up -d
```

Make sure you’ve set up all required environment variables before deploying (see Environment Variables below).

## ⚙️ Environment Variables

Create a .env file in the project root and configure the necessary environment variables.
Example in `.env.example` file.

## 🧑‍💻 Development setup

Feel free to commit to the open source project.

Install dependencies using pnpm:

```bash
pnpm install
```

Then start the local development server:

```bash
pnpm dev
```

The app will start at http://localhost:3000.