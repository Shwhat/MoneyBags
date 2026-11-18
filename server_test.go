package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"strings"
	"testing"
)

func init() { defaultIter = 1000 } // fast password hashing in tests

type client struct {
	t   *testing.T
	c   *http.Client
	url string
}

func newTestServer(t *testing.T, cfg config) (*httptest.Server, *server) {
	t.Helper()
	cfg.Data = t.TempDir()
	if cfg.Secure == "" {
		cfg.Secure = "auto"
	}
	s, err := newServer(cfg)
	if err != nil {
		t.Fatal(err)
	}
	ts := httptest.NewServer(s.routes())
	t.Cleanup(ts.Close)
	return ts, s
}

func newClient(t *testing.T, ts *httptest.Server) *client {
	jar, _ := cookiejar.New(nil)
	return &client{t: t, c: &http.Client{Jar: jar, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}, url: ts.URL}
}

func (c *client) do(method, path string, body any, header bool) (int, map[string]any, string) {
	c.t.Helper()
	var rd io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		rd = bytes.NewReader(b)
	}
	req, _ := http.NewRequest(method, c.url+path, rd)
	if header {
		req.Header.Set("X-MoneyBags", "1")
	}
	res, err := c.c.Do(req)
	if err != nil {
		c.t.Fatal(err)
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(res.Body)
	var m map[string]any
	json.Unmarshal(raw, &m)
	return res.StatusCode, m, string(raw)
}

func (c *client) signup(name string) int {
	code, _, _ := c.do("POST", "/api/signup", map[string]string{"name": name, "password": "password123"}, true)
	return code
}

func TestAccountsAndLimits(t *testing.T) {
	ts, _ := newTestServer(t, config{Signup: true, MaxUsers: 2})
	a, b, c := newClient(t, ts), newClient(t, ts), newClient(t, ts)
	if _, m, _ := a.do("GET", "/api/config", nil, false); m["firstUser"] != true || m["signup"] != true {
		t.Fatalf("config before any account: %v", m)
	}
	if code := a.signup("devon"); code != 200 {
		t.Fatalf("first signup: %d", code)
	}
	if code := b.signup("Devon"); code != 409 {
		t.Fatalf("same name, other case, must be taken: %d", code)
	}
	if code := b.signup("alex"); code != 200 {
		t.Fatalf("second signup: %d", code)
	}
	if code := c.signup("third"); code != 403 {
		t.Fatalf("third account must be refused: %d", code)
	}
	if _, m, _ := c.do("GET", "/api/config", nil, false); m["signup"] != false {
		t.Fatalf("sign-up must close at the limit: %v", m)
	}
	if code, _, _ := c.do("POST", "/api/login", map[string]string{"name": "devon", "password": "wrong-password"}, true); code != 401 {
		t.Fatalf("wrong password: %d", code)
	}
	if code, _, _ := c.do("POST", "/api/login", map[string]string{"name": "devon", "password": "password123"}, false); code != 403 {
		t.Fatalf("missing header must be refused: %d", code)
	}
	if code, m, _ := c.do("POST", "/api/login", map[string]string{"name": "devon", "password": "password123"}, true); code != 200 || m["name"] != "devon" {
		t.Fatalf("login: %d %v", code, m)
	}
	if code, _, _ := newClient(t, ts).do("GET", "/api/book", nil, false); code != 401 {
		t.Fatalf("signed out must get 401: %d", code)
	}
	if code, _, _ := a.do("POST", "/api/password", map[string]string{"old": "password123", "new": "short"}, true); code != 400 {
		t.Fatalf("short password: %d", code)
	}
	if code, _, _ := a.do("POST", "/api/password", map[string]string{"old": "password123", "new": "newpassword1"}, true); code != 200 {
		t.Fatalf("change password: %d", code)
	}
	if code, _, _ := c.do("GET", "/api/me", nil, false); code != 401 {
		t.Fatalf("changing the password must end other sessions: %d", code)
	}
}

func TestSignupOff(t *testing.T) {
	ts, _ := newTestServer(t, config{Signup: false, MaxUsers: 2})
	if code := newClient(t, ts).signup("devon"); code != 403 {
		t.Fatalf("sign-up off: %d", code)
	}
}

func TestBookLockAndRevisions(t *testing.T) {
	ts, _ := newTestServer(t, config{Signup: true, MaxUsers: 2})
	a, b := newClient(t, ts), newClient(t, ts)
	a.signup("devon")
	b.signup("alex")
	if code, m, _ := a.do("GET", "/api/book", nil, false); code != 200 || m["content"] != "" {
		t.Fatalf("empty book: %d %v", code, m)
	}
	if code, _, _ := a.do("POST", "/api/book/lock", nil, true); code != 200 {
		t.Fatalf("lock: %d", code)
	}
	code, m, _ := b.do("POST", "/api/book/lock", nil, true)
	if code != 409 || m["error"] != "locked" || m["book"].(map[string]any)["lockedBy"] != "devon" {
		t.Fatalf("second editor must be refused: %d %v", code, m)
	}
	if code, _, _ := b.do("PUT", "/api/book", map[string]any{"rev": 0, "content": `{"expenses":[]}`}, true); code != 409 {
		t.Fatalf("save without the lock: %d", code)
	}
	if code, _, _ := a.do("PUT", "/api/book", map[string]any{"rev": 0, "content": "not json"}, true); code != 400 {
		t.Fatalf("bad content: %d", code)
	}
	code, m, _ = a.do("PUT", "/api/book", map[string]any{"rev": 0, "content": `{"expenses":[1]}`}, true)
	if code != 200 || m["rev"].(float64) != 1 || m["updatedByName"] != "devon" {
		t.Fatalf("save: %d %v", code, m)
	}
	if code, m, _ := a.do("PUT", "/api/book", map[string]any{"rev": 0, "content": `{}`}, true); code != 409 || m["error"] != "conflict" {
		t.Fatalf("old revision must conflict: %d %v", code, m)
	}
	a.do("POST", "/api/book/unlock", nil, true)
	if code, _, _ := b.do("POST", "/api/book/lock", nil, true); code != 200 {
		t.Fatalf("lock after unlock: %d", code)
	}
	if _, m, _ := b.do("GET", "/api/book", nil, false); m["content"] != `{"expenses":[1]}` {
		t.Fatalf("book content: %v", m)
	}
	_, _, raw := b.do("GET", "/api/backups", nil, false)
	var days []string
	json.Unmarshal([]byte(raw), &days)
	if len(days) != 1 {
		t.Fatalf("one daily backup expected: %s", raw)
	}
	if code, _, body := b.do("GET", "/api/backups/"+days[0], nil, false); code != 200 || body != `{"expenses":[1]}` {
		t.Fatalf("backup content: %d %s", code, body)
	}
	if code, _, _ := b.do("GET", "/api/backups/../users", nil, false); code == 200 {
		t.Fatal("backup names must be dates")
	}
}

func TestDataFilesAndPages(t *testing.T) {
	ts, s := newTestServer(t, config{Signup: true})
	a := newClient(t, ts)
	if code, _, _ := a.do("GET", "/", nil, false); code != 303 {
		t.Fatalf("signed-out app page must redirect to /login: %d", code)
	}
	a.signup("devon")
	if code, _, _ := a.do("PUT", "/api/data/prefs.json", map[string]string{"theme": "dark"}, true); code != 200 {
		t.Fatalf("write prefs: %d", code)
	}
	if _, m, _ := a.do("GET", "/api/data/prefs.json", nil, false); m["theme"] != "dark" {
		t.Fatalf("read prefs: %v", m)
	}
	if code, _, _ := a.do("PUT", "/api/data/other.json", map[string]string{}, true); code != 404 {
		t.Fatalf("unknown data file: %d", code)
	}
	code, _, body := a.do("GET", "/", nil, false)
	if code != 200 || !strings.Contains(body, "window.MB_SERVER=") || !strings.Contains(body, "const ABOUT_PAGES = [") || !strings.Contains(body, "APP_VERSION = '"+version()+"'") {
		t.Fatalf("app page: %d", code)
	}
	req, _ := http.NewRequest("GET", ts.URL+"/about/release-notes", nil)
	res, _ := a.c.Do(req)
	if res.StatusCode != 303 || res.Header.Get("Location") != "/#about/release-notes" {
		t.Fatalf("about redirect: %d %s", res.StatusCode, res.Header.Get("Location"))
	}
	if code, _, _ := a.do("GET", "/healthz", nil, false); code != 200 {
		t.Fatal("healthz")
	}
	if s.cfg.MaxUsers != 0 || version() == "?" {
		t.Fatal("config or version")
	}
}
