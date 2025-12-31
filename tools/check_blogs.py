import sqlite3
import json
import urllib.request

print('Inspecting SQLite DB...')
try:
    conn = sqlite3.connect(r'Backend\\AdminBackend\\blog.db')
    c = conn.cursor()
    c.execute("SELECT id, title, author, created_at FROM blogs ORDER BY created_at DESC")
    rows = c.fetchall()
    print('DB blogs count=', len(rows))
    for r in rows[:10]:
        print(r)
    conn.close()
except Exception as e:
    print('DB error:', e)

print('\nCalling backend /blogs endpoint...')
try:
    with urllib.request.urlopen('http://localhost:8000/blogs') as resp:
        body = resp.read().decode('utf-8')
        data = json.loads(body)
        print('API returned count=', len(data))
        for b in data[:5]:
            print(b)
except Exception as e:
    print('API call error:', e)
