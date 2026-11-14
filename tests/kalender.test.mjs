// Checks the waste calendar (smittia/kalender.json), so that appending next year's dates cannot quietly break the
// reminders: every district has every kind of bin, dates are real, sorted, without repeats, and none lies after
// "until"; the last pickup is in the year "until" ends. Says (without failing) when the calendar is about to run out.
// Run: node tests/kalender.test.mjs   (Node 22+, no packages needed)
import cal from '../smittia/kalender.json' with { type: 'json' };
import { BINS } from '../smittia/due.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const real = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(d + 'T12:00:00Z').toISOString().startsWith(d);

t('"until" is a real day', real(cal.until), cal.until);
const kinds = new Set(Object.keys(cal.dates['1'] || {}));
t('both districts are there', Object.keys(cal.districts).sort().join() === '1,2' && Object.keys(cal.dates).sort().join() === '1,2');
for (const [district, bins] of Object.entries(cal.dates)) {
  t(`district ${district}: the same kinds of bin as district 1`, Object.keys(bins).sort().join() === [...kinds].sort().join(), Object.keys(bins).join());
  for (const [bin, days] of Object.entries(bins)) {
    const bad = days.filter((d) => !real(d));
    t(`district ${district}, ${bin}: real days`, !bad.length, bad.join());
    t(`district ${district}, ${bin}: sorted, no repeats`, days.every((d, i) => i === 0 || d > days[i - 1]), days.join());
    t(`district ${district}, ${bin}: nothing after "until"`, days.every((d) => d <= cal.until), days.at(-1));
    t(`district ${district}, ${bin}: dates up to the year "until" ends`, days.at(-1).slice(0, 4) === cal.until.slice(0, 4), days.at(-1));
  }
}
const known = new Set(Object.keys(BINS).flatMap((b) => [b, b + '14', b + '4']));
t('every kind of bin is one the app knows', [...kinds].every((k) => known.has(k)), [...kinds].join());
t('hazardous-waste days are real and sorted', cal.schadstoff.dates.every(real) && cal.schadstoff.dates.every((d, i, a) => i === 0 || d > a[i - 1]));

const left = Math.round((Date.parse(cal.until + 'T12:00:00Z') - Date.now()) / 86400000);
if (left < 45) console.log(`NOTE the waste calendar ends ${cal.until} (${left} days): add next year's dates when the city publishes them (README, «Щороку»)`);

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
