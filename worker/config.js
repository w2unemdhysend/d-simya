// Everything about this installation in one place: where the site lives and who may use the bot.

// The pages (GitHub Pages). The bot's buttons open them inside Telegram.
export const SITE = 'https://w2unemdhysend.github.io/d-simya/';
// Only pages from here may call the Worker from a browser (CORS); ALLOWED_ORIGIN in the Worker settings overrides it.
export const ORIGIN = new URL(SITE).origin;

// Who may use the bot and the server, as SHA-256 hashes of "d-simya:" + the Telegram username in lower case, without
// the @ (the names themselves are not kept here). A new one: npm run allow -- <username>, then add the line it prints.
// Without a code change: the Worker secret ALLOWED_USERS (usernames, numeric Telegram ids or such hashes, comma
// separated). See access.js for how a username is tied to one person.
export const FAMILY = [
  '35ea4527f18f989464f6e838a6eaaedb9027bbd4f609835320dfc0caeb0c0fd9',
  'd78a8701721cfa05805fd6062ca1b8bb14c5da992e75b530f2f17dd725183dc5',
  '3e5b1312d5f73cc9e2ba8925e09624f1f6ea77e8597508f041d6d0dce91b2728',
  '0dcf4a88aeaa2c9d303dd2c7d4f3c6f2595de7b71e72e998e5c56423b3d9133b',
  'e592aca1dd6c7380c380a152b32a8ae577a4a902bf2680ffcc0151d46710d1dd',
];

// One cron run of the free plan may make 50 requests to other servers. The jobs share this many Telegram messages per
// run and leave the rest for weather, timetable and health checks; whatever does not fit goes out half an hour later.
export const SENDS_PER_RUN = 30;

export const button = (text, path = '') => ({ text, url: SITE + path });
