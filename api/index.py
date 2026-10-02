import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(current_dir, "_app")

for p in [app_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception:
    from _app.main import app
