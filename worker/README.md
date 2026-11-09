# Сервер сканера на Cloudflare (Worker)

Потрібен для двох речей у Telegram на Android, де сторінка сама не може зберегти файл:

- **«Надіслати PDF у чат»**: бот надсилає готовий PDF тобі в чат.
- **«Передати в браузер»**: сторінки на 10 хвилин кладуться на сервер, і сканер, відкритий у браузері, забирає їх собі. Там їх можна зберегти, куди хочеш.
- **Нагадування про сміття**: щодня о 18:00 (за часом Ксантена) бот пише тим, хто увімкнув нагадування на сторінці «Сміття», які баки вивозять завтра. Дати беруться з `smittia/kalender.json`; календар на новий рік треба дописати туди.

Код: [`send-scan.js`](send-scan.js), налаштування: [`../wrangler.jsonc`](../wrangler.jsonc).
Токен бота зберігається тільки в налаштуваннях Cloudflare, ні на сторінці, ні в репозиторії його немає.

## Налаштування (один раз)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository** → вибери `w2unemdhysend/d-simya`.
2. На екрані **Set up your application**:
   - **Project name**: `d-simya` (має збігатися з `"name"` у `wrangler.jsonc`)
   - **Build command**: порожньо
   - **Deploy command**: `npx wrangler deploy` (як і стоїть)
   - **Enable Preview builds** можна вимкнути, вони не потрібні.

   Натисни **Deploy** і дочекайся, поки збірка стане зеленою. Сховище `SCANS` (KV) створиться саме.
3. Відкрий створений Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Type: **Secret**
   - Variable name: `BOT_TOKEN`
   - Value: токен бота з @BotFather (**API Token**)

   Збережи (**Deploy**).
4. Скопіюй адресу Worker з **Settings** → **Domains & Routes** (рядок `workers.dev`), вона виглядає так:
   `https://d-simya.<твоє-ім'я>.workers.dev`. Надішли її Claude або впиши в `scan/index.html`:
   ```js
   var WORKER_URL = 'https://d-simya.<твоє-ім'я>.workers.dev';
   ```

Після цього Cloudflare сам оновлює Worker після кожної зміни в репозиторії.

Якщо збірка впаде з помилкою про KV: **Storage & Databases** → **KV** → **Create** → назва `d-simya-scans`,
скопіюй її **ID** і допиши в `wrangler.jsonc`: `{ "binding": "SCANS", "id": "<ID>" }`.

## Як це захищено

- Сторінка надсилає разом із файлами підписані Telegram дані (`initData`). Worker перевіряє підпис
  токеном бота (HMAC-SHA256), тому запити не з твого Mini App не проходять.
- PDF іде тільки тому, хто його надіслав (ID з підписаних даних).
- Передані сторінки: лише JPEG, під випадковим ідентифікатором, живуть щонайбільше 10 хвилин,
  а браузер видаляє їх одразу, щойно забрав.
- Відповіді йдуть тільки сторінкам з адреси `https://w2unemdhysend.github.io`.

Перевірка: `node tests/worker.test.mjs`.
