// Packaged food from Open Food Facts (open database, ODbL; photos CC BY-SA): one product by its barcode, or a search
// among the products sold in Germany. The phone asks Open Food Facts directly; nothing goes through our server.
// A product becomes a food of the diary: {id 'off-<code>', n, brand, ic (photo), kcal, p, f, c per 100 g, por, l, code}.

const PRODUCT = 'https://world.openfoodfacts.org/api/v2/product/';
const SEARCH = 'https://search.openfoodfacts.org/search';
const FIELDS = 'code,product_name,product_name_uk,product_name_de,product_name_en,generic_name_de,brands,nutriments,image_front_small_url,image_front_thumb_url,quantity,serving_size,serving_quantity,nutrition_data_per';

const num = (v) => { const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v); return Number.isFinite(n) && n >= 0 ? n : null; };
const r1 = (n) => Math.round(n * 10) / 10;
const brandOf = (b) => (Array.isArray(b) ? b : String(b || '').split(',')).map((x) => String(x).trim()).filter(Boolean)[0] || '';

// grams (or ml) in a text like "500 g", "1,5 l", "6 x 125 g"
export function amountOf(text) {
  const m = String(text || '').toLowerCase().replace(',', '.').match(/(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g|gr|ml|cl|l)\b/);
  if (!m) return null;
  const k = { kg: 1000, g: 1, gr: 1, ml: 1, cl: 10, l: 1000 }[m[3]], n = Number(m[2]) * k * (m[1] ? Number(m[1]) : 1);
  return n > 0 && n <= 5000 ? { g: Math.round(n), liquid: /ml|cl|^l$/.test(m[3]) } : null;
}

// An Open Food Facts product as a food; null when it has no energy per 100 g (we could only guess)
export function toFood(p) {
  if (!p || !p.code) return null;
  const n = p.nutriments || {};
  let kcal = num(n['energy-kcal_100g']);
  if (kcal == null && num(n.energy_100g) != null) kcal = num(n.energy_100g) / 4.184;
  if (kcal == null || kcal > 950) return null;
  // a product whose calories do not fit its protein, fat and carbohydrates (kJ typed as kcal, a typo): counted from them
  const P = num(n.proteins_100g) || 0, Fa = num(n.fat_100g) || 0, Ca = num(n.carbohydrates_100g) || 0, est = 4 * P + 9 * Fa + 4 * Ca;
  let fixed = false;
  if (P + Fa + Ca > 0 && Math.abs(kcal - est) > Math.max(60, est * 0.5)) { kcal = est; fixed = true; }
  const name = [p.product_name_uk, p.product_name_de, p.product_name, p.product_name_en, p.generic_name_de].map((x) => String(x || '').trim()).find(Boolean);
  const pack = amountOf(p.quantity), serve = num(p.serving_quantity);
  const por = [];
  if (serve && serve > 0 && serve <= 1500 && (!pack || serve < pack.g)) por.push([p.serving_size ? `порція (${String(p.serving_size).slice(0, 24)})` : 'порція', Math.round(serve)]);
  if (pack && pack.g <= 1500) por.push([`уся упаковка (${String(p.quantity).trim().slice(0, 20)})`, pack.g]);
  return {
    id: 'off-' + p.code, code: String(p.code), src: 'off', n: name || 'Продукт ' + p.code, brand: brandOf(p.brands),
    ic: p.image_front_small_url || p.image_front_thumb_url || '', thumb: p.image_front_thumb_url || p.image_front_small_url || '',
    kcal: Math.round(kcal), p: r1(num(n.proteins_100g) || 0), f: r1(num(n.fat_100g) || 0), c: r1(num(n.carbohydrates_100g) || 0),
    por, l: p.nutrition_data_per === '100ml' || !!(pack && pack.liquid), cat: '', ...(fixed ? { fixed: true } : {}),
  };
}

async function getJson(url, ms) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (r.status === 404) return { notFound: true };
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

// {food} | {missing: true} (unknown barcode, or known without calories) ; throws without internet
export async function byBarcode(code) {
  const d = await getJson(PRODUCT + encodeURIComponent(code) + '.json?fields=' + FIELDS, 12000);
  if (d.notFound || d.status === 0 || !d.product) return { missing: true };
  const food = toFood({ ...d.product, code: d.product.code || code });
  return food ? { food } : { missing: true, name: d.product.product_name || '' };
}

export async function search(q) {
  const url = SEARCH + '?q=' + encodeURIComponent(q + ' countries_tags:"en:germany"') + '&page_size=20&langs=de,uk,en&fields=' + FIELDS;
  const d = await getJson(url, 10000);
  return (d.hits || []).map(toFood).filter(Boolean);
}
