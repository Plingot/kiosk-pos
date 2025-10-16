# Docker Compose Setup

This repository provides Docker Compose configurations for both development and production environments.

## Development

The development setup only includes a PostgreSQL database.

```bash
# Start development environment
docker-compose -f dev/docker-compose.yml up -d
```

## Production

The production setup includes both the application and a PostgreSQL database.

```bash
# Start production environment
docker-compose -f prod/docker-compose.yml up -d
```

⚠️ Make sure to create a .env file based on the provided .env.example before starting.

## Environment Variables

All environment variables should be defined in the .env file.
An example file is available as .env.example.