# meinong's game room

A static multiplayer tabletop starter with Firebase Realtime Database cursor presence.

## What it does

- Home screen with title `meinong's game room`
- `generate new tabletop` button creates a unique room URL
- Room page has a `copy link` button in the bottom-right corner
- Visitors in the same room see each other's cursor dots in realtime

## Local preview

Run any static web server from this folder, for example:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/index.html`.

## Firebase setup (free Spark plan)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Realtime Database** (start in locked mode, then apply rules below).
3. In Project settings, create a Web App and copy the config values.
4. Replace placeholders in `firebase-config.js`.

Recommended prototype database rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Deploy to GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`.

1. Push to the `main` branch.
2. In GitHub repo settings, set **Pages > Build and deployment > Source** to **GitHub Actions**.
3. The workflow deploys everything in the repository root as a static site.

## Notes

- Firebase web config values are safe to ship client-side.
- If `firebase-config.js` still has `REPLACE_ME`, the room page shows a setup message instead of syncing.
