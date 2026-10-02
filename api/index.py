import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Ensure app package is registered so internal imports `from app...` work
import _app
sys.modules["app"] = _app

from _app.main import app
