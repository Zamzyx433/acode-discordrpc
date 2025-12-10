import base64
import json
import os
import requests

CLIENT_ID = os.environ["DISCORD_CLIENT_ID"]
CLIENT_SECRET = os.environ["DISCORD_CLIENT_SECRET"]
APP_ID = os.environ["DISCORD_APP_ID"]

API = "https://discord.com/api/v10"
ICON_FILE = "src/Icons.json"

# Auth header
auth_value = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
headers = {
    "Authorization": f"Basic {auth_value}",
    "User-Agent": "GitHub-Action-Icon-Sync"
}

resp = requests.get(f"{API}/oauth2/applications/{APP_ID}/assets", headers=headers, timeout=15)
resp.raise_for_status()
assets = resp.json()

# Build name -> id map
new_icons = {a["name"]: a["id"] for a in assets}

# Load existing file if exists
if os.path.exists(ICON_FILE):
    with open(ICON_FILE, "r", encoding="utf-8") as f:
        old_icons = json.load(f)
else:
    old_icons = {}

# Only write if changed
if old_icons != new_icons:
    with open(ICON_FILE, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(new_icons.items())), f, indent=2)
    print("Icons.json updated")
else:
    print("No icon changes detected")