# Joker

Joker is a modern joke generator app for Android, Windows, and web. It includes:

- category-based joke creation
- Ask from Joker prompt flow
- Create Joke and Create New actions
- memory-based personalization
- offline-ready generation with optional local open-source AI support
- speech playback for the created joke

## Run locally

1. Install Node.js.
2. In the project directory, run:

```bash
npm install
npm start
```

3. Visit:

```text
http://localhost:3000
```

## Built-in AI behavior

The app uses a built-in local joke engine and can optionally use a local Ollama model if it is available on the device. This gives you an app that works offline and can also use a local AI inside Joker itself.

## Packaging for Android and Windows

After the web app runs, it can be packaged for:

- Android via Capacitor
- Windows via Electron or Tauri
- web deployment via static hosting

## Notes

This project is structured as a cross-platform MVP and is ready for more features like profiles, richer personalization, and deeper AI memory.
