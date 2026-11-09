# Running the Project (Frontend + Umbraco CMS)

This project has two parts that must run **at the same time**, each in its own terminal tab:

- `client/` — React frontend (Vite)
- `cms/` — Umbraco CMS (headless, SQL Server backend)

## Prerequisites (one-time setup)

- [.NET SDK](https://dotnet.microsoft.com/download) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js + npm installed

## 1. Start SQL Server (Docker)

```bash
docker start umbraco-sql
```

If the container doesn't exist yet on your machine, create it once:
Make sure to change "YOUR_PASSWORD" to your own.

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YOUR_PASSWORD" \
  -p 1345:1433 --name umbraco-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Check it's running:

```bash
docker ps
```

## 2. Set up your local secrets (one-time, per machine)

From inside `cms/`:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:umbracoDbDSN" "Server=localhost,1345;Database=UmbracoCms;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True"
dotnet user-secrets set "ConnectionStrings:umbracoDbDSN_ProviderName" "Microsoft.Data.SqlClient"
```

Never commit real passwords — these live only in user-secrets, not in `appsettings.json`.

## 3. Start Umbraco

```bash
cd cms
dotnet run
```

On first run against a fresh database, follow the install wizard at `/umbraco`. Once your document types/content are set up, uSync automatically imports the committed schema/content from the `uSync/` folder — nothing to configure manually.

Note the URL it prints (e.g. `http://localhost:58609`) — the frontend's dev server proxies API calls here.

If the database connection fails, ensure you connect to it via docker exec
then run the following.

```bash
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YOUR_PASSWORD' -NO
```

Then within docker:

```bash
CREATE DATABASE UmbracoCms;
GO
```

## 4. Start the frontend

In a separate terminal tab:

```bash
cd client
npm install   # first time only
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`).

## Stopping everything

- Frontend: `Ctrl+C` in its terminal
- Umbraco: `Ctrl+C` in its terminal
- SQL Server: `docker stop umbraco-sql` (optional — safe to leave running between sessions)

## Troubleshooting

- **`ECONNREFUSED` / proxy errors on the frontend** → Umbraco isn't running yet, or SQL Server container is stopped. Start both (steps 1 and 3) before the frontend.
- **Umbraco won't boot / database errors** → confirm `docker ps` shows `umbraco-sql` as "Up," and that your user-secrets connection string matches the container's password.

## Docker - convenient commands

To rebuild just one part, add its service name from docker-compose.yml to the command. For example, to rebuild and restart only cms:

zsh

```bash
docker compose up -d --build cms
```

Your service names so far are cms, website, and backend. You can list them all with docker compose config --services.

Task Command
Rebuild and restart one service

```bash
docker compose up -d --build cms
```

Rebuild several services

```bash
docker compose up -d --build cms website
```

### Additional docker commands

Rebuild without restarting docker compose build cms
Rebuild from scratch, ignoring the cache docker compose build --no-cache cms, then docker compose up -d cms
Restart without rebuilding docker compose restart cms
Apply docker-compose.yml changes without rebuilding docker compose up -d cms
Rebuild one service without touching its dependencies

### Secret Set Up Umbraco

Using the command:

```bash
dotnet user-secrets set key val
```

Set the below:

Jwt:Secret =  Your_JWT_Secret_Key
ConnectionStrings:umbracoDbDSN_ProviderName = Microsoft.Data.SqlClient
ConnectionStrings:umbracoDbDSN = Server=localhost,1345;Database=UmbracoCms;User Id=sa;Password=YOURPASSWORD;TrustServerCertificate=True;
