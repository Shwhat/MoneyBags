# Accounts and sign-in

Each person has an account on the MoneyBags server. Accounts sign in to the same shared book.

## Creating an account

- The sign-in page has **Sign in** and **Create account** tabs. When no account exists, it opens on Create account and says so.
- User names are 3 to 32 letters, digits, dots, dashes or underscores, starting with a letter or digit. Names are unique, ignoring case.
- Passwords need at least 8 characters (at most 200). Create account asks for the password twice.
- New accounts close by themselves once the account limit is reached (2 by default), and the Create account tab disappears. The server settings MONEYBAGS_SIGNUP and MONEYBAGS_MAX_USERS control this; see [Technical](/about/technical).

## Signing in

- Enter the user name (any case) and password, then **Sign in**.
- After 5 wrong passwords for one user name within 5 minutes, or 30 failed attempts from one address within 15 minutes, sign-in waits: "Too many attempts. Try again in a few minutes."
- A session lasts 30 days and is extended by each day of use. Signing in on another device starts another session.

## Which person you are

The book's two people and the accounts are separate. MoneyBags matches the signed-in user name to a person's name (or first name), ignoring case, to set the default **Paid by**. When nothing matches, the first person is used. **File > Book settings** can set the default payer for your account instead.

## Changing the password

**Account menu > Change password...** asks for the current password and the new one twice. Every other session of the account is signed out; this one stays signed in.

## Signing out

**Account menu > Sign out** saves any waiting change, releases the edit lock and returns to the sign-in page.

## Security

- Passwords are stored as PBKDF2-SHA256 hashes with 600,000 iterations and a random salt; the password itself is never stored.
- The session cookie cannot be read by scripts. It is marked secure when the page arrives over HTTPS (MONEYBAGS_SECURE_COOKIE).
- Every request that changes something carries a header that other websites cannot add, so other sites cannot act for a signed-in user.
- The data folder holds session hashes only, so a copy of it cannot be used to sign in.
