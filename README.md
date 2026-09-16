# Heart Failure Information Portal

## Project Overview

The Heart Failure Information Portal is a web-based platform designed to centralise heart failure information for patients, clinicians, content custodians and the general public.

The system provides access to healthcare resources through a React frontend, an Express backend, a Microsoft SQL Server database and Umbraco content integration. It supports user authentication, role-based access control, role application workflows and dynamic content display through the Umbraco Delivery API.

## Live Demo

[View the application](https://2026-s1-o1a.github.io/hf-information-portal/)

## Main Features

- User registration and login
- JWT-based authentication using HTTP-only cookies
- Role-based access control
- Multi-role user support
- Admin approval workflow for role applications
- User profile page showing roles and requested roles
- Umbraco content search and content detail pages
- Homepage content fetched from Umbraco
- Microsoft SQL Server database support through Docker

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS Modules
- Axios
- React Router

### Backend

- Node.js
- Express.js
- Microsoft SQL Server
- JWT authentication
- bcrypt password hashing

### CMS

- Umbraco Delivery API
- Vite proxy for local Umbraco API requests

### Database

- Microsoft SQL Server 2022
- Docker Compose

## Project Structure

```bash
hf-information-portal/
├── backend/          # Express backend API
├── client/           # React frontend
├── database/         # Database schema/scripts
├── compose.yml       # Docker SQL Server setup
└── README.md
```

## Setup Guide

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Docker Desktop
- SQL Server Management Studio or Azure Data Studio
- Git

Umbraco content integration also requires access to a running Umbraco CMS server.

---

### 1. Clone the repository

```bash
git clone https://github.com/2026-s1-o1a/hf-information-portal.git
cd hf-information-portal
```

### 2. Start the SQL Server database

From the project root:

```bash
docker compose up -d
```

The database container runs on:

localhost,1434

Default local credentials:
```
User: sa
Password: HF123456!
Database: DB_CEIH
```
### 3. Run the database schema

Open SSMS or Azure Data Studio and connect using:

```
Server: localhost,1434
Authentication: SQL Server Authentication
User: sa
Password: HF123456!
```

Schema in:

database/schema.sql

### 4. Set up backend environment variables

Create a .env file inside the backend/ folder:

```
DB_SERVER=localhost
DB_PORT=1434
DB_DATABASE=DB_CEIH

DB_USER=sa
DB_PASSWORD=HF123456!

NODE_ENV=development

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

Create a .env file **INSIDE THE /CLIENT** folder:
```
# GOOGLE MAPS API KEY - DO NOT PUBLISH
VITE_GOOGLE_MAPS_API_KEY=XXXXXXXXXXXXXX

# Set to true to use mock data for contentPage.tsx
VITE_USE_MOCK_DATA=true
```
### 5. Run the backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

http://localhost:3000

### 6. Run the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend usually runs on:

http://localhost:5173

Or use port 5173 if 5173 is already in use

### 7. Umbraco content integration

The frontend fetches Umbraco content through the Vite proxy in client/vite.config.ts.

The expected local Umbraco server is:

http://localhost:58609

Frontend requests such as:

fetch('/umbraco/delivery/api/v2/content')

are forwarded to:

http://localhost:58609/umbraco/delivery/api/v2/content

The Umbraco CMS must be running separately for live content to appear on the homepage and content pages.

### 8. Recommended local development setup

```bash
# Terminal 1 - Database
docker compose up -d

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd client
npm run dev

# Terminal 4 - Umbraco CMS
Run the Umbraco server separately if available
```
