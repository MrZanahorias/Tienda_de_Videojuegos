import os
import sys
import subprocess

# Obtener la versión de ruta corta
import ctypes
from ctypes import wintypes

def get_short_path_name(long_name):
    """
    Obtiene el nombre de ruta corta de una ruta larga dada.
    """
    _GetShortPathNameW = ctypes.windll.kernel32.GetShortPathNameW
    _GetShortPathNameW.argtypes = [wintypes.LPCWSTR, wintypes.LPWSTR, wintypes.DWORD]
    _GetShortPathNameW.restype = wintypes.DWORD

    output_buf_size = 0
    while True:
        output_buf = ctypes.create_unicode_buffer(output_buf_size)
        needed = _GetShortPathNameW(long_name, output_buf, output_buf_size)
        if output_buf_size >= needed:
            return output_buf.value
        else:
            output_buf_size = needed

# Obtener el directorio actual y convertirlo a ruta corta
current_dir = os.path.dirname(os.path.abspath(__file__))
short_path = get_short_path_name(current_dir)

print(f"Ruta original: {current_dir}")
print(f"Ruta corta: {short_path}")

# Cambiar al directorio de ruta corta
os.chdir(short_path)

# Establecer variables de entorno
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PYTHONUTF8'] = '1'

# Ejecutar el comando de migración de Django
python_exe = os.path.join(short_path, '.venv', 'Scripts', 'python.exe')
manage_py = os.path.join(short_path, 'manage.py')

print(f"\nEjecutando: {python_exe} {manage_py} migrate\n")

result = subprocess.run([python_exe, manage_py, 'migrate'], 
                       cwd=short_path,
                       env=os.environ.copy())

sys.exit(result.returncode)
