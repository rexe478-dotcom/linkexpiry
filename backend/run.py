import os
import sys

# Ensure backend root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False, log_level="info")
