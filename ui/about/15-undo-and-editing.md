# Undo and editing

This page covers undo and redo, how changes are saved, and how two people share one book.

## Undo and redo

- **Undo** (Ctrl+Z) reverses the last change to the book. **Redo** (Ctrl+Y or Ctrl+Shift+Z) applies it again.
- Every change can be undone: adding, changing, duplicating and deleting rows, imports, restores, category and book settings, recurring bills and the expenses they add.
- Up to 150 steps are kept, from when the page was opened. Reloading or closing the page clears them.
- Making a new change after an undo clears the redo steps.
- Undo and redo change the shared book and are saved like any other change.
- Preferences (theme, panels, ribbon, sort) are not part of undo.

## Saving

- On the server, a change is saved about 0.7 seconds after it is made. **Save now** (Ctrl+S) saves at once.
- The status bar shows the state: Changes waiting to save, Saving..., All changes saved, or Not saved with the reason. When a save fails it is tried again with the next change and every 45 seconds.
- Closing or reloading the page while a change is waiting asks the browser to confirm leaving, and saves.
- Without a server, the book is kept in the browser's storage and the status bar shows "Saved in this browser".

## One editor at a time

- The first person to open the book holds the edit lock. The lock is renewed every 45 seconds and lapses 2 minutes after the page stops renewing it (for example when the computer sleeps). Closing the page or signing out releases it at once.
- The other person sees the book read-only: the header shows "Read-only while (name) edits", the entry rows and the Properties panel fields are hidden or greyed, and any change shows "Read-only: (name) is editing the book".
- Every 45 seconds the read-only page asks for the lock again. When it is free, the page loads the latest book, can be edited, and shows "You can edit the book again".
- If a computer slept past its lock and the other person saved in the meantime, the next save shows **Book changed on the server** with two choices: **Load their version** (drops the unsaved changes on this computer) or **Keep my version** (replaces the other person's latest changes).

## The demo book

While the demo book is open, every change works but nothing is saved, and the header shows "Demo book, changes are not saved". **Close the demo book** returns to the real book and its undo steps as they were.
