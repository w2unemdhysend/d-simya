# «Кроки D-SIM'YA» — застосунок-крокомір для Android

Маленький застосунок-компаньйон: бере кількість кроків за день з **Health Connect** (лічильник самого телефона, Samsung Health, годинник — усе, що туди пише) і щогодини надсилає їх на сервер D-SIM'YA, у щоденник «Харчування» (поле «Кроки» дня). Telegram Mini App сам до крокоміра телефона дістатися не може, тому потрібен цей посередник.

## Як користуватися

1. У «Харчування» → день → «Кроки самі з телефона: крокомір» → «Завантажити» (файл `kroky/dsimya-kroky.apk` на сайті) і встановити. Android попросить дозволити встановлення з браузера.
2. Відкрити застосунок → «Дозволити доступ до кроків» (кроки й читання у фоні).
3. У «Харчуванні» натиснути «Отримати код» і ввести 8 знаків у застосунку.

Далі все саме: щогодини (WorkManager, коли є інтернет) і щоразу, коли застосунок відкривають. Надсилаються останні 7 днів, тож пропущений день доганяється. На Samsung кроки в Health Connect передає Samsung Health (Налаштування → Health Connect).

Що читає й куди: лише сума кроків за день (`READ_STEPS`, `READ_HEALTH_DATA_IN_BACKGROUND`); тільки на сервер D-SIM'YA. Сервер зберігає лише SHA-256 від ключа телефона (`worker/steps.js`). Відключити — у застосунку або в «Харчуванні».

## Будова

- `app/src/main/java/ua/dsimya/kroky/Steps.kt` — Health Connect (сума кроків по днях), сервер (`POST /steps/pair`, `POST /steps`), налаштування;
- `SyncWorker.kt` — щогодинне надсилання; `MainActivity.kt` — екран; `PrivacyActivity.kt` — пояснення доступу, яке показує Health Connect.
- Без AppCompat і Compose: лише `connect-client`, `work-runtime-ktx`, `activity-ktx`; APK близько 1 МБ.

## Збірка

Потрібні JDK 17+ і Android SDK (platform 36, build-tools 36). У `local.properties`: `sdk.dir=…`.

```sh
export KROKY_KEYSTORE=/шлях/kroky-release.jks KROKY_STORE_PASS=… KROKY_KEY_ALIAS=kroky KROKY_KEY_PASS=…
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../../kroky/dsimya-kroky.apk
```

Ключ підпису не зберігається в репозиторії. Оновлення встановлюється поверх старої версії лише з тим самим ключем; новий ключ означає перевстановлення й нове підключення кодом (записи на сервері не губляться). Після збірки: підняти `versionCode`/`versionName` у `app/build.gradle.kts`, оновити `kroky/version.json` (версія й sha256) — застосунок сам покаже «Є нова версія». `tests/kroky.test.mjs` перевіряє, що все збігається.

Залежності тягнуться через дзеркало Maven Central від Google (`settings.gradle.kts`): основний сервер Maven Central часто відповідає спільним машинам збірки «429 Too Many Requests».
