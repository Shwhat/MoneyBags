# Technical

## Architecture

| Part | Technology |
|---|---|
| Interface | HTML, CSS and JavaScript in one page, with no framework and no outside downloads |
| Server | One Go program (standard library only) that serves the page and stores the data |
| Data | JSON files in one data folder, written atomically |
| Container | A Docker image built from scratch that holds only the server program, running as user 65532 |
| Images | Published to ghcr.io/shwhat/moneybags for amd64 and arm64 by GitHub Actions on every push to main |
| Tests | Go tests for the server; Playwright in headless Chromium for the interface |

## Installing with Dockhand

On the Docker host:

```
sudo mkdir -p /opt/moneybags/data
sudo chown -R 65532:65532 /opt/moneybags/data
sudo ss -ltnp | grep ':8417 '
```

No output from the last command means port 8417 is free. In Dockhand, add a Git stack with the repository https://github.com/Shwhat/MoneyBags and the compose path docker-compose.yml, enter any variables to change from the table below, and deploy. Check the stack's logs for "MoneyBags 1.1.0 listening on :8080". Then, on the Docker host:

```
curl -I http://127.0.0.1:8417/login
```

A 200 answer means MoneyBags works. Add the Cloudflare Tunnel hostname route to SERVER_IP:8417 only after that.

## Installing from the command line

On the Docker host:

```
sudo mkdir -p /opt/moneybags/data && cd /opt/moneybags
sudo curl -fsSLO https://raw.githubusercontent.com/Shwhat/MoneyBags/main/docker-compose.yml
sudo curl -fsSL -o .env https://raw.githubusercontent.com/Shwhat/MoneyBags/main/.env.example
sudo chown -R 65532:65532 data
sudo docker compose config -q
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100
```

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| MONEYBAGS_PORT | 8417 | Port on the Docker host |
| MONEYBAGS_DATA_DIR | /opt/moneybags/data | Data folder on the Docker host; must be owned by UID 65532 |
| TZ | America/Los_Angeles | Time zone for the server log |
| MONEYBAGS_SIGNUP | on | off: no new accounts |
| MONEYBAGS_MAX_USERS | 2 | Most accounts allowed; 0 means no limit |
| MONEYBAGS_SECURE_COOKIE | auto | auto: secure cookie over HTTPS (directly or through a tunnel that sets X-Forwarded-Proto); always or never force it |
| MONEYBAGS_ADDR | :8080 | Address inside the container (set in the image) |
| MONEYBAGS_DATA | /data | Data folder inside the container (set in the image) |

## Updates

- **Automatic:** in Dockhand, turn on automatic image updates for the moneybags container with a schedule. Dockhand pulls each new image GitHub Actions publishes and recreates the container.
- **Manual:** in Dockhand, pull and redeploy the stack. On the command line: back up docker-compose.yml and .env, then run `sudo docker compose pull` and `sudo docker compose up -d`.
- Data in the data folder is kept across updates. A new version never requires deleting it. Never remove the stack with its volumes and never run `docker compose down -v`.
- The version is shown at the top of this guide and in the server log.

## Health

The container checks itself every 30 seconds by running the program with -healthcheck, which asks /healthz on the server. Dockhand and `docker compose ps` show the result.

## Server addresses

| Address | Purpose |
|---|---|
| / | The program (redirects to /login when signed out) |
| /login | Sign-in page |
| /about, /about/(page) | Open this guide at a page |
| /healthz | Health check |
| /api/... | The interface's requests (JSON); changing requests need the X-MoneyBags header |

## Third-party components

| Component | Used for | License |
|---|---|---|
| Go standard library | The server | BSD-3-Clause |
| Docker image golang:1.24-alpine | Building the server (not shipped) | BSD-3-Clause and others |
| Playwright | Tests only (not shipped) | Apache-2.0 |

The interface uses no outside libraries. The Excel reader and writer, the charts and the Markdown for this guide are part of MoneyBags.
