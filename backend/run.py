import os
import sys
import traceback

# Ensure current directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print(f"Starting LinkExpiry API on Python {sys.version}", flush=True)
    print(f"Current working directory: {os.getcwd()}", flush=True)
    print(f"sys.path: {sys.path}", flush=True)
    port = int(os.environ.get("PORT", "10000"))
    print(f"Target binding: 0.0.0.0:{port}", flush=True)
    
    try:
        import uvicorn
        from app.main import app
        print("Successfully imported app.main.app!", flush=True)
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False, log_level="info", access_log=True)
    except Exception as e:
        print(f"Fatal error starting application: {e}", file=sys.stderr, flush=True)
        traceback.print_exc()
        sys.exit(1)
