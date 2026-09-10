import sys
import os

# Ensure backend and root directory are in Python module search path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set default SQLite database path to writable /tmp for serverless execution
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite:////tmp/metrax.db"

from main import app

# Vercel Serverless Function entrypoint
handler = app
