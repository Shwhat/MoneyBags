# MoneyBags

A shared expense tracker for two people. MoneyBags records what each person paid, works out who owes whom with the same rules as the old Monthly Expenses spreadsheet, and keeps a running balance that both people see. It runs as one small Docker container on a home server.

Version 1.1.0. The full user guide is built into the program (Help > About MoneyBags, or F1) and lives in `ui/about/`.

## Features

- Expenses with date, vendor, category, who paid, split (Y joint, N paid for the other person, P personal), amount, cash back, amount saved and notes
- Personal expenses (P): the payer keeps the cost, it counts in their spending and never changes the balance
- Entry row for typing receipts one after another; vendor suggestions and category recall
- Balance today, per month and per year; each person's share
- Settle-up payments, credits and adjustments
- Recurring bills, including bills whose amount changes each month
- Categories that can be renamed, reordered and deleted
- Summary view: the month-by-month table and category totals
- Charts: each person's share by month, spending by category, the balance over time
- To-do panel for expenses that need a look
- Import from the old Excel workbooks with duplicate checks and review flags
- Export to CSV and Excel; backup download and restore; 60 daily backups on the server
- Two accounts, sign-in, one editor at a time with read-only for the other
- Ribbon, menus, dockable panels, workspaces, command line, keyboard shortcuts, light and dark themes
- Demo book and a built-in guide that works offline

## Install with Dockhand (main path)

On the Docker host:

```bash
sudo mkdir -p /opt/moneybags/data
sudo chown -R 65532:65532 /opt/moneybags/data
sudo ss -ltnp | grep ':8417 '    # no output means port 8417 is free
```

In Dockhand:

1. Add a Git stack: repository `https://github.com/Shwhat/MoneyBags`, compose path `docker-compose.yml`.
2. Enter any variables you want to change from `.env.example` (for example `MONEYBAGS_PORT` if 8417 is taken).
3. Deploy, then check the stack's logs for `MoneyBags 1.1.0 listening on :8080`.

Back on the Docker host, confirm it answers before adding the Cloudflare Tunnel route:

```bash
curl -I http://127.0.0.1:8417/login
```

Then add a public hostname to the existing Cloudflare Tunnel pointing to `http://SERVER_IP:8417`. No reverse proxy is needed.

Open the address, create the first account, then the second person creates theirs. Sign-up closes by itself after two accounts.

## Automatic updates

In Dockhand, turn on automatic image updates for the `moneybags` container with a schedule (for example weekly). GitHub Actions publishes a new image to `ghcr.io/shwhat/moneybags:latest` on every push to `main`; Dockhand pulls it and recreates the container. Optionally turn on Git auto sync so changes to `docker-compose.yml` redeploy the stack. Dockhand is the only update tool; there is no Watchtower service or label.

## Install from the command line

On the Docker host:

```bash
sudo mkdir -p /opt/moneybags/data && cd /opt/moneybags
sudo curl -fsSLO https://raw.githubusercontent.com/Shwhat/MoneyBags/main/docker-compose.yml
sudo curl -fsSL -o .env https://raw.githubusercontent.com/Shwhat/MoneyBags/main/.env.example
sudo nano .env                     # change the port or other settings if needed
sudo chown -R 65532:65532 data
sudo docker compose config -q
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100
curl -I http://127.0.0.1:8417/login
```

## Manual update

In Dockhand: pull and redeploy the stack.

On the command line (Docker host):

```bash
cd /opt/moneybags
sudo cp docker-compose.yml docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)
sudo cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
sudo docker compose pull
sudo docker compose up -d
sudo docker compose logs --tail=100
```

Never remove the stack with its volumes and never run `docker compose down -v`. Updates never require deleting the data folder.

## Backup

On the Docker host:

```bash
sudo tar -czf moneybags-$(date +%F).tar.gz -C /opt/moneybags data
```

Keep one copy off the Docker host, together with the stack's environment values (Dockhand) or `.env` and `docker-compose.yml`. The server also keeps the last save of each day for 60 days in `data/backups/`, and File > Download backup saves the book from the program. A Docker volume is not a backup.

To restore the whole server: stop the stack, put the `data` folder back owned by UID 65532, start the stack.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `MONEYBAGS_PORT` | `8417` | Port on the Docker host |
| `MONEYBAGS_DATA_DIR` | `/opt/moneybags/data` | Data folder on the Docker host (owned by UID 65532) |
| `TZ` | `America/Los_Angeles` | Time zone for the server log |
| `MONEYBAGS_SIGNUP` | `on` | `off` stops new accounts |
| `MONEYBAGS_MAX_USERS` | `2` | Most accounts; `0` means no limit |
| `MONEYBAGS_SECURE_COOKIE` | `auto` | Secure cookie over HTTPS (direct or through the tunnel); `always` or `never` force it |

## Keyboard shortcuts

| Keys | Action |
|---|---|
| N | New expense (entry row) |
| P | Settle-up payment |
| Enter / Tab / Escape (entry row) | Add / next field / clear |
| Up, Down, Shift+Up, Shift+Down | Select rows |
| Ctrl+A | Select all rows |
| Enter, double-click | Edit the selected row |
| Ctrl+D | Duplicate |
| Delete | Delete |
| Ctrl+Z, Ctrl+Y (Ctrl+Shift+Z) | Undo, redo |
| Ctrl+S | Save now |
| Alt+1 to Alt+5 | Expenses, Payments, Recurring bills, Summary, Charts |
| Page Up / Page Down | Previous / next month |
| Shift+Page Up / Shift+Page Down | Previous / next year |
| Ctrl+F | Search |
| F1 | About MoneyBags |
| Escape | Clear the selection, close About |

## Development

- `ui/index.html`, `ui/style.css`, `ui/manifest.txt` and `ui/js/*.js` make the interface; the server builds one page from them, with the About pages from `ui/about/*.md`.
- `python3 tools/assemble.py` writes the same page to `build/moneybags.html`; it runs without a server (the book is kept in the browser).
- `go vet ./... && go test ./...` tests the server.
- `npm install && npm test` runs the interface tests in headless Chromium (`npm test -- import` runs suites whose name contains "import").
- `tests/fixtures/make_fixture.py` rebuilds the sample workbooks used by the import tests (made-up data).
- `docs/HANDOFF.md` describes the project, its rules, the code map and where work stopped.
