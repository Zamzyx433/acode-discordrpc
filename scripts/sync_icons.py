import json
import os
import requests

CLIENT_ID = os.environ["DISCORD_CLIENT_ID"]
CLIENT_SECRET = os.environ["DISCORD_CLIENT_SECRET"]
APP_ID = os.environ["DISCORD_APP_ID"]

API = "https://discord.com/api/v10"
ICON_FILE = "src/Icons.json"

token_url = f"{API}/oauth2/token"
token_data = {
    "grant_type": "client_credentials",
    "scope": "applications.commands.update"
}

token_resp = requests.post(
    token_url,
    data=token_data,
    auth=(CLIENT_ID, CLIENT_SECRET),
    headers={"User-Agent": "GitHub-Action-Icon-Sync"},
    timeout=15
)
token_resp.raise_for_status()
access_token = token_resp.json()["access_token"]

headers = {
    "Authorization": f"Bearer {access_token}",
    "User-Agent": "GitHub-Action-Icon-Sync"
}

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
    print("Icons.json updated")
else:
    print("No icon changes detected")