#!/usr/bin/env python3
"""Assemble ui/ into a single HTML page (same result as the server's assemble()).

The About pages in ui/about/NN-slug.md are added as the ABOUT_PAGES array, then every script in ui/manifest.txt.
Usage: python3 tools/assemble.py [output.html]
Default output: build/moneybags.html
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI = os.path.join(ROOT, 'ui')

def read(name):
    with open(os.path.join(UI, name), encoding='utf-8') as f:
        return f.read()

def about_js():
    pages = []
    for name in sorted(f for f in os.listdir(os.path.join(UI, 'about')) if re.match(r'^\d+-.+\.md$', f)):
        body = read('about/' + name)
        slug = re.sub(r'^\d+-', '', name)[:-3]
        m = re.search(r'^# (.+)$', body, re.M)
        pages.append({'slug': slug, 'title': m.group(1).strip() if m else slug, 'body': body})
    return ('// ---------- About guide pages (built from ui/about/*.md when the page is assembled) ----------\n'
            'const ABOUT_PAGES = ' + json.dumps(pages, ensure_ascii=False, separators=(',', ':')) + ';\n')

def assemble():
    names = [l.strip() for l in read('manifest.txt').splitlines() if l.strip() and not l.strip().startswith('#')]
    js = about_js() + '\n'.join(read(n) for n in names) + '\n'
    js = js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')
    return read('index.html').replace('/*CSS*/', read('style.css'), 1).replace('/*JS*/', js, 1)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'build', 'moneybags.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(assemble())
    print(out)
