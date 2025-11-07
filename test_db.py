import psycopg2
import sys

print(f"Ejecutable de Python: {sys.executable}")
print(f"Versión de Python: {sys.version}")
print(f"Codificación del sistema de archivos: {sys.getfilesystemencoding()}")

try:
    conn = psycopg2.connect(
        dbname="videojuegos_db",
        user="videojuegos_user",
        password="Inacap@2025",
        host="localhost",
        port="5432"
    )
    print("✓ ¡Conexión exitosa!")
    conn.close()
except Exception as e:
    print(f"✗ Error de conexión: {e}")
    import traceback
    traceback.print_exc()
