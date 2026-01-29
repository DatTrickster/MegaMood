# MegaMood

<p align="center">
  <img src="./assets/Icon.png" alt="MegaMood" width="120" height="120" />
</p>

**MegaMood** is a personal wellness and planning app built with React Native (Expo). It helps you track weather, calendar, events & notes, and stay motivated with an in-app AI assistant and daily motivation.

---

## Features

- **Weather** — Current conditions and 5-day forecast (Open-Meteo, no API key). Set a city or use your precise location. Weather icons for each condition.
- **Calendar** — Month view with selectable dates; today and selected date highlighted.
- **Events & Notes** — Add events or notes per day; list and remove them. In-app reminders when events are coming up (today or tomorrow).
- **Gaia (AI Buddy)** — In-app chat assistant powered by Ollama Cloud. Enable in Settings with your API key. Chat history is stored locally; markdown (including tables) is rendered neatly.
- **Daily motivation** — Opt-in: one short motivational message from Gaia per day, based on your profile and goals. Shown on the dashboard and as a push notification (once per day).
- **Profile** — Edit your persona: name, username, date of birth, gender, weight, height, lifestyle goals.
- **Settings** — AI Buddy on/off and API key; weather location (precise or city search, including South Africa); clear chat data; location permission explained before use.

Data is stored locally on device (no cloud account required). AI features and daily motivation are opt-in.

---

## Tech stack

- **Expo** (SDK 54) + **React Native**
- **TypeScript**
- **React Navigation** (native stack)
- **expo-secure-store** — API key and settings
- **expo-file-system** — User profile, chat history, events/notes, motivation cache
- **expo-location** — Weather (precise location)
- **expo-notifications** — Daily motivation push (when enabled)
- **react-native-markdown-display** — Gaia chat messages
- **react-native-svg** — Logo and chat bubble icon

---

## Getting started

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd MegaMood
   npm install
   ```

2. **Run**
   ```bash
   npm start
   ```
   Then open in Expo Go (scan QR) or run `npm run ios` / `npm run android`.

3. **AI Buddy (optional)**  
   Get an API key from [ollama.com/settings/keys](https://ollama.com/settings/keys), then in the app: **Settings → AI Buddy** → enable and paste the key.

4. **Daily motivation (optional)**  
   **Settings → Daily motivation** → turn on to get one message per day on the dashboard and as a push notification.

---

## CI / GitHub Actions

- **Build APK** (`.github/workflows/build-apk.yml`) — On push to `main`/`master`, release publish, or manual run: builds an Android debug APK with Expo prebuild + Gradle and uploads it as an artifact (`megamood-apk`).
- **Discord notification** (`.github/workflows/discord-notify.yml`) — On push to **any branch**: sends an orange embed to Discord with branch, commit message, author, and commit link. Set the repository secret **`DISCORD_NOTIFICATIONS`** to your Discord webhook URL.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
