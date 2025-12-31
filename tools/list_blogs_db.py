import sqlite3
p = r'Backend\\AdminBackend\\blog.db'
try:
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute("SELECT id, title, author, created_at FROM blogs ORDER BY created_at DESC")
    rows = c.fetchall()
    print('DB blogs count=', len(rows))
    for r in rows:
        print(r)
    conn.close()
except Exception as e:
    print('DB error:', e)
