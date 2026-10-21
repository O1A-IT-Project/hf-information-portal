# README - Docker

Old compose.yml file was changed

Old hf-db container no longer in use

Backend .env untouched - can be used if npm run dev (effectively by hand) is called,
but otherwise not needed.

Passwords found in .env, not in the GitHub

On first run, db-setup runs, creating the login tables. This is a service included in compose.yml. It runs setup.sh if they don't already exist

Umbraco creates its database and makes the admin user as can be found in .env. Content is imported through uSync.

The site runs at <http://localhost:5173/hf-information-portal/>

Umbraco backoffice at <https://localhost:8443/umbraco>

Production hosting is not done, the option for Azure is open

## Requirements
 
- **Docker Desktop**, running, with at least 4 GB of memory assigned to it.
- **Git**.
- **.NET SDK** (only needed once, to create the HTTPS certificate).
- Free ports: 5173, 3000, 8443 and 1345.
On an Apple Silicon Mac, SQL Server runs through emulation. If it is very slow or won't start, turn on "Use Rosetta for x86_64/amd64 emulation" in Docker Desktop's settings.
 
## First-time setup
 
1. **Get the project**
```
   git clone <repository-url>
   cd <project-folder>
```
 
2. **Create the HTTPS certificate.** Choose a password and remember it, because you need it in step 3.
```
   dotnet dev-certs https -ep cms/aspnetapp.pfx -p YOUR_CERT_PASSWORD
```
 
   No .NET SDK? This does the same with OpenSSL:
 
```
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"
   openssl pkcs12 -export -out cms/aspnetapp.pfx -inkey key.pem -in cert.pem -passout pass:YOUR_CERT_PASSWORD
```
 
   Check that `cms/aspnetapp.pfx` exists and is a file. If it is missing, Docker creates a folder with that name and Umbraco will not start.
 
3. **Create your settings file.** Copy the template, then fill in every value:
```
   cp .env.example .env
```
 
   See "Configuration" below for what each value is. Do not use the characters `$`, `;` or `=` in any value.
 
4. **Start everything**
```
   docker compose up --build
```
 
   The first run takes several minutes (it downloads and builds everything), plus another minute or two while Umbraco sets itself up. Add `-d` to run in the background.
 
5. **Open the website:** <http://localhost:5173/hf-information-portal/>

### Relevant files:

- `compose.yml`: the main startup file, which defines 5 services: `db`, `db-setup`, `cms`, `backend` and `website`. Also creates 2 storage volumes: `hf-sql-data` and `cms-media`
- `backend/Dockerfile`: packages the login server
- `client/Dockerfile`: builds the React site
- `backend/database.setup.sh`: creates the login database from `schema.sql` if the tables don't exist yet
- nginx.conf: the web server's rulebook, where `/umbraco/` and `/media/`
- `cms/Dockerfile`: builds the Umbraco system
- `aspnet.pfx`: HTTPS certificate and contains a private key. Not committed for this reason
- `vite.config.ts`: turns React and TS code into HTML, JavaScript and CSS for the website