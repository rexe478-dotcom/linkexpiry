import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for p in [current_dir, backend_dir, root_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception:
    from api.app.main import app
