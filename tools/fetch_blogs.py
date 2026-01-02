import urllib.request
import urllib.error
url='http://127.0.0.1:8000/blogs'
try:
    with urllib.request.urlopen(url, timeout=5) as r:
        print('STATUS', r.status)
        print(r.read().decode())
except urllib.error.HTTPError as e:
    print('HTTPError', e.code)
    try:
        print(e.read().decode())
    except Exception as ex:
        print('no body:', ex)
except Exception as e:
    print('ERROR', e)
