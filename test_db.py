import psycopg2
import sys

print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"File system encoding: {sys.getfilesystemencoding()}")

try:
    conn = psycopg2.connect(
        dbname="videojuegos_db",
        user="videojuegos_user",
        password="Inacap@2025",
        host="localhost",
        port="5432"
    )
    print("✓ Connection successful!")
    conn.close()
except Exception as e:
    print(f"✗ Connection failed: {e}")
    import traceback
    traceback.print_exc()
