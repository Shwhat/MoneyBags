package main

// Data folder layout (all paths under the data directory):
//
//	users.json             accounts
//	sessions.json          sign-in sessions (token hashes only)
//	book.json              the shared expense book (everything both people see)
//	book-meta.json         revision number, last save time and who saved it
//	backups/book-<date>.json  one copy of the book per day, the last 60 days are kept
//	users/<id>/prefs.json  per-user preferences (theme, panels, ribbon)

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type User struct {
	ID      string    `json:"id"`
	Name    string    `json:"name"`
	Salt    string    `json:"salt"`
	Hash    string    `json:"hash"`
	Iter    int       `json:"iter"`
	Created time.Time `json:"created"`
}

type Session struct {
	User    string    `json:"user"`
	Expires time.Time `json:"expires"`
}

type Lock struct {
	User  string    `json:"user"`
	Until time.Time `json:"until"`
}

type BookMeta struct {
	Rev       int       `json:"rev"`
	Updated   time.Time `json:"updated"`
	UpdatedBy string    `json:"updatedBy"`
}

// BookInfo is what the interface is told about the book.
type BookInfo struct {
	Rev           int       `json:"rev"`
	Updated       time.Time `json:"updated"`
	UpdatedByName string    `json:"updatedByName"`
	LockedBy      string    `json:"lockedBy"`
}

// files the interface may read and write through /api/data; all are kept per user
var dataFiles = map[string]bool{"prefs.json": true}

const backupKeep = 60

var (
	errNotFound = errors.New("not found")
	errConflict = errors.New("conflict")
	errLocked   = errors.New("locked")
)

type Store struct {
	dir      string
	mu       sync.Mutex
	users    []*User
	sessions map[string]*Session
	meta     BookMeta
	lock     *Lock
}

func newID() string {
	b := make([]byte, 12)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

// writeAtomic writes through a temporary file and a rename so a crash never leaves half a file.
func writeAtomic(path string, data []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o750); err != nil {
		return err
	}
	tmp := path + ".tmp"
	f, err := os.OpenFile(tmp, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o640)
	if err != nil {
		return err
	}
	if _, err = f.Write(data); err == nil {
		err = f.Sync()
	}
	if cerr := f.Close(); err == nil {
		err = cerr
	}
	if err != nil {
		os.Remove(tmp)
		return err
	}
	return os.Rename(tmp, path)
}

func readJSON(path string, v any) error {
	b, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	return json.Unmarshal(b, v)
}

func writeJSON(path string, v any) error {
	b, err := json.MarshalIndent(v, "", " ")
	if err != nil {
		return err
	}
	return writeAtomic(path, b)
}

func openStore(dir string) (*Store, error) {
	if err := os.MkdirAll(filepath.Join(dir, "backups"), 0o750); err != nil {
		return nil, err
	}
	s := &Store{dir: dir, sessions: map[string]*Session{}}
	var u struct{ Users []*User }
	if err := readJSON(filepath.Join(dir, "users.json"), &u); err != nil {
		return nil, err
	}
	s.users = u.Users
	if err := readJSON(filepath.Join(dir, "sessions.json"), &s.sessions); err != nil {
		return nil, err
	}
	if s.sessions == nil {
		s.sessions = map[string]*Session{}
	}
	if err := readJSON(filepath.Join(dir, "book-meta.json"), &s.meta); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) saveUsers() error {
	return writeJSON(filepath.Join(s.dir, "users.json"), struct {
		Users []*User `json:"users"`
	}{s.users})
}
func (s *Store) saveSessions() error {
	return writeJSON(filepath.Join(s.dir, "sessions.json"), s.sessions)
}

// ---------- users ----------

func (s *Store) userByName(name string) *User {
	for _, u := range s.users {
		if strings.EqualFold(u.Name, name) {
			return u
		}
	}
	return nil
}

func (s *Store) userByID(id string) *User {
	for _, u := range s.users {
		if u.ID == id {
			return u
		}
	}
	return nil
}

func (s *Store) userName(id string) string {
	if u := s.userByID(id); u != nil {
		return u.Name
	}
	return ""
}

func (s *Store) UserCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.users)
}

func (s *Store) AddUser(name, password string, max int) (*User, error) {
	salt, hash, iter := hashPassword(password) // slow; done before taking the lock
	s.mu.Lock()
	defer s.mu.Unlock()
	if max > 0 && len(s.users) >= max {
		return nil, errLocked
	}
	if s.userByName(name) != nil {
		return nil, errConflict
	}
	u := &User{ID: newID(), Name: name, Salt: salt, Hash: hash, Iter: iter, Created: time.Now().UTC()}
	s.users = append(s.users, u)
	if err := s.saveUsers(); err != nil {
		s.users = s.users[:len(s.users)-1]
		return nil, err
	}
	return u, nil
}

// CheckPassword returns the user when name and password match.
func (s *Store) CheckPassword(name, password string) *User {
	s.mu.Lock()
	u := s.userByName(name)
	var cp User
	if u != nil {
		cp = *u
	}
	s.mu.Unlock()
	if u == nil {
		verifyPassword(password, dummySalt, dummyHash, defaultIter) // same cost as a real check
		return nil
	}
	if !verifyPassword(password, cp.Salt, cp.Hash, cp.Iter) {
		return nil
	}
	return u
}

func (s *Store) SetPassword(id, password string) error {
	salt, hash, iter := hashPassword(password)
	s.mu.Lock()
	defer s.mu.Unlock()
	u := s.userByID(id)
	if u == nil {
		return errNotFound
	}
	u.Salt, u.Hash, u.Iter = salt, hash, iter
	// end every other session of this user
	for k, v := range s.sessions {
		if v.User == id {
			delete(s.sessions, k)
		}
	}
	if err := s.saveSessions(); err != nil {
		return err
	}
	return s.saveUsers()
}

type UserInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (s *Store) Users() []UserInfo {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]UserInfo, 0, len(s.users))
	for _, u := range s.users {
		out = append(out, UserInfo{u.ID, u.Name})
	}
	sort.Slice(out, func(i, j int) bool { return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name) })
	return out
}

// ---------- sessions ----------

const sessionLife = 30 * 24 * time.Hour

func (s *Store) NewSession(userID string) (string, error) {
	tok := newID() + newID()
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for k, v := range s.sessions {
		if now.After(v.Expires) {
			delete(s.sessions, k)
		}
	}
	s.sessions[tokenKey(tok)] = &Session{User: userID, Expires: now.Add(sessionLife).UTC()}
	return tok, s.saveSessions()
}

// Session returns the signed-in user for a token and extends the session when it is more than a day old.
func (s *Store) Session(tok string) *User {
	if tok == "" {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	k := tokenKey(tok)
	se := s.sessions[k]
	if se == nil {
		return nil
	}
	now := time.Now()
	if now.After(se.Expires) {
		delete(s.sessions, k)
		s.saveSessions()
		return nil
	}
	if se.Expires.Sub(now) < sessionLife-24*time.Hour {
		se.Expires = now.Add(sessionLife).UTC()
		s.saveSessions()
	}
	return s.userByID(se.User)
}

func (s *Store) EndSession(tok string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, tokenKey(tok))
	s.saveSessions()
}

// ---------- the book ----------

const lockLife = 2 * time.Minute

func (s *Store) bookPath() string { return filepath.Join(s.dir, "book.json") }

func (s *Store) info() BookInfo {
	i := BookInfo{Rev: s.meta.Rev, Updated: s.meta.Updated, UpdatedByName: s.userName(s.meta.UpdatedBy)}
	if s.lock != nil && time.Now().Before(s.lock.Until) {
		i.LockedBy = s.userName(s.lock.User)
	}
	return i
}

func (s *Store) Info() BookInfo {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.info()
}

// GetBook returns the book content, or an empty string when nothing has been saved yet.
func (s *Store) GetBook() (BookInfo, []byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, err := os.ReadFile(s.bookPath())
	if errors.Is(err, os.ErrNotExist) {
		return s.info(), nil, nil
	}
	return s.info(), b, err
}

// SaveBook writes a new version of the book. The caller must hold the edit lock, and rev must be the revision the
// caller last loaded, so a save never silently replaces someone else's changes.
func (s *Store) SaveBook(uid string, rev int, content []byte) (BookInfo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	if s.lock != nil && s.lock.User != uid && now.Before(s.lock.Until) {
		return s.info(), errLocked
	}
	if rev != s.meta.Rev {
		return s.info(), errConflict
	}
	if err := writeAtomic(s.bookPath(), content); err != nil {
		return s.info(), err
	}
	s.meta = BookMeta{Rev: s.meta.Rev + 1, Updated: now.UTC(), UpdatedBy: uid}
	if err := writeJSON(filepath.Join(s.dir, "book-meta.json"), s.meta); err != nil {
		return s.info(), err
	}
	s.lock = &Lock{User: uid, Until: now.Add(lockLife).UTC()}
	s.backup(content, now)
	return s.info(), nil
}

// backup keeps one copy of the book per day (the last save of the day) and removes copies older than backupKeep days.
func (s *Store) backup(content []byte, now time.Time) {
	dir := filepath.Join(s.dir, "backups")
	if err := writeAtomic(filepath.Join(dir, "book-"+now.Format("2006-01-02")+".json"), content); err != nil {
		return
	}
	names, _ := filepath.Glob(filepath.Join(dir, "book-*.json"))
	sort.Strings(names)
	for len(names) > backupKeep {
		os.Remove(names[0])
		names = names[1:]
	}
}

// Backups lists the daily copies, newest first.
func (s *Store) Backups() []string {
	names, _ := filepath.Glob(filepath.Join(s.dir, "backups", "book-*.json"))
	out := []string{}
	for _, n := range names {
		out = append(out, strings.TrimSuffix(strings.TrimPrefix(filepath.Base(n), "book-"), ".json"))
	}
	sort.Sort(sort.Reverse(sort.StringSlice(out)))
	return out
}

func (s *Store) ReadBackup(day string) ([]byte, error) {
	if _, err := time.Parse("2006-01-02", day); err != nil {
		return nil, errNotFound
	}
	b, err := os.ReadFile(filepath.Join(s.dir, "backups", "book-"+day+".json"))
	if errors.Is(err, os.ErrNotExist) {
		return nil, errNotFound
	}
	return b, err
}

// TakeLock gives the user the edit lock if nobody else holds it. It returns the book info either way.
func (s *Store) TakeLock(uid string) (BookInfo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	if s.lock != nil && s.lock.User != uid && now.Before(s.lock.Until) {
		return s.info(), errLocked
	}
	s.lock = &Lock{User: uid, Until: now.Add(lockLife).UTC()}
	return s.info(), nil // locks are short-lived and not written to disk
}

func (s *Store) ReleaseLock(uid string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.lock != nil && s.lock.User == uid {
		s.lock = nil
	}
}

// ---------- per-user data files ----------

func (s *Store) dataPath(uid, name string) (string, bool) {
	if !dataFiles[name] {
		return "", false
	}
	return filepath.Join(s.dir, "users", uid, name), true
}

func (s *Store) ReadData(uid, name string) ([]byte, error) {
	p, ok := s.dataPath(uid, name)
	if !ok {
		return nil, errNotFound
	}
	b, err := os.ReadFile(p)
	if errors.Is(err, os.ErrNotExist) {
		return []byte{}, nil
	}
	return b, err
}

func (s *Store) WriteData(uid, name string, content []byte) error {
	p, ok := s.dataPath(uid, name)
	if !ok {
		return errNotFound
	}
	if !json.Valid(content) {
		return errConflict
	}
	return writeAtomic(p, content)
}
