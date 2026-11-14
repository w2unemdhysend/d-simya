// The Bot API calls the Worker makes. The token never leaves the Worker.

import { SITE } from './config.js';

const HOME = { text: 'Відкрити застосунок', url: SITE };

// A call to the Bot API: the parsed answer, {ok: false} when Telegram cannot be reached
export function tgApi(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
  }).then((r) => r.json()).catch(() => ({ ok: false }));
}

// One message with one button that opens a page of the app inside Telegram. Returns the fetch Response.
export function tgSend(env, chatId, text, button = HOME) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: { inline_keyboard: [[{ text: button.text, web_app: { url: button.url } }]] } }),
  });
}

// The messages of one cron run. Never more than `budget` of them (the free plan allows 50 outside requests per run);
// after Telegram says "too many" (429) none at all. Each send says what happened:
//   {ok}         delivered
//   {blocked}    the person blocked the bot or deleted the chat: their subscription can go
//   {later}      not now (budget used up, Telegram busy, network): try again on the next run
export function outbox(env, budget) {
  let left = budget, stopped = false;
  return {
    get left() { return stopped ? 0 : left; },
    async send(chatId, text, button) {
      if (stopped || left <= 0) return { later: true };
      left--;
      let res;
      try { res = await tgSend(env, chatId, text, button); } catch (e) { console.log('send failed', String(e && e.message || e)); return { later: true }; }
      if (res.ok) return { ok: true };
      if (res.status === 403) return { blocked: true };
      if (res.status === 429) stopped = true;
      return { later: true, status: res.status };
    },
  };
}
