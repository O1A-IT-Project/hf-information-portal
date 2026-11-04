# Setting Up the Heart Failure Information Portal (Ubuntu)

This guide explains how to download, configure and run the Heart Failure Information Portal on the Ubuntu laptop using Docker.

The application consists of:
- **Frontend:** React application
- **Backend:** Node.js application
- **CMS:** Umbraco
- **Database:** Microsoft SQL Server

Docker Compose manages the application services and their connections.

## 1. Prerequisites

The laptop uses:
- Ubuntu Linux
- Git
- Docker Engine
- Docker Compose plugin
- An internet connection

Docker commands in this guide use `sudo` because the current Ubuntu user may not have permission to access the Docker daemon directly.

Check Docker is installed:

```bash
sudo docker --version
sudo docker compose version
```

If Docker is installed but not running, start it:

```bash
sudo systemctl start docker
```

## 2. Download the project

Open a terminal and navigate to the directory where the project should be stored.

If the project has not previously been downloaded:

```bash
git clone https://github.com/O1A-IT-Project/hf-information-portal
cd hf-information-portal
```

If the project already exists on the laptop:

```bash
cd hf-information-portal
```

Check the current Git status:

```bash
git status
```

Make sure there are no local changes that need to be retained before updating.

Download the latest version from GitHub:

```bash
git pull origin main
```

This updates the local project to the latest version of the main branch.

## 3. Configure environment variables

The project uses environment variables to store passwords, authentication secrets and configuration settings.

The `.env.example` file contains the required variable names and serves as a template.

The actual `.env` file contains the local configuration and must not be committed to GitHub.

### Creating the .env file

If a `.env` file already exists, keep it. Do not overwrite it, as it may contain existing passwords and secrets.

If one does not exist, create it from the example:

```bash
cp .env.example .env
```

Open the file:

```bash
nano .env
```

Configure the following variables:

| Variable | Purpose |
|---|---|
| `SA_PASSWORD` | SQL Server administrator password |
| `CERT_PASSWORD` | HTTPS certificate password |
| `UMBRACO_ADMIN_EMAIL` | Umbraco administrator email |
| `UMBRACO_ADMIN_PASSWORD` | Umbraco administrator password |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `UMBRACO_SERVER` | Umbraco server address |

Use the existing credentials where available. Do not generate new passwords or JWT secrets when an existing database and configuration are being reused.

Please note that, when creating new passwords, there are complexity requirements, meaning that passwords should:
- Be at least 8 characters
- Have at least three of these four categories: Uppercase letters, Lowercase letters, Numbers, Special characters

The Google Maps API key must be obtained from the project's  `VITE_GOOGLE_MAPS_API_KEY`.

The Umbraco server URL should use the Docker-accessible address and port **8443**. Check the current `.env.example` and `compose.yml` for the expected URL format.

Save the file in nano using:
- `Ctrl + O`, then Enter to save.
- `Ctrl + X` to exit.

**Important:** Never commit `.env` to GitHub. It contains sensitive credentials and API keys.

## 4. Build and start Docker

Navigate to the project root directory if you are not already there.

Run:

```bash
sudo docker compose up -d --build
```

This command:
1. Builds the frontend, backend and Umbraco CMS images.
2. Starts the application containers.
3. Recreates services where necessary.
4. Starts the database if it is not already running.

The first build can take several minutes because Docker needs to download dependencies and build the application images.

Subsequent builds are generally faster because Docker can reuse cached layers.

## 5. Check that the containers are running

Run:

```bash
sudo docker compose ps
```

The application should have the following services running:

| Service | Purpose |
|---|---|
| `db` | SQL Server database |
| `cms` | Umbraco CMS |
| `backend` | Node.js backend |
| `website` | React frontend |

The `db-setup` service may show as exited after successfully completing its initial database setup. This is expected.

If a service is not running, inspect its logs:

```bash
sudo docker compose logs --tail=100 cms
```

Replace `cms` with `backend`, `website` or `db` to inspect another service.

To view logs from all services:

```bash
sudo docker compose logs --tail=100
```

## 6. Access the application

Once the containers are running, open the following addresses in a web browser:

| Application | Address |
|---|---|
| Frontend | http://localhost:5173 |
| Umbraco backoffice | https://localhost:8443/umbraco |
| Backend | http://localhost:3000 |

The browser may display a certificate warning when accessing the local HTTPS Umbraco address. This can occur when using a locally configured development certificate.

Log into the Umbraco backoffice using the administrator credentials configured in `.env`.

## 7. Updating the application in the future

When new changes are pushed to GitHub, the application can be updated without manually downloading the project again.

First, navigate to the project directory:

```bash
cd hf-information-portal
```

Check Git status:

```bash
git status
```

Pull the latest changes:

```bash
git pull origin main
```

Rebuild and restart the application:

```bash
sudo docker compose up -d --build
```

Check the containers:

```bash
sudo docker compose ps
```

The local `.env` file is ignored by Git, so pulling new changes should not overwrite the local passwords, secrets or configuration.

## 8. Stopping and restarting the application

To stop the application containers:

```bash
sudo docker compose stop
```

To start them again without rebuilding:

```bash
sudo docker compose up -d
```

To restart the application services:

```bash
sudo docker compose restart
```

**Important:** Avoid using `sudo docker compose down -v` during normal operation. The `-v` option can delete database volumes and cause existing database data to be lost.

---

## Quick reference

The most commonly used commands are:

| Task | Command |
|---|---|
| Check Docker | `sudo docker --version` |
| Check Git status | `git status` |
| Pull latest code | `git pull origin main` |
| Build and start | `sudo docker compose up -d --build` |
| Check containers | `sudo docker compose ps` |
| View logs | `sudo docker compose logs --tail=100` |
| Stop containers | `sudo docker compose stop` |
| Start containers | `sudo docker compose up -d` |
| Restart containers | `sudo docker compose restart` |

**Database preservation:** Docker uses persistent volumes for database storage. Rebuilding or restarting the application should not delete existing database data, provided the volumes are not manually removed.