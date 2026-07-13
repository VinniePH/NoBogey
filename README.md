# NoBogey

NoBogey is an on-demand golf-caddie booking product. This repository is a mobile-first TypeScript monorepo: the Expo/React Native app is the active product surface, while the admin app and backend boundary are deliberately kept ready for later work.

## What is in this repository

```text
apps/
  mobile/       Expo Router / React Native application for golfer and caddie flows
  admin-web/    Vite React placeholder for future operations workflows

packages/
  contracts/    Framework-neutral domain and API-facing TypeScript types
  config/       Shared TypeScript configuration
  ui/           Mobile-safe design tokens
  utils/        Shared formatting and app-neutral helpers

docs/
  api/          Future backend boundary and API ownership notes
  architecture/ Monorepo architecture notes
  setup/        Detailed setup history and runbooks
```

The mobile app currently uses typed local mock data. It has no live backend, authentication, booking persistence, or payment integration yet. See [the backend boundary](docs/api/backend-boundary.md) for the responsibilities reserved for the future backend.

## Prerequisites

Install these before running the app:

| Tool | Purpose | Required for |
| --- | --- | --- |
| Node.js | Runs Expo, Metro, and workspace tooling | All development |
| Corepack + pnpm 11.10.0 | Installs and runs workspace dependencies | All development |
| Expo Go | Opens the app quickly on a physical phone | Phone preview only |
| Android Studio + Android SDK | Supplies the emulator, SDK, platform tools, and build tools | Android emulator or native Android build |
| JDK 17 | Runs Gradle and Android builds | Native Android build |
| Gradle wrapper | Uses this repository's pinned Gradle version | Native Android build |

Node.js 20 LTS or later is recommended. This project declares `pnpm@11.10.0` in its root `package.json`; use Corepack to activate that exact package-manager version:

```bash
corepack enable
corepack prepare pnpm@11.10.0 --activate
node --version
pnpm --version
```

## Quick start: run on a phone with Expo Go

This is the fastest way to see NoBogey on an Android phone. It does **not** require Android Studio, Java, or a global Gradle installation.

1. Install **Expo Go** from Google Play on the phone.
2. Connect the phone and computer to the same Wi-Fi network.
3. From the repository root, install dependencies and start Expo:

```bash
pnpm install
pnpm dev:mobile
```

4. Scan the QR code shown by Expo Go.

If the QR connection does not work over your local network, stop the server and use a tunnel:

```bash
pnpm --filter @nobogey/mobile exec expo start --tunnel
```

You can also explicitly use local-network mode:

```bash
pnpm --filter @nobogey/mobile exec expo start --host lan
```

## Android native-build setup

Use this path when you need an Android emulator, a USB-connected device, native modules, or a locally built debug/release APK. The Android project is already committed at `apps/mobile/android`.

### 1. Install Android Studio and the Android SDK

Install [Android Studio](https://developer.android.com/studio), then open it once and complete its SDK setup wizard.

In **Android Studio → Settings/Preferences → Languages & Frameworks → Android SDK**, install:

- Android SDK Platform (the latest stable platform offered by Android Studio)
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android SDK Command-line Tools (latest)
- Android Emulator, if you will use an emulator

On macOS, Android Studio commonly installs the SDK at:

```text
$HOME/Library/Android/sdk
```

Add the Android tools to your shell configuration (`~/.zshrc` for the default macOS shell), then restart the terminal or run `source ~/.zshrc`:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
```

Confirm that Android Debug Bridge is available:

```bash
adb version
adb devices
```

On Linux or Windows, set `ANDROID_HOME`/`ANDROID_SDK_ROOT` to the SDK directory selected by Android Studio and add its `platform-tools` directory to `PATH`.

### 2. Install JDK 17

Android/Gradle builds need a Java Development Kit, not only a Java runtime. On macOS with Homebrew:

```bash
brew install openjdk@17
```

Then add it to your shell profile:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
export PATH="$JAVA_HOME/bin:$PATH"
```

Verify it:

```bash
java -version
javac -version
```

On other operating systems, install a JDK 17 distribution such as Eclipse Temurin and set `JAVA_HOME` to that JDK directory.

### 3. Use the repository Gradle wrapper

The project already includes the Gradle wrapper at `apps/mobile/android/gradlew`. It pins Gradle **9.3.1** in `apps/mobile/android/gradle/wrapper/gradle-wrapper.properties` and downloads that version on first use. This is the Gradle installation Android builds should use:

```bash
cd apps/mobile/android
./gradlew --version
cd ../../..
```

No global `gradle` command is required for NoBogey. The wrapper avoids version mismatches between developers and CI.

If you also want a global `gradle` command for other Android projects, install it separately. This is optional for NoBogey.

On macOS with Homebrew:

```bash
brew install gradle
gradle --version
```

On Windows:

1. Download the **binary-only** Gradle ZIP from the [official Gradle releases page](https://gradle.org/releases/).
2. Extract it to `C:\Gradle` so the result is a folder such as `C:\Gradle\gradle-<version>`.
3. In **System Properties → Advanced → Environment Variables**, create `GRADLE_HOME` with the extracted folder as its value, then add `%GRADLE_HOME%\bin` to `Path`.
4. Open a new PowerShell or Command Prompt window and verify the installation:

```powershell
gradle --version
```

For the NoBogey Android project itself, use the wrapper command on Windows:

```powershell
cd apps\mobile\android
.\gradlew.bat --version
```

Do not replace `./gradlew` commands in this project with global `gradle` commands; the wrapper remains the supported project command.

### 4. Create an Android emulator (optional)

In Android Studio, open **Device Manager**, create a virtual device, download a recommended system image, and start it. Confirm that it is detected:

```bash
adb devices
```

The output should show an emulator with the status `device`.

### 5. Run the native Android app

From the repository root, with an emulator running or a USB-debugging-enabled Android phone connected:

```bash
pnpm install
pnpm --filter @nobogey/mobile android
```

This runs `expo run:android`, which builds and installs the native debug app and starts Metro.

To run the native Gradle task directly instead:

```bash
cd apps/mobile/android
./gradlew assembleDebug
```

The debug APK is written under `apps/mobile/android/app/build/outputs/apk/debug/`.

For a locally generated release APK (currently signed with the development signing configuration), run:

```bash
cd apps/mobile/android
./gradlew assembleRelease
```

The release APK is written under `apps/mobile/android/app/build/outputs/apk/release/`. Before any production distribution, configure a real release keystore and signing configuration; do not ship the development signing setup.

## Run on a USB-connected Android device

1. On the device, enable **Developer options** and **USB debugging**.
2. Connect it by USB and accept the debugging prompt.
3. Confirm it is visible:

```bash
adb devices
```

4. Build and install the app:

```bash
pnpm --filter @nobogey/mobile android
```

If the installed app cannot reach the Metro server, reverse Metro's default port and restart the development server:

```bash
adb reverse tcp:8081 tcp:8081
pnpm dev:mobile
```

## Everyday workspace commands

Run these from the repository root:

```bash
# Start the Expo development server
pnpm dev:mobile

# Start the admin placeholder
pnpm dev:admin

# Run checks across the workspace
pnpm lint
pnpm typecheck
pnpm test

# Run a mobile-only check
pnpm --filter @nobogey/mobile typecheck
pnpm --filter @nobogey/mobile lint
pnpm --filter @nobogey/mobile test

# Start the mobile web target
pnpm --filter @nobogey/mobile web
```

## How the monorepo works

`pnpm-workspace.yaml` makes every package under `apps/*` and `packages/*` part of one workspace. The root package manages shared commands through Turborepo, while each app/package owns its own scripts and dependencies.

Apps may import shared packages. Shared packages must not import app code. In particular, `packages/contracts` remains framework-neutral so a future backend can use the same domain types without depending on Expo or React Native.

The Expo app is published locally as `@nobogey/mobile`. Its `main` entry is `expo-router/entry`, so files in `apps/mobile/app` define the app's routes and the feature implementation lives in `apps/mobile/src/features`.

## Current application configuration

The Expo configuration is in `apps/mobile/app.json`:

| Setting | Value |
| --- | --- |
| App name | `NoBogey` |
| Expo slug | `nobogey-mobile` |
| Deep-link scheme | `nobogey` |
| Android package | `com.anonymous.nobogeymobile` |
| Orientation | Portrait |
| Router | Expo Router |

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `pnpm` is not found or uses the wrong version | Run the Corepack commands in [Prerequisites](#prerequisites), then reopen the terminal. |
| `sdk.dir` or Android SDK errors | Install the SDK components in Android Studio and verify `ANDROID_HOME` points to the SDK directory. |
| `JAVA_HOME` / Java errors | Install JDK 17, set `JAVA_HOME`, then check `java -version`. |
| `gradle` is not found | Use `apps/mobile/android/gradlew` / `./gradlew`; a global Gradle installation is optional. |
| Gradle wrapper fails on first run | It must download Gradle 9.3.1. Check your internet connection, disk permissions, and Java setup. |
| `adb devices` shows `unauthorized` | Unlock the phone and accept the USB debugging authorization prompt, then run `adb devices` again. |
| The Android app cannot load the JavaScript bundle | Run `adb reverse tcp:8081 tcp:8081`, then start Metro with `pnpm dev:mobile`. |
| Expo Go cannot connect by QR code | Put the phone and computer on the same network, use `--host lan`, or use `--tunnel`. |

## Further documentation

- [Expo and codebase setup notes](docs/setup/expo-and-codebase.md)
- [Monorepo architecture](docs/architecture/monorepo.md)
- [Backend boundary](docs/api/backend-boundary.md)
