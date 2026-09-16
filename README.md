# Heart Failure Information Portal

## Project Overview

The Heart Failure Information Portal is a web-based platform designed to centralise heart failure information for patients, clinicians, content custodians and the general public.

The system provides access to healthcare resources through a React frontend, an Express backend, a Microsoft SQL Server database and Umbraco content integration. It supports user authentication, role-based access control, role application workflows and dynamic content display through the Umbraco Delivery API.

## Live Demo

[View the application](https://hf-information-portal.vercel.app)

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

<http://localhost:3000>

### 6. Run the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend usually runs on:

<http://localhost:5173>

Or use port 5173 if 5173 is already in use

### 7. Umbraco content integration

The frontend fetches Umbraco content through the Vite proxy in client/vite.config.ts.

The expected local Umbraco server is:

<http://localhost:58609>

Frontend requests such as:

fetch('/umbraco/delivery/api/v2/content')

are forwarded to:

<http://localhost:58609/umbraco/delivery/api/v2/content>

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

### Node.js ↔ .NET/Umbraco JWT Authentication

## Overview

This project uses **Node.js** as the identity provider and **.NET/Umbraco** as a downstream API that trusts Node-issued JSON Web Tokens (JWTs). Node owns user credentials and login; .NET never touches passwords or a credential store — it only validates tokens cryptographically.

```
User → Node.js (login, issues JWT) → Browser (httpOnly cookie)
                                            ↓
                                    .NET / Umbraco (validates JWT, reads claims)
```

## How it works

1. **Login** — the user submits credentials to Node. Node checks them against its own user store (e.g. bcrypt hash comparison).
2. **Token issuance** — on success, Node signs a JWT containing identifying claims and sets it as an httpOnly cookie on the response.
3. **Request to .NET** — the browser sends the cookie automatically on requests to the .NET/Umbraco API.
4. **Validation** — .NET's JWT Bearer middleware verifies the token's signature, issuer/audience (if configured), and expiry, then populates `User` (a `ClaimsPrincipal`) with the token's claims. No call back to Node is made.
5. **Member sync** — a custom `MembersController` endpoint in Umbraco reads the validated claims and ensures a corresponding Umbraco `IMember` exists, linking the two systems via a nodeUserId and Umbraco members username property.

## Token contents

The JWT payload carries only non-secret, identifying claims:

```json
{
  "id": "nodeUserId",
  "fullName": "Full Name",
  "emailaddress": "user@example.com",
  "memberTypeAlias": "member",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Note:** JWT payloads are Base64-encoded, not encrypted — anyone holding the token can read them. Never place passwords, hashes, or other secrets in the payload.

## Signing and verification

- **Algorithm:** HS256 (symmetric) — a single shared secret (`JWT_SECRET`) is used by Node to sign and by .NET to verify.
- Verification recomputes the signature over the received payload and compares it to the one attached to the token — it does not "decrypt" anything. Any edit to the payload invalidates the signature and causes validation to fail.
- For stronger separation between services, RS256 (asymmetric) is an option: Node signs with a private key it alone holds, and .NET verifies with the corresponding public key.

## Node.js — issuing tokens

```javascript
import jwt from 'jsonwebtoken'

export const generateToken = (userId, name, email, res) => {
  const payload = { id: userId, name, email, memberTypeAlias: 'member' }
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })

  return token
}
```

## .NET — validating tokens

```csharp
var secret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured");
var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

builder.Services.AddAuthentication()
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = securityKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jwt", out var token))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });
```

Registered as a **non-default** authentication scheme so it doesn't interfere with Umbraco's own backoffice/member cookie authentication. Endpoints that require it opt in explicitly:

```csharp
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
```

## Secrets configuration

| Environment | Storage |
| --- | --- |
| Local development | `dotnet user-secrets set "Jwt:Secret" "..."` |
| Production | Environment variable (`Jwt__Secret`) or Azure Key Vault |

`appsettings.json` holds only non-secret config (issuer, audience); the secret itself is never committed to source control.
Umbraco's JWT secret is the same as the one used for our backend (auth) node.js.

Add UMBRACO_SERVER with your Umbraco's address to .env in backend.

E.g
```UMBRACO_SERVER="https://localhost:44343"```

## Member sync (Umbraco)

A custom `MembersController` at `/umbraco/api/members` reads `id`, `fullName`, `emailaddress`, and `memberTypeAlias` from the validated token claims and:

1. Checks whether an Umbraco member already exists for this Node user (matched via the member's Username).
2. If not, creates one via `IMemberService.CreateMemberWithIdentity(...)`.
3. Stores the Node user's `id` as the new member's Username so future lookups can link the two systems.

This keeps Node as the single source of truth for identity, while letting Umbraco use its native Member Groups / content restriction features against the synced member record.

## CORS and cross-origin cookies

For the browser to send the `jwt` cookie to a different origin (e.g. React dev server on `:3000` calling Umbraco on `:44343`):

- .NET's CORS policy must include `AllowCredentials()`.
- The frontend `fetch` call must include `credentials: "include"`.
- Both origins should use HTTPS in production (`sameSite: 'none'` requires `secure: true`).

## Local development notes

- .NET's local HTTPS certificate is self-signed. Browsers need `dotnet dev-certs https --trust`; Node.js (for any server-to-server calls to the .NET API) needs the cert trusted separately via `NODE_EXTRA_CA_CERTS`, since Node does not use the OS trust store the same way browsers do.

## Testing the Node ↔ .NET JWT Flow in Postman

## Prerequisites

- Node server running (e.g. `http://localhost:3000`)
- .NET/Umbraco server running (e.g. `https://localhost:44343`)
- A Postman **Environment** created, with a variable named `jwt_token` (leave the value blank for now)

## 1. Log in via Node and capture the token

**Request**

- Method: `POST`
- URL: `http://localhost:3000/login`
- Body → raw → JSON:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Tests tab** — auto-saves the returned token into your environment so you don't have to copy/paste it into every later request:

```javascript
const response = pm.response.json();
pm.environment.set("jwt_token", response.token);
```

Send it. Confirm you get a `200` back with a token in the body (assuming your login route returns it, not just sets the cookie).

Optionally: You can manually login, inpect element -> Application tab and record your jwt token there.

## 2. Decode and sanity-check the token (optional but useful)

Paste the `jwt_token` value into [jwt.io](https://jwt.io) and confirm the payload contains what you expect, e.g.:

```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "memberTypeAlias": "member"
}
```

If a claim is missing here, the bug is on the Node side — no point testing .NET yet.

## 3. Call a protected .NET endpoint with the Bearer token

**Request**

- Method: `GET`
- URL: `https://localhost:44343/umbraco/api/members/` (or whichever protected route you're testing)
- Authorization tab:
  - Type: `Bearer Token`
  - Token: `{{jwt_token}}`

Send it. A `200` with a list of claims confirms the token is valid and being read correctly. A `401` means the token isn't reaching .NET, isn't valid, or the scheme isn't wired up right.

## 4. Test the member creation endpoint

**Request**

- Method: `POST`
- URL: `https://localhost:44343/umbraco/api/members/`
- Body: none required (claims are read from the token, not the body)
- Authorization tab: Bearer Token → `{{jwt_token}}`

Expected responses:

| Status | Meaning |
| --- | --- |
| `200` | Member created or already exists (check `created` field in response) |
| `400` | Missing/invalid claims, or a validation error |
| `401` | Token missing, invalid, or expired |
| `409` | Member already exists (if using a strict conflict response instead of idempotent 200) |

## 5. Testing via cookie instead of Bearer header

If you want to test the cookie-based flow (`OnMessageReceived` reading from the `jwt` cookie) rather than a header:

1. Click **Cookies** under the Send button (or Settings → Cookies).
2. Add a domain matching your .NET server exactly, e.g. `localhost:44343`.
3. Add cookie: Name = `jwt`, Value = your token, Path = `/`.
4. Send the same request with **no** Authorization header set.

Postman stores cookies per domain — a cookie set by calling Node (`localhost:3000`) is not automatically available to a request against `localhost:44343`, so it needs to be added manually here.

## 6. Negative test cases worth checking

- **No token at all** → remove the Authorization header/cookie → expect `401`.
- **Malformed token** → change a character in the middle of `{{jwt_token}}` → expect `401`.
- **Expired token** → temporarily set `JWT_EXPIRES_IN=10s` on the Node side, wait 10+ seconds after login, then retry → expect `401`.
- **Tampered payload** → edit the decoded payload at jwt.io and use the resulting (differently-signed) token → expect `401`, since the recomputed signature won't match.

## Notes

- CORS restrictions are enforced by browsers, not Postman — a request succeeding here doesn't guarantee it'll succeed from your React app. Test CORS separately once the token flow itself is confirmed working.
- If the .NET server uses a self-signed local HTTPS certificate, Postman may show a certificate warning. This can be disabled per-request under **Settings → SSL certificate verification** for local testing only.
