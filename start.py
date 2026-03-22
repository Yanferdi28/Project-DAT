"""
Project-DAT Unified Launcher
Menjalankan seluruh service dengan satu command: python start.py
"""

import subprocess
import sys
import os
import signal
import time
import shutil
from pathlib import Path

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Konfigurasi ──────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent
OCR_DIR = ROOT_DIR / "ocr-service"
VENV_DIR = ROOT_DIR / ".venv"

# Parse .env file to get OCR port and RAG config
def _parse_dotenv():
    """Read key=value pairs from .env file."""
    env_vals = {}
    env_file = ROOT_DIR / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, val = line.partition("=")
                env_vals[key.strip()] = val.strip().strip('"').strip("'")
    return env_vals

_dotenv = _parse_dotenv()

# Determine OCR port from .env OCR_SERVICE_URL
_ocr_url = _dotenv.get("OCR_SERVICE_URL", "http://127.0.0.1:8100")
try:
    OCR_PORT = _ocr_url.rsplit(":", 1)[-1].split("/")[0]
except Exception:
    OCR_PORT = "8100"

# Tambahkan Tesseract ke PATH jika terinstall di lokasi umum Windows
if sys.platform == "win32":
    _tesseract_dir = Path(r"C:\Program Files\Tesseract-OCR")
    if _tesseract_dir.exists() and str(_tesseract_dir) not in os.environ.get("PATH", ""):
        os.environ["PATH"] = str(_tesseract_dir) + os.pathsep + os.environ.get("PATH", "")

# Resolve Python dari venv jika ada
PYTHON = str(VENV_DIR / ("Scripts" if sys.platform == "win32" else "bin") / "python")
if not Path(PYTHON).exists() and not Path(PYTHON + ".exe").exists():
    PYTHON = sys.executable

SERVICES = [
    {
        "name": "Laravel",
        "cmd": ["php", "artisan", "serve"],
        "cwd": ROOT_DIR,
        "color": "\033[94m",  # blue
    },
    {
        "name": "Queue",
        "cmd": ["php", "artisan", "queue:listen", "--tries=1"],
        "cwd": ROOT_DIR,
        "color": "\033[95m",  # magenta
    },
    {
        "name": "Vite",
        "cmd": ["npx", "vite"],
        "cwd": ROOT_DIR,
        "color": "\033[93m",  # yellow
    },
    {
        "name": "OCR",
        "cmd": [PYTHON, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", OCR_PORT, "--reload"],
        "cwd": OCR_DIR,
        "color": "\033[92m",  # green
    },
]


def _resolve_cmd(cmd):
    """Di Windows, resolve executable .cmd/.bat agar subprocess bisa menemukan."""
    if sys.platform != "win32":
        return cmd
    exe = shutil.which(cmd[0])
    if exe:
        return [exe] + cmd[1:]
    return cmd

RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[91m"

processes: list[subprocess.Popen] = []


def _kill_port(port: int):
    """Kill proses yang menempati port tertentu (Windows only)."""
    if sys.platform != "win32":
        return
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True, text=True, timeout=5,
        )
        for line in result.stdout.splitlines():
            if f":{port}" in line and "LISTENING" in line:
                pid = line.strip().split()[-1]
                subprocess.run(["taskkill", "/F", "/PID", pid],
                               capture_output=True, timeout=5)
                print(f"  {BOLD}[CLEANUP]{RESET} Killed stale process PID {pid} on port {port}")
    except Exception:
        pass


def check_prerequisites():
    """Cek apakah semua tools yang dibutuhkan sudah terinstall."""
    missing = []
    if not shutil.which("php"):
        missing.append("php")
    if not shutil.which("node"):
        missing.append("node / npm")
    if missing:
        print(f"{RED}[ERROR]{RESET} Tools berikut belum terinstall: {', '.join(missing)}")
        sys.exit(1)

    # Cek vendor & node_modules
    if not (ROOT_DIR / "vendor" / "autoload.php").exists():
        print(f"{BOLD}[SETUP]{RESET} Menjalankan composer install...")
        subprocess.run(["composer", "install"], cwd=ROOT_DIR, check=True)

    if not (ROOT_DIR / "node_modules").exists():
        print(f"{BOLD}[SETUP]{RESET} Menjalankan npm install...")
        subprocess.run(["npm", "install"], cwd=ROOT_DIR, check=True)

    # Bersihkan port dari proses zombie sebelumnya
    for port in [8000, int(OCR_PORT)]:
        _kill_port(port)


def prefix_output(proc, name, color):
    """Baca stdout dari process dan tambahkan prefix berwarna."""
    tag = f"{color}{BOLD}[{name:>7}]{RESET} "
    try:
        for line in iter(proc.stdout.readline, ""):
            if not line:
                break
            print(f"{tag}{line}", end="", flush=True)
    except (ValueError, OSError):
        pass


def start_all():
    """Jalankan semua service secara paralel."""
    import threading

    print(f"\n{BOLD}============================================{RESET}")
    print(f"{BOLD}    Project-DAT  --  Development Mode      {RESET}")
    print(f"{BOLD}============================================{RESET}\n")

    check_prerequisites()

    # Pada Windows, aktifkan virtual console untuk warna ANSI
    if sys.platform == "win32":
        os.system("")  # enables ANSI escape codes on Windows 10+

    print(f"{BOLD}Starting services...{RESET}\n")

    env = os.environ.copy()
    # Pass RAG/Gemini env vars to Python OCR service
    for env_key in ["GEMINI_API_KEY", "RAG_EMBEDDING_MODEL", "RAG_TOP_K", "RAG_MAX_CONTEXT_LENGTH"]:
        if env_key in _dotenv and env_key not in env:
            env[env_key] = _dotenv[env_key]

    for svc in SERVICES:
        resolved_cmd = _resolve_cmd(svc["cmd"])
        proc = subprocess.Popen(
            resolved_cmd,
            cwd=svc["cwd"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
        )
        processes.append(proc)
        print(f"  {svc['color']}*{RESET} {svc['name']:>7}  started (PID {proc.pid})")

        # Thread untuk membaca output
        t = threading.Thread(target=prefix_output, args=(proc, svc["name"], svc["color"]), daemon=True)
        t.start()

    print(f"\n{BOLD}All services running. Press Ctrl+C to stop.{RESET}\n")
    print(f"  Laravel  : http://localhost:8000")
    print(f"  Vite     : http://localhost:5173")
    print(f"  OCR API  : http://localhost:{OCR_PORT}")
    print(f"  Queue    : listening...\n")


def stop_all():
    """Hentikan semua proses dengan graceful shutdown."""
    print(f"\n{BOLD}Stopping all services...{RESET}")
    for proc in processes:
        try:
            if sys.platform == "win32":
                proc.terminate()
            else:
                proc.send_signal(signal.SIGTERM)
        except OSError:
            pass

    # Tunggu max 5 detik lalu force kill
    deadline = time.time() + 5
    for proc in processes:
        remaining = max(0, deadline - time.time())
        try:
            proc.wait(timeout=remaining)
        except subprocess.TimeoutExpired:
            proc.kill()

    print(f"{BOLD}All services stopped.{RESET}\n")


def main():
    try:
        start_all()
        # Tunggu salah satu proses selesai (atau Ctrl+C)
        while True:
            for proc in processes:
                ret = proc.poll()
                if ret is not None:
                    svc = SERVICES[processes.index(proc)]
                    print(f"\n{RED}[EXIT]{RESET} {svc['name']} exited with code {ret}")
                    stop_all()
                    sys.exit(ret)
            time.sleep(0.5)
    except KeyboardInterrupt:
        stop_all()


if __name__ == "__main__":
    main()
