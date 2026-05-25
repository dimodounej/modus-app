# Modus — iOS & Android App

React Native (Expo) companion app for the Modus web workspace.
Both share the same Supabase backend and Next.js API routes.

---

## Quick start (development)

```bash
cd ModusApp
npm install
npx expo start
```

Press `i` for iOS Simulator, `a` for Android emulator, or scan the QR code with the Expo Go app.

---

## Environment

The `.env` file is pre-populated with the project's Supabase credentials.
No additional setup needed for development.

---

## Building for the App Store & Play Store

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login          # log in with your Expo account
```

### 2. Create the EAS project (one-time)

```bash
eas project:init
```

This generates a `projectId`. Paste it into `app.json` under `expo.extra.eas.projectId`
and `expo.updates.url`.

### 3. Build

**iOS (TestFlight / App Store):**
```bash
npm run build:ios         # production .ipa
```
You'll need an Apple Developer account ($99/year) at developer.apple.com.
EAS handles provisioning profiles and signing automatically.

**Android (Play Store):**
```bash
npm run build:android     # production .aab
```
You'll need a Google Play Developer account ($25 one-time) at play.google.com/console.

### 4. Submit

Fill in the REPLACE_WITH_* placeholders in `eas.json` with:
- `appleId` — your Apple ID email
- `ascAppId` — App Store Connect app ID (create the app listing first at appstoreconnect.apple.com)
- `appleTeamId` — your 10-character Apple Team ID
- `google-play-service-account.json` — download from Google Play Console → Setup → API access

Then:
```bash
npm run submit:ios
npm run submit:android
```

---

## Over-the-air updates

JavaScript changes (UI, logic, API calls) can be pushed without going through
App Store review:

```bash
npm run update --message "Your update description"
```

Users get the update the next time they open the app.
Native code changes (new plugins, permissions) still require a new build.

---

## Keeping web + app in sync

| What changed | Action needed |
|---|---|
| API route logic (`/api/modus/*`) | Nothing — both web and app call the same deployed API |
| Shared types (`src/types/index.ts`) | Copy changes to `ModusApp/src/types/index.ts` |
| New feature in web UI | Implement equivalent screen/component in `ModusApp/` |
| Database schema | Both apps benefit automatically via the shared Supabase backend |
| JS-only UI change | Push OTA update with `npm run update` |

---

## Project structure

```
ModusApp/
  app/
    _layout.tsx          Root layout — auth guard, navigation
    (auth)/login.tsx     Magic-link sign in
    (tabs)/
      index.tsx          Intelligence Feed (main screen)
      leads.tsx          Leads list + search
      settings.tsx       Account settings
    lead/[id].tsx        Lead detail (deep-link target)
  src/
    lib/
      supabase.ts        Supabase client (SecureStore adapter)
      api.ts             API utilities — feed, leads, agents
    types/index.ts       Shared types (keep in sync with web)
    theme/index.ts       Design tokens matching web CSS variables
    components/
      FeedCard.tsx       Swipeable feed card (PanResponder)
      LeadSheet.tsx      Lead detail bottom sheet
      Skeleton.tsx       Shimmer loading placeholders
    hooks/
      useFeed.ts         Feed data hook
      useLeads.ts        Leads data hook
```
