# StripCol Server

Backend server designed for EuroScope plugin, specifically tailored for VATSIM Colombia. This service provides temporary, persistent storage for assigned squawk codes and aircraft clearance statuses with automatic expiration (TTL).

## Features

- Squawk Log: Stores 4-digit octal codes with a 25-minute Time-To-Live.
- Clearance Log: Tracks aircraft callsign status with a 50-minute Time-To-Live.
- Security: Protected by a mandatory API Key (X-API-Key header).
- Database: Uses Turso (LibSQL) for high-performance, persistent storage.
- Architecture: Optimized for Vercel Serverless deployment.

## Tech Stack

- Framework: Fastify
- Language: TypeScript
- Database: Turso (LibSQL / SQLite)
- ORM: Drizzle ORM
- Testing: Vitest
- Deployment: Vercel

## Prerequisites

- Node.js 20 or higher
- pnpm
- A Turso database instance

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a .env file in the root directory with the following variables:
   ```env
   TURSO_DATABASE_URL=your_libsql_url
   TURSO_AUTH_TOKEN=your_turso_token
   API_KEY=your_secure_api_key
   PORT=3000
   ```
4. Push the database schema to Turso:
   ```bash
   pnpm exec drizzle-kit push
   ```

## Development

Run the server locally in watch mode:
```bash
pnpm dev
```

Run tests:
```bash
pnpm test
```

## API Documentation

All requests (except the root path) require the following header:
`X-API-Key: [your_api_key]`

### Squawk Log

- POST /squawklog: Registers a squawk code.
  - Body: { "code": "####" }
- GET /squawklog: Returns all active squawk codes.
  - Response: Plain text format (CODE\tTIMESTAMP)

### Clearance Log

- POST /clearancelog: Updates a flight clearance status.
  - Body: { "callsign": "STRING", "status": BOOLEAN }
- GET /clearancelog: Returns all active clearance statuses.
  - Response: Plain text format (CALLSIGN:BOOLEAN)

## Deployment

This project is configured for Vercel. Connect your repository to Vercel and ensure the Environment Variables are set in the Vercel dashboard.
