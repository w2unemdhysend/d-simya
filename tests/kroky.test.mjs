// «Кроки D-SIM'YA» (android/kroky): the published app and its sources agree.
//   node tests/kroky.test.mjs
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(root + p, 'utf8');

const v = JSON.parse(read('kroky/version.json'));
const apk = readFileSync(root + 'kroky/dsimya-kroky.apk');
t('the published APK is the one version.json describes (sha256)', createHash('sha256').update(apk).digest('hex') === v.sha256);
t('…a real APK (a zip with a manifest), about a megabyte', apk[0] === 0x50 && apk[1] === 0x4b && apk.includes(Buffer.from('AndroidManifest.xml')) && statSync(root + 'kroky/dsimya-kroky.apk').size < 3e6);
const gradle = read('android/kroky/app/build.gradle.kts');
t('version.json and the build agree (versionCode, versionName)', gradle.includes(`versionCode = ${v.versionCode}`) && gradle.includes(`versionName = "${v.versionName}"`));
t('the signing key is never in the repository', !/storePassword\s*=\s*"/.test(gradle) && read('android/kroky/.gitignore').includes('*.jks'));
const manifest = read('android/kroky/app/src/main/AndroidManifest.xml');
const health = [...manifest.matchAll(/android\.permission\.health\.[A-Z_]+/g)].map((m) => m[0]);
t('the app asks Health Connect only for steps (and reading them in the background)', health.join() === 'android.permission.health.READ_STEPS,android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND', health.join());
t('…and explains why (the privacy screen Health Connect links to)', manifest.includes('ACTION_SHOW_PERMISSIONS_RATIONALE') && manifest.includes('VIEW_PERMISSION_USAGE'));
const steps = read('android/kroky/app/src/main/java/ua/dsimya/kroky/Steps.kt');
const site = read('assets/site.js').match(/WORKER_URL = '([^']+)'/)[1], cfg = read('worker/config.js').match(/SITE = '([^']+)'/)[1];
t('the app talks to the same server and site as the pages', steps.includes(`SERVER = "${site}/"`) && steps.includes(`SITE = "${cfg}"`));
t('the network calls run off the main thread', /suspend fun sync\(c: Context\): Int = withContext\(Dispatchers\.IO\)/.test(steps));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
