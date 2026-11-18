# Storage and backups

This page covers where MoneyBags keeps its data, the backups it makes, and how to restore.

## Where the data is

On the server, everything is in one data folder (by default /opt/moneybags/data on the Docker host, /data inside the container).

| File | Contents |
|---|---|
| book.json | The shared book: people, categories, expenses, payments, recurring bills |
| book-meta.json | The book's revision number, when it was last saved and by whom |
| backups/book-YYYY-MM-DD.json | The last save of each day |
| users.json | Accounts (names and password hashes) |
| sessions.json | Sign-in sessions (hashes only) |
| users/(id)/prefs.json | Each account's preferences |

Every file is written to a temporary file first and then renamed, so a crash or power loss never leaves half a file.

Without a server, the book and preferences are kept in the browser's storage for that browser only.

## Automatic backups

- Each save also writes that day's copy in the backups folder, so each day keeps its last save.
- The newest 60 daily copies are kept; older ones are removed.
- These copies are on the same disk as the book. Copy the data folder to another machine as well; see below.

## Downloading a backup

**File > Download backup (.json)** saves moneybags-backup-YYYY-MM-DD.json with the whole book, the app version and the time.

## Restoring

| Command | Restores from |
|---|---|
| File > Restore from backup file... | A downloaded backup, or a book.json or daily copy from the data folder |
| File > Restore from server backup... | One of the server's daily copies, chosen by date (server only) |

Both show how many expenses and settle-up entries the backup has and the book has now, and ask before replacing the whole book. Undo reverses a restore until the page is closed. A file that is not a MoneyBags backup is refused.

## Backing up the server

On the Docker host, copy the data folder and the stack settings, and keep one copy off the Docker host:

```
sudo tar -czf moneybags-$(date +%F).tar.gz -C /opt/moneybags data
```

The stack's environment values (in Dockhand, or in /opt/moneybags/.env) and docker-compose.yml are needed to rebuild the stack. A Docker volume is not a backup.

To restore the whole server, stop the stack, put the data folder back (owned by UID 65532), and start the stack again.
