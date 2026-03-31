# Agro Mind — Android App

A complete Android Studio project for the **Agro Mind** smart irrigation & crop intelligence
application. This is a direct port of the `index.html` web app with the same UI and features.

## How to import in Android Studio

1. Open **Android Studio** (Hedgehog / Iguana or newer)
2. Choose **File → Open** and select the `android/` directory
3. Let Gradle sync complete (it will download dependencies automatically)
4. Connect an Android device or start an emulator
5. Click **▶ Run**

## Project structure

```
app/src/main/
├── java/com/agromind/app/
│   ├── MainActivity.kt           ← Navigation host (drawer + bottom nav)
│   ├── adapters/                 ← RecyclerView adapters (6)
│   ├── api/
│   │   ├── ApiService.kt         ← Retrofit interface (all backend endpoints)
│   │   └── RetrofitClient.kt     ← OkHttp + Retrofit singleton
│   ├── fragments/                ← One Fragment per page (7)
│   │   ├── DashboardFragment.kt
│   │   ├── IrrigationFragment.kt
│   │   ├── DiseaseFragment.kt
│   │   ├── CropsFragment.kt
│   │   ├── ChatFragment.kt
│   │   ├── SensorsFragment.kt
│   │   └── SettingsFragment.kt
│   ├── models/                   ← Kotlin data classes
│   └── utils/
│       └── MockData.kt           ← Same mock data as the web app
└── res/
    ├── layout/                   ← All XML layouts
    ├── navigation/nav_graph.xml  ← Navigation component graph
    ├── menu/                     ← Bottom nav + drawer menus
    ├── drawable/                 ← Shapes, gradients, backgrounds
    └── values/                   ← colors.xml, strings.xml, themes.xml
```

## Pages / Screens

| Page | Description |
|------|-------------|
| Dashboard | Stat cards, soil moisture bars, alerts, weekly water chart |
| Smart Irrigation | Today's schedule, AI recommendation, custom calculation form |
| Disease Detection | Camera/gallery upload, mock CNN result, detection history |
| Crop Advisor | Field conditions form, ML crop recommendations grid |
| Farm AI Chat | Conversational AI, quick chips, chat history |
| Sensors & Data | Gauge cards, sensor status list |
| Settings | Automation toggles, farm config, API URL/key |

## Connecting to your backend

All backend calls are wired to the `ApiService` Retrofit interface. To enable live data:

1. Go to **Settings** screen in the app
2. Enter your **API Base URL** (e.g. `https://your-backend.com/api`)
3. Enter your **API Key** if required
4. Tap **Save All**

The mock data (in `MockData.kt`) will continue to be used for pages until you implement
the corresponding API calls in each Fragment.

### Backend API endpoints (from the Node.js/Python backend in this repo)

| Method | Endpoint | Fragment |
|--------|----------|----------|
| GET | `/api/irrigation/schedule` | IrrigationFragment |
| POST | `/api/irrigation/run` | IrrigationFragment |
| POST | `/api/irrigation/calculate` | IrrigationFragment |
| POST | `/api/disease/analyse` | DiseaseFragment |
| POST | `/api/crops/recommend` | CropsFragment |
| POST | `/api/chat/message` | ChatFragment |
| GET | `/api/sensors/live` | SensorsFragment |
| GET | `/api/sensors/export` | SensorsFragment |
| POST | `/api/settings` | SettingsFragment |

## Requirements

- Android Studio Hedgehog (2023.1.1) or newer
- Android SDK 34
- Minimum Android 7.0 (API 24)
- Kotlin 1.9.x

## Colors

All colors match the website's design tokens:

| Token | Hex |
|-------|-----|
| `green_600` (primary) | `#2d6a35` |
| `green_400` (accent) | `#4caf60` |
| `amber_500` | `#e6a817` |
| `blue_600` | `#2563a8` |
| `red_600` | `#c0392b` |
