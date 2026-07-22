# issue

Expo/EAS Android preview APK builds can feel slow, especially on the first successful build. The project has native Android folders and React Native native modules, so the `Run gradlew` phase may take several minutes while Gradle compiles native tasks.

# current time

2026-07-09 13:46:30 +08:00

# solutions

1. Avoid `--clear-cache` after the first successful build.

   Use:

   ```powershell
   eas build -p android --profile preview
   ```

   Only use `--clear-cache` when dependency or cache issues need a hard reset.

2. Build only phone architectures for APK testing.

   In `apps/mobile/android/gradle.properties`, use:

   ```properties
   reactNativeArchitectures=arm64-v8a
   ```

   This can reduce build time and APK size compared with building `armeabi-v7a,arm64-v8a,x86,x86_64`.

3. Use local dev flow for day-to-day UI changes.

   Use:

   ```powershell
   pnpm dev:mobile
   ```

   Reserve EAS APK builds for install testing or sharing.

4. Avoid unnecessary native dependency changes.

   JavaScript and TypeScript screen changes are fast locally, but native package or Android config changes can make EAS/Gradle do more work.
