# Modus — Mobile

**React Native companion app for the Modus workspace**

Modus Mobile is the iOS and Android client for [Modus](https://github.com/dimodounej/meridian), a modular personal operating system. The app surfaces the Intelligence Feed and Lead management directly on your phone, with swipe-to-action gestures and a native bottom-sheet detail view.

Built with Expo SDK 56, React 19, and TypeScript. Shares the same Supabase backend and Next.js API routes as the web app — no separate backend.

---

## Screens

| Screen | Description |
|---|---|
| **Intelligence Feed** | Real-time stream of leads, visitor signals, deal updates, and alerts. Swipe right to save to pipeline, swipe left to dismiss. |
| **Leads** | Full lead list with search. Tap any lead to open the detail sheet. |
| **Lead Detail** | Bottom sheet with lead info, score, status, visit history, and agent actions. |
| **Settings** | Account info, sign-out. |

---

## Tech Stack

| | |
|---|---|
| Framework | Expo SDK 56, Expo Router (file-based navigation) |
| Language | TypeScript 5.8, strict |
| UI | React Native 0.79, custom design tokens (matches web CSS variables) |
| Auth | Supabase (`expo-secure-store` session adapter) |
| Gestures | `react-native-gesture-handler`, `react-native-reanimated` |
| Backend | Shared Supabase project + Next.js API routes from the web app |
| OTA updates | Expo Updates (`eas update`) |
| Builds / Releases | EAS Build + EAS Submit |

---

## Project Structure

```
ModusApp/
├── app/
│   ├── _layout.tsx            Root layout — auth guard, tab navigator
│   ├── (auth)/login.tsx       Magic-link sign-in
│   ├── (tabs)/
│   │   ├── index.tsx          Intelligence Feed
│   │   ├── leads.tsx          Leads list + search
│   │   └── settings.tsx       Account settings
│   └── lead/[id].tsx          Lead detail (deep-link target)
└── src/
    ├── lib/
    │   ├── supabase.ts        Supabase client (SecureStore session adapter)
    │   └── api.ts             Feed, leads, and agent API utilities
    ├── types/index.ts         Shared types (mirror of web app types)
    ├── theme/index.ts         Design tokens — colors, spacing, typography
    ├── components/
    │   ├── FeedCard.tsx       Swipeable card (PanResponder)
    │   ├── LeadSheet.tsx      Lead detail bottom sheet
    │   └── Skeleton.tsx       Shimmer loading placeholders
    └── hooks/
        ├── useFeed.ts         Feed data — fetch, refresh, optimistic remove
        └── useLeads.ts        Leads data — search, pagination
```

---

## Local Development

```bash
cd ModusApp
npm install
npx expo start
```

- Press `i` for iOS Simulator
- Press `a` for Android emulator
- Scan the QR code with [Expo Go](https://expo.dev/go) for a physical device

The `.env` file is pre-configured with the project's Supabase credentials. No additional setup needed for local dev.

---

## Building for App Store & Play Store

### Prerequisites

- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli && eas login`
- Apple Developer account ($99/yr) for iOS
- Google Play Developer account ($25 one-time) for Android

### Build

```bash
# iOS — production .ipa (for TestFlight / App Store)
npm run build:ios

# Android — production .aab (for Play Store)
npm run build:android
```

EAS handles code signing and provisioning profiles automatically.

### Submit

Fill in the placeholders in `eas.json`:

- `appleId` — your Apple ID email
- `ascAppId` — App Store Connect app ID
- `appleTeamId` — your 10-character Apple Team ID
- `google-play-service-account.json` — service account JSON from Google Play Console

Then:

```bash
npm run submit:ios
npm run submit:android
```

---

## Over-the-Air Updates

JavaScript-only changes (UI, logic, API calls) can be pushed without App Store review:

```bash
npm run update --message "Description of change"
```

Native code changes (new plugins, permissions) require a new EAS build.

---

## Keeping Web and Mobile in Sync

| What changed | Action |
|---|---|
| API route logic (`/api/modus/*`) | Nothing — both clients call the same deployed API |
| Shared types | Copy changes to `ModusApp/src/types/index.ts` |
| New web feature | Implement equivalent screen/component in `ModusApp/` |
| Database schema | Both apps benefit automatically via shared Supabase backend |
| JS-only UI change | Push OTA update |

---

## Related

- **Web app + API**: [dimodounej/meridian](https://github.com/dimodounej/meridian) — the full Modus workspace and Meridian B2B platform built on Next.js 15 + Supabase
