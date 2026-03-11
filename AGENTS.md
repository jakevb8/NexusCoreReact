# NexusCoreReact — Agent Instructions

## Project Overview

NexusCoreReact is the Expo React Native implementation of the NexusCore multi-tenant Resource Management SaaS. It provides full UI parity with NexusCoreJS (web), NexusCoreDotNet (Razor Pages), and NexusCoreAndroid (Jetpack Compose).

**Sister repos:**

- `NexusCoreJS` at `/Users/jake/projects/NexusCore` (GitHub: `jakevb8/NexusCore`) — Next.js 15 frontend + NestJS REST API
- `NexusCoreDotNet` at `/Users/jake/projects/NexusCoreDotNet` (GitHub: `jakevb8/NexusCoreDotNet`) — ASP.NET Core 8 Razor Pages
- `NexusCoreAndroid` at `/Users/jake/projects/NexusCoreAndroid` (GitHub: `jakevb8/NexusCoreAndroid`) — Jetpack Compose Android
- `NexusCoreIOS` at `/Users/jake/projects/NexusCoreIOS` (GitHub: `jakevb8/NexusCoreIOS`) — SwiftUI iOS
- `NexusCoreAngular` at `/Users/jake/projects/NexusCoreAngular` (GitHub: `jakevb8/NexusCoreAngular`) — Angular 21 web client

## NEVER COMMIT SECRETS — CRITICAL

**This has caused incidents in sister repos. Read before every commit.**

Files that MUST NEVER be committed:

- `google-services.json` — Android Firebase config with API key
- `GoogleService-Info.plist` — iOS Firebase config with API key
- `.env`, `.env.local`, `*.env` — any environment files

These are listed in `.gitignore`. Before every `git add`:

1. Run `git diff --staged` and scan for key/secret values
2. If accidentally staged: `git reset HEAD <file>`
3. If committed: rotate key immediately, use BFG to purge from history

**How to restore config files (gitignored, not committed):**

```bash
# Android
firebase apps:sdkconfig ANDROID 1:797114794124:android:549d9f19c0ae148f663ba9 --project nexus-core-rms --out google-services.json

# iOS
firebase apps:sdkconfig IOS 1:797114794124:ios:016fb504003e61be663ba9 --project nexus-core-rms --out GoogleService-Info.plist
```

## Project Structure

```
NexusCoreReact/
├── App.tsx               — Root component (SafeAreaProvider > AuthProvider > AppNavigator)
├── index.ts              — Expo entry point
├── app.json              — Expo config (bundle IDs, Firebase plugins)
├── package.json          — Dependencies
├── src/
│   ├── api/              — Axios API client (all endpoints)
│   │   └── index.ts
│   ├── auth/             — Firebase auth context
│   │   └── AuthContext.tsx
│   ├── components/       — Shared UI components
│   │   ├── AppHeader.tsx
│   │   ├── StatusChip.tsx
│   │   └── theme.ts
│   ├── models/           — TypeScript types, enums, DTOs
│   │   └── index.ts
│   ├── navigation/       — React Navigation stack
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── assets/
│   │   │   ├── AssetsScreen.tsx
│   │   │   └── AssetDetailScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── login/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── PendingApprovalScreen.tsx
│   │   ├── reports/
│   │   │   └── ReportsScreen.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── team/
│   │       └── TeamScreen.tsx
│   └── store/            — AsyncStorage-backed preferences
│       └── backend.ts
```

## Key Commands

```bash
npm install           # install dependencies
npm start             # expo start (requires EAS Build for native modules)
npm run android       # expo start --android
npm run ios           # expo start --ios

# EAS Build (required for @react-native-firebase and @react-native-google-signin)
eas build --platform android --profile development
eas build --platform ios --profile development
```

## Architecture

- **Framework**: Expo managed workflow, EAS Build for native modules
- **Auth**: `@react-native-firebase/auth` + `@react-native-google-signin/google-signin`
  - Google sign-in only (no email/password)
  - `AuthContext` wraps `onAuthStateChanged` and provides `user` + `signOut`
- **API**: Axios client in `src/api/index.ts` with Bearer token interceptor
  - Base URL read from AsyncStorage-backed `BackendChoice` at client creation
  - `resetApiClient()` must be called when switching backends
- **Navigation**: React Navigation native stack
  - Pre-auth stack: Login → Onboarding → PendingApproval
  - Post-auth stack: Dashboard → Assets → AssetDetail / Team / Reports / Settings
- **Backend selector**: `AsyncStorage`-backed, resets API client on change
- **No Redux/Zustand**: state is local to each screen

## Firebase Configuration

- **Project ID**: `nexus-core-rms`
- **Android App ID**: `1:797114794124:android:549d9f19c0ae148f663ba9`
- **iOS App ID**: `1:797114794124:ios:016fb504003e61be663ba9`
- **Package / Bundle ID**: `me.jakev.rn.nexuscore`
- Config files gitignored; restore via CLI commands above

## Google Sign-In Setup

`LoginScreen.tsx` calls `GoogleSignin.configure({ webClientId: '...' })`. The web client ID must be set to the OAuth 2.0 client ID from the Firebase/GCP console. Currently has a placeholder — update before building.

## API Backends

| Key      | Base URL                                                   | Label                      |
| -------- | ---------------------------------------------------------- | -------------------------- |
| `JS`     | `https://nexus-coreapi-production.up.railway.app/api/v1`   | NexusCoreJS (Node API)     |
| `DOTNET` | `https://nexuscoredotnet-production.up.railway.app/api/v1` | NexusCoreDotNet (.NET API) |

## Canonical UI Feature List

| Screen       | Features                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Login        | Google sign-in, backend FilterChip selector, persists choice                                   |
| Onboarding   | Name + org name, POST /auth/register                                                           |
| Pending      | Pending message, sign out                                                                      |
| Dashboard    | Navigation cards to Assets, Team, Reports, Events, Settings                                    |
| Assets       | List + search + pagination, create/edit/delete (manager only), CSV import, sample CSV download |
| Asset Detail | Name, SKU, description, assignedTo, status chip selector                                       |
| Team         | Member list, invite by email, copy-link fallback, remove member, change role                   |
| Reports      | Total assets, utilization %, assets-by-status bar chart                                        |
| Events       | Paginated Kafka asset status change history (asset name, old/new status, timestamp)            |
| Settings     | Account info, backend selector, sign out                                                       |

## Cross-Repo Feature Parity

When any UI feature changes in this repo, the equivalent change must be made in all sister repos. Backend-only changes (NexusCoreJS API) do not require changes here.

**Cross-repo check rule:** At the start of every task, read the relevant files in all sister repos to check whether an equivalent change has already been made there. If it has, apply the same change here. If this repo is ahead, propagate to the others. Never assume parity — always verify by reading the files.

## Common Pitfalls

- **EAS Build required**: `@react-native-firebase` uses native modules — Expo Go will not work
- **Google Sign-In webClientId**: Must be set to the real OAuth client ID before building
- **Backend switch**: `resetApiClient()` must be called after `setBackendChoice()` to take effect immediately
- **CSV import**: Uses `expo-document-picker` for file selection and `FormData` with `axios`
- **Sample CSV download**: Uses `expo-file-system` + `expo-sharing` (no direct MediaStore access in RN)
- After completing any task that modifies files, always commit and push to the current branch without asking for confirmation.
- **README maintenance**: After any feature addition, removal, or significant UI change, update `README.md` in every affected repo to reflect the current feature list. The READMEs are the public-facing source of truth and must not fall behind the code.
