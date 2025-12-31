import sqlite3
p = r'Backend\\AdminBackend\\blog.db'
try:
    conn = sqlite3.connect(p)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print('tables=', c.fetchall())
    c.execute("PRAGMA table_info('admins')")
    print('admins schema=', c.fetchall())
    try:
        c.execute('SELECT id, username, is_super_admin, created_at FROM admins')
        rows = c.fetchall()
        print('admins rows:')
        for r in rows:
            print(r)
    except Exception as e:
        print('select failed:', e)
    conn.close()
except Exception as e:
    print('error opening DB:', e)
