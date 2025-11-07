import os
import sys
import subprocess

# Get the short path version
import ctypes
from ctypes import wintypes

def get_short_path_name(long_name):
    """
    Gets the short path name of a given long path.
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

# Get current directory and convert to short path
current_dir = os.path.dirname(os.path.abspath(__file__))
short_path = get_short_path_name(current_dir)

print(f"Original path: {current_dir}")
print(f"Short path: {short_path}")

# Change to short path directory
os.chdir(short_path)

# Set environment variables
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PYTHONUTF8'] = '1'

# Run Django migrate
python_exe = os.path.join(short_path, '.venv', 'Scripts', 'python.exe')
manage_py = os.path.join(short_path, 'manage.py')

print(f"\nRunning: {python_exe} {manage_py} migrate\n")

result = subprocess.run([python_exe, manage_py, 'migrate'], 
                       cwd=short_path,
                       env=os.environ.copy())

sys.exit(result.returncode)
