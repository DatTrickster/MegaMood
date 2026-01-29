# MegaMood

<p align="center">
  <img src="./assets/Icon.png" alt="MegaMood" width="120" height="120" />
</p>

**MegaMood** is a personal wellness and planning app built with React Native (Expo). It helps you track weather, calendar, events & notes, and stay motivated with an in-app AI assistant and personalized daily encouragement.

---

## Features

### Core
- **Weather** — Current conditions and 5-day forecast (Open-Meteo, no API key). Set a city or use your precise location.
- **Calendar** — Month view with selectable dates; today and selected date highlighted.
- **Events & Notes** — Add events or notes per day; list and remove them. In-app reminders when events are coming up.

### AI & Motivation
- **Gaia (AI Buddy)** — In-app chat assistant powered by Ollama Cloud. Enable in Settings with your API key. Chat history is stored locally; markdown (including tables and code blocks) is rendered with horizontal scroll support.
- **Medical disclaimer** — Gaia clearly states she's not a medical advisor and encourages seeking professional help for health concerns.
- **Daily encouragement** — Opt-in: one personalized, empowering message from Gaia each morning based on your full profile (name, goals, background, diet, location). Designed to help you feel confident and ready for the day—not generic advice.

### Personalization
- **Profile** — Name, username, date of birth, gender, race/background, country (picker with 100+ countries), diet (vegetarian, vegan, halal, kosher, etc.), weight, height, and lifestyle goals.
- **Dark mode** — System, light, or dark. Dark mode uses a GitHub-inspired near-black palette for comfortable night viewing.
- **Warm off-white theme** — Light mode uses a soft, easy-on-the-eyes background.

### Settings
- AI Buddy toggle and API key configuration
- Weather location (precise GPS or city search)
- Appearance (system / light / dark)
- Daily motivation toggle
- Clear chat history
- Destroy all data

Data is stored locally on device (no cloud account required). AI features and daily motivation are opt-in.

---

## Tech stack

- **Expo** (SDK 54) + **React Native**
- **TypeScript**
- **React Navigation** (native stack)
- **expo-secure-store** — API key and settings
- **expo-file-system** — User profile, chat history, events/notes, motivation cache, theme preference
- **expo-location** — Weather (precise location)
- **expo-notifications** — Daily motivation push (when enabled)
- **react-native-markdown-display** — Gaia chat messages
- **react-native-svg** — Logo, icons, and decorative waves

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

4. **Daily encouragement (optional)**  
   **Settings → Daily motivation** → turn on to receive a personalized morning message on the dashboard and as a push notification.

---

## Screenshots

| Light Mode | Dark Mode |
|------------|-----------|
| Dashboard with weather, calendar, and daily encouragement | GitHub-inspired dark theme |

---

## CI / GitHub Actions

- **Build APK** (`.github/workflows/build-apk.yml`) — On push to `main`/`master`, release publish, or manual run: builds an Android debug APK with Expo prebuild + Gradle and uploads it as an artifact (`megamood-apk`).
- **Discord notification** (`.github/workflows/discord-notify.yml`) — On push to **any branch**: sends an orange embed to Discord with branch, commit message, author, and commit link. Set the repository secret **`DISCORD_NOTIFICATIONS`** to your Discord webhook URL.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
