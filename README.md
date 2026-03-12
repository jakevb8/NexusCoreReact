# NexusCoreReact

Expo React Native client for [NexusCore](https://github.com/jakevb8/NexusCore) — a multi-tenant Resource Management SaaS. Runs on both iOS and Android and connects to either the Node.js or .NET backend via a user-selectable toggle.

## Features

- Google Sign-In via `@react-native-firebase/auth`
- Backend selector: switch between the NexusCoreJS (Node) and NexusCoreDotNet (.NET) APIs
- Asset management: list, search, create, edit, delete, CSV import, sample CSV download
- Team management: invite members by email, copy-link fallback, remove members, change roles
- Reports: utilization rate and assets-by-status breakdown
- Settings: account info, backend picker, sign out
- Full RBAC support (`SUPERADMIN > ORG_MANAGER > ASSET_MANAGER > VIEWER`)

## Tech Stack

| Layer        | Library                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| Framework    | Expo (managed workflow) + React Native                                      |
| Navigation   | React Navigation (native stack)                                             |
| Auth         | `@react-native-firebase/auth` + `@react-native-google-signin/google-signin` |
| HTTP         | Axios with Bearer token interceptor                                         |
| Persistence  | AsyncStorage (backend preference)                                           |
| Forms        | No form library — controlled components                                     |
| File picker  | `expo-document-picker`                                                      |
| File sharing | `expo-file-system` + `expo-sharing`                                         |
| Build        | EAS Build (required for native Firebase modules)                            |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo`
- EAS CLI: `npm install -g eas-cli`
- Firebase CLI: `npm install -g firebase-tools && firebase login`

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/jakevb8/NexusCoreReact.git
   cd NexusCoreReact
   npm install
   ```

2. **Restore Firebase config files** (gitignored — never commit these)

   ```bash
   # Android
   firebase apps:sdkconfig ANDROID 1:797114794124:android:549d9f19c0ae148f663ba9 \
     --project nexus-core-rms \
     --out google-services.json

   # iOS
   firebase apps:sdkconfig IOS 1:797114794124:ios:016fb504003e61be663ba9 \
     --project nexus-core-rms \
     --out GoogleService-Info.plist
   ```

3. **Replace the Google Sign-In web client ID placeholder** in `src/screens/login/LoginScreen.tsx`:
   Replace `797114794124-PLACEHOLDER.apps.googleusercontent.com` with the real OAuth 2.0 web client ID from the Firebase console (Authentication → Sign-in method → Google → Web client ID).

4. **Build with EAS** (Expo Go is not supported — native Firebase modules require a custom build):
   ```bash
   eas build --platform android --profile development
   eas build --platform ios --profile development
   ```

## Building

```bash
# Development build (device)
eas build --platform android --profile development
eas build --platform ios --profile development

# Preview build (APK/IPA, no store)
eas build --platform android --profile preview

# Production build (AAB/IPA for store submission)
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Firebase / Package Details

- **Android package:** `me.jakev.rn.nexuscore`
- **iOS bundle ID:** `me.jakev.rn.nexuscore`
- **Firebase project:** `nexus-core-rms`
- **Firebase Android App ID:** `1:797114794124:android:549d9f19c0ae148f663ba9`
- **Firebase iOS App ID:** `1:797114794124:ios:016fb504003e61be663ba9`

## Related Repos

| Repo                                                            | Description                           |
| --------------------------------------------------------------- | ------------------------------------- |
| [NexusCore](https://github.com/jakevb8/NexusCore)               | Next.js 15 frontend + NestJS REST API |
| [NexusCoreDotNet](https://github.com/jakevb8/NexusCoreDotNet)   | ASP.NET Core 8 Razor Pages backend    |
| [NexusCoreAndroid](https://github.com/jakevb8/NexusCoreAndroid) | Jetpack Compose Android client        |
| [NexusCoreIOS](https://github.com/jakevb8/NexusCoreIOS)         | SwiftUI iOS native client             |
