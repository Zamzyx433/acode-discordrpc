import base64
import json
from dotenv import load_dotenv
import os
import requests

load_dotenv()

CLIENT_ID = os.environ.get("DISCORD_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("DISCORD_CLIENT_SECRET", "")
APP_ID = os.environ.get("DISCORD_APP_ID", "")

if not CLIENT_ID:
    raise ValueError("DISCORD_CLIENT_ID environment variable is not set")
if not CLIENT_SECRET:
    raise ValueError("DISCORD_CLIENT_SECRET environment variable is not set")
if not APP_ID:
    raise ValueError("DISCORD_APP_ID environment variable is not set")

API = "https://discord.com/api/v10"
ICON_FILE = "src/Icons.json"

auth_value = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
headers = {
    "Authorization": f"Basic {auth_value}",
    "User-Agent": "GitHub-Action-Icon-Sync"
}

print(f"Fetching assets for APP_ID: {APP_ID}")
resp = requests.get(f"{API}/oauth2/applications/{APP_ID}/assets", headers=headers, timeout=15)
resp.raise_for_status()
assets = resp.json()

new_icons = {a["name"]: a["id"] for a in assets}

if os.path.exists(ICON_FILE):
    with open(ICON_FILE, "r", encoding="utf-8") as f:
        old_icons = json.load(f)
else:
    old_icons = {}

if old_icons != new_icons:
    with open(ICON_FILE, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(new_icons.items())), f, indent=2)
    print(f"Icons.json updated with {len(new_icons)} icons")
else:
    print("No icon changes detected")