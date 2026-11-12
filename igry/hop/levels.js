// The six levels of "Пригоди шкарпетки": a sock that ran away from the washing machine hops through Xanten to find its
// pair. Each level hides the letters of one German word; all of them make the word, and the word goes into the garden.
// A platform: B (a box: x, top y, z, width, depth) or C (round: x, top y, z, radius), with `look` for the drawing and
// optionally move (to and fro by `to` in `period` s), orbit (round in an upright circle), turn (rad/s), fall (crumbles),
// spring (bounces up with this speed). `route` is the way the test pilot takes; `par` the time for the third star.

const B = (x, y, z, w, d, o = {}) => ({ t: 'box', x, y, z, w, d, h: 1, ...o });
const C = (x, y, z, r, o = {}) => ({ t: 'cyl', x, y, z, r, h: 1, ...o });

export const LEVELS = [
  {
    id: 'pralnia', name: 'Пральня', word: ['die', 'Socke'], uk: 'шкарпетка', theme: 'laundry', par: 25,
    story: 'Барабан зупинився, дверцята відчинились, і шкарпетка вистрибнула назовні. Де ж її пара?',
    start: [0, 0, 1.2], goal: [-1.2, 2.6, -34.6],
    platforms: [
      B(0, 0, 0, 4.5, 5, { look: 'tiles', h: 1.4 }),            // 0 start
      B(0, 0, -5, 2.4, 2.4, { look: 'machine', h: 2.4 }),         // 1
      B(0, 0.7, -8.6, 2.4, 2.4, { look: 'machine', h: 2.4 }),     // 2
      B(2.7, 0.7, -12, 2.2, 2.2, { look: 'machine', h: 2.2 }),    // 3
      B(0, 0.7, -15.2, 2.4, 2.4, { look: 'machine', h: 2.4 }),    // 4
      B(0, 1.4, -19.3, 4.2, 3.4, { look: 'tiles', h: 1.2 }),      // 5 checkpoint
      B(-3.6, 2.4, -19.3, 1.6, 1.6, { look: 'powder', h: 2 }),    // 6 the box of washing powder with a letter on top
      C(0, 1.4, -23.4, 1.1, { look: 'basket', h: 1.3 }),          // 7
      C(2.2, 2, -26.4, 1, { look: 'basket', h: 1.3 }),            // 8
      C(-0.4, 2.6, -29.4, 1, { look: 'basket', h: 1.3 }),         // 9
      B(0, 2.6, -33.6, 4.5, 3.6, { look: 'tiles', h: 1.4 }),      // 10 goal
      B(1.6, 3.8, -34.4, 1.3, 1.3, { look: 'powder', h: 1.2 }),   // 11
    ],
    letters: [[0, 0.95, -5], [2.7, 1.65, -12], [-3.6, 3.35, -19.3], [2.2, 2.95, -26.4], [1.6, 4.75, -34.4]],
    checkpoints: [[0, 1.4, -19.3]],
    route: [1, 2, 3, 4, 5, 7, 8, 9, 10],
    deco: [['bubble', -5, 1.5, -8, 1.6], ['bubble', 6, 3, -14, 2.2], ['bubble', -7, 4, -26, 2.6], ['bubble', 5, 1, -30, 1.4], ['bubble', -4, 0, -36, 1.8],
      ['peg', 7, null, -20, 2.4, '#2F6FD6'], ['peg', -8, null, -12, 2.2, '#D6453A'], ['peg', -7, null, -40, 2.6, '#2E9B4B']],
  },
  {
    id: 'dvir', name: 'Двір', word: ['das', 'Hemd'], uk: 'сорочка', theme: 'yard', par: 35,
    story: 'Надворі сохне білизна. Кошики їздять, а пружина підкине високо.',
    start: [0, 0, 1.2], goal: [0, 4, -43.4],
    platforms: [
      B(0, 0, 0, 4.4, 4.6, { look: 'grass', h: 2 }),                                          // 0 start
      B(0, 0.4, -4.4, 2.6, 2.4, { look: 'grass', h: 2 }),                                     // 1
      B(-2, 0.4, -8.2, 2.2, 2.2, { look: 'bench', h: 0.5, move: { to: [4, 0, 0], period: 4.4 } }),   // 2 rides from side to side
      B(0, 0.4, -12.2, 2.6, 2.6, { look: 'grass', h: 2 }),                                    // 3
      B(0, 1, -15.4, 2.2, 2.2, { look: 'bench', h: 0.5, move: { to: [0, 0, -3.4], period: 5 } }),    // 4 rides forward and back
      B(0, 1, -23, 4, 3.2, { look: 'grass', h: 2 }),                                          // 5 checkpoint
      C(1.6, 1.2, -23.4, 0.55, { look: 'spring', h: 0.45, spring: 17 }),                       // 6 the spring
      B(1.6, 4.6, -27, 2.4, 2.4, { look: 'grass', h: 1.6 }),                                  // 7 up high
      B(-1.2, 4.6, -30.6, 2.2, 2.2, { look: 'grass', h: 1.6 }),                               // 8
      C(-1.6, 4, -34.4, 1, { look: 'basket', h: 1, move: { to: [3.2, 0, 0], period: 3.6 } }),   // 9 two baskets, one against the other
      C(1.6, 4, -38, 1, { look: 'basket', h: 1, move: { to: [-3.2, 0, 0], period: 3.6, phase: 0.5 } }),   // 10
      B(0, 4, -42.4, 4.4, 3.6, { look: 'grass', h: 2 }),                                      // 11 goal
    ],
    letters: [[0, 1.3, -8.2], [1.6, 5.5, -27], [0, 4.9, -34.4], [0, 4.9, -38]],
    checkpoints: [[-0.8, 1, -23]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    deco: [['pole', -5.5, null, -4, 2.5], ['pole', -5.5, null, -18, 2.5], ['line', -5.5, 3, -4, 1, [-5.5, 3, -18]],
      ['pole', 6, null, -26, 2.8], ['pole', 6, null, -40, 2.8], ['line', 6, 4, -26, 1, [6, 4, -40]],
      ['tree', -8, null, -10, 2.4], ['tree', 9, null, -16, 2.8], ['tree', -9, null, -32, 3], ['tree', 10, null, -48, 2.6], ['tree', -7, null, -50, 2.2],
      ['house', -16, null, -70, 2, '#B5644A'], ['house', 18, null, -64, 1.8, '#C9B79C'], ['cloud', -10, 12, -50, 1.6], ['cloud', 12, 14, -70, 2]],
  },
  {
    id: 'vulytsia', name: 'Вулиця', word: ['der', 'Bus'], uk: 'автобус', theme: 'street', par: 35,
    story: 'Через дорогу їздять автобуси. Стрибай на дах, коли автобус під’їде. Картонні коробки довго не витримають!',
    start: [0, 0, 1.2], goal: [0, 3.2, -40.4],
    platforms: [
      B(0, 0, 0, 4.4, 4.4, { look: 'pave', h: 1.6 }),                                         // 0 start
      B(0, 0, -4.6, 2.4, 2.4, { look: 'crate', h: 1.4, fall: true }),                          // 1 cardboard: falls soon after
      B(0, 0.5, -8.2, 2.4, 2.4, { look: 'crate', h: 1.4, fall: true }),                        // 2
      B(0, 0.5, -12, 3.6, 3, { look: 'pave', h: 1.6 }),                                       // 3
      B(-6, 1.6, -15.8, 5.6, 2.2, { look: 'bus', h: 2.2, move: { to: [12, 0, 0], period: 7 } }),      // 4 a bus
      B(6, 1.6, -19.6, 5.6, 2.2, { look: 'bus', h: 2.2, move: { to: [-12, 0, 0], period: 7, phase: 0.25 } }),   // 5 and the other way
      B(0, 1.6, -23.8, 4, 3.2, { look: 'pave', h: 1.6 }),                                     // 6 checkpoint (the bus stop)
      C(1.4, 1.8, -24.2, 0.5, { look: 'spring', h: 0.45, spring: 16.5 }),                      // 7
      B(1.4, 5, -28, 3, 1.8, { look: 'roof', h: 0.4 }),                                       // 8 the roof of the shelter
      B(-1.4, 4.4, -31.6, 2.2, 2.2, { look: 'crate', h: 1.4, fall: true }),                    // 9
      B(0.6, 3.8, -35.2, 2.2, 2.2, { look: 'crate', h: 1.4, fall: true }),                     // 10
      B(0, 3.2, -39.6, 4.4, 3.4, { look: 'pave', h: 1.6 }),                                   // 11 goal
    ],
    letters: [[0, 1.45, -8.2], [0, 2.55, -19.6], [0.6, 4.75, -35.2]],
    checkpoints: [[-0.8, 1.6, -23.8]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    deco: [['light', -3, 1.6, -22.6, 1], ['light', 4.5, 0.5, -11, 1], ['sign', -2.6, 3.2, -38.6, 1],
      ['house', -12, null, -20, 2.2, '#B5644A'], ['house', 13, null, -30, 2, '#C9B79C'], ['house', -14, null, -44, 2.4, '#8E5A44'], ['house', 12, null, -52, 2.2, '#D9C2A0'],
      ['dom', 4, null, -95, 1.5], ['cloud', -12, 14, -60, 2], ['cloud', 14, 12, -40, 1.6]],
  },
  {
    id: 'rhein', name: 'Рейн', word: ['die', 'Brücke'], uk: 'міст', theme: 'rhine', par: 45,
    story: 'Буї гойдаються на хвилях, баржі пливуть, а старі дошки на мосту тріщать.',
    start: [0, 0, 1.2], goal: [0, 1.6, -58.6],
    platforms: [
      B(0, 0, 0, 4.4, 4.4, { look: 'stone', h: 3 }),                                          // 0 start, the bank
      C(0, -0.2, -4.4, 0.95, { look: 'buoy', h: 1.6, move: { to: [0, -0.5, 0], period: 2.6 } }),           // 1 buoys bob
      C(1.6, -0.2, -7.6, 0.95, { look: 'buoy', h: 1.6, move: { to: [0, -0.5, 0], period: 2.6, phase: 0.5 } }), // 2
      B(-3, -0.4, -12, 3, 5, { look: 'barge', h: 1.2, move: { to: [6, 0, 0], period: 8 } }),     // 3 a barge across
      B(0, 0.3, -17.2, 2.4, 2.4, { look: 'plank', h: 0.4, fall: true }),                      // 4 old planks
      B(0, 0.3, -20.6, 2.4, 2, { look: 'plank', h: 0.4, fall: true }),                        // 5
      B(0, 0.6, -24.6, 4, 3, { look: 'stone', h: 3 }),                                        // 6 checkpoint
      B(0, 0, -29, 2.8, 4, { look: 'barge', h: 1.2, move: { to: [0, 0, -5], period: 7 } }),      // 7 a barge downstream
      C(-1.4, 0.4, -39, 0.9, { look: 'buoy', h: 1.6, move: { to: [0, -0.4, 0], period: 2.4 } }),            // 8
      C(1.2, 0.9, -42, 0.9, { look: 'buoy', h: 1.6, move: { to: [0, -0.4, 0], period: 2.4, phase: 0.5 } }), // 9
      B(0, 1.6, -46, 3, 3, { look: 'stone', h: 4 }),                                          // 10 the bridge begins
      B(0, 1.6, -50, 3, 2, { look: 'plank', h: 0.4, fall: true }),                            // 11
      B(0, 1.6, -53.4, 3, 2, { look: 'plank', h: 0.4, fall: true }),                          // 12
      B(0, 1.6, -57.8, 4.4, 3.4, { look: 'stone', h: 4 }),                                    // 13 goal, the other bank
    ],
    letters: [[0, 0.6, -4.4], [0, 0.55, -12], [0, 1.25, -20.6], [0, 0.95, -31.5], [1.2, 1.55, -42], [0, 2.55, -53.4]],
    checkpoints: [[-0.9, 0.6, -24.6]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    deco: [['dom', 16, null, -100, 1.6], ['house', -18, null, -64, 2, '#B5644A'], ['house', -24, null, -58, 1.6, '#C9B79C'], ['tree', 12, null, -60, 2.6], ['tree', -12, null, -66, 2.4],
      ['cloud', -14, 13, -50, 2], ['cloud', 10, 15, -80, 2.4], ['cloud', 18, 11, -30, 1.4]],
  },
  {
    id: 'rymskyi', name: 'Римський парк', word: ['das', 'Museum'], uk: 'музей', theme: 'roman', par: 35,
    story: 'Колони стоять ще з часів римлян. Мозаїки крутяться, пружини підкидають. Обережно, каміння кришиться.',
    start: [0, 0, 1.2], goal: [0, 4, -49.8],
    platforms: [
      B(0, 0, 0, 4.4, 4.4, { look: 'stone', h: 2 }),                                          // 0 start
      C(0, 0.5, -4.2, 1, { look: 'column', h: 7 }),                                           // 1 columns
      C(1.8, 1.2, -7.4, 1, { look: 'column', h: 8 }),                                         // 2
      C(-0.4, 1.9, -10.6, 1, { look: 'column', h: 8 }),                                       // 3
      C(0, 1.9, -15, 2.2, { look: 'disc', h: 0.6, turn: 0.8 }),                               // 4 a turning mosaic
      B(0, 1.9, -20.2, 4, 3.2, { look: 'stone', h: 2 }),                                      // 5 checkpoint
      C(-1.4, 2.1, -20.6, 0.5, { look: 'spring', h: 0.45, spring: 17 }),                       // 6
      C(-1.4, 5.8, -24.6, 1.1, { look: 'column', h: 11 }),                                    // 7 a tall one
      C(1, 5.8, -27.8, 1, { look: 'column', h: 11 }),                                         // 8
      B(0, 5.2, -32.6, 6, 1.2, { look: 'stone', h: 0.5, turn: 0.7 }),                         // 9 a turning beam
      C(0, 5.2, -37.6, 1, { look: 'column', h: 11 }),                                         // 10
      B(0, 4.6, -41, 2, 2, { look: 'stone', h: 0.8, fall: true }),                            // 11 crumbling stones
      B(0, 4, -44.6, 2, 2, { look: 'stone', h: 0.8, fall: true }),                            // 12
      B(0, 4, -49, 4.4, 3.6, { look: 'stone', h: 2 }),                                        // 13 goal
    ],
    letters: [[-0.4, 2.85, -10.6], [0, 2.85, -15], [-1.4, 6.75, -24.6], [0, 6.15, -32.6], [0, 5.55, -41], [1.5, 4.95, -48]],
    checkpoints: [[0.6, 1.9, -20.2]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    deco: [['arch', 0, null, -80, 1.6], ['column', -6, null, -8, 1, 5], ['column', 7, null, -14, 1, 4], ['column', -7, null, -30, 1, 6], ['column', 8, null, -38, 1, 3],
      ['tree', -10, null, -20, 2.4], ['tree', 11, null, -26, 2.2], ['tree', -12, null, -46, 2.8], ['cloud', -12, 15, -60, 2], ['cloud', 12, 13, -40, 1.6]],
  },
  {
    id: 'vitriak', name: 'Вітряк', word: ['der', 'Wind'], uk: 'вітер', theme: 'mill', par: 50, pair: true,
    story: 'Нагорі біля вітряка чекає друга шкарпетка. Крила крутяться повільно — катайся на них угору.',
    start: [0, 0, 1.2], goal: [0, 10.8, -40.8],
    platforms: [
      B(0, 0, 0, 4.4, 4.4, { look: 'grass', h: 2 }),                                          // 0 start
      B(0, 0.6, -4.4, 2.4, 2.4, { look: 'brick', h: 3 }),                                     // 1
      B(-2.4, 1.2, -7.8, 2.2, 2.2, { look: 'plank', h: 0.4, fall: true }),                    // 2
      B(0, 1.8, -11.2, 2.4, 2.4, { look: 'brick', h: 4 }),                                    // 3
      ...[0, 1, 2, 3].map((k) => B(0, 4.6, -15, 2.2, 2, { look: 'sail', h: 0.4, orbit: { r: 3.2, period: 12, phase: k / 4 }, hub: [0, 4.6, -15.6] })),   // 4–7 the sails
      B(0, 7.2, -18.8, 3.4, 2.4, { look: 'brick', h: 2 }),                                    // 8 checkpoint, above the sails
      B(0, 7.2, -23.6, 6, 1.2, { look: 'plank', h: 0.4, turn: -0.9 }),                        // 9 a turning beam
      B(0, 7.8, -28.6, 2.2, 2.2, { look: 'plank', h: 0.4, fall: true }),                      // 10
      C(0, 7.8, -32, 0.6, { look: 'spring', h: 1.2, spring: 16 }),                            // 11
      B(0, 10.8, -35.6, 2.6, 2.4, { look: 'brick', h: 2 }),                                   // 12
      B(0, 10.8, -40, 4.4, 3.6, { look: 'grass', h: 2 }),                                     // 13 goal: the pair
    ],
    letters: [[0, 2.75, -11.2], [0, 8.7, -15], [0, 8.15, -23.6], [0, 11.75, -35.6]],
    checkpoints: [[-1, 7.2, -18.8]],
    route: [1, 2, 3, 4, 8, 9, 10, 11, 12, 13],
    deco: [['mill', 18, null, -70, 1.8], ['house', -16, null, -50, 2, '#B5644A'], ['tree', -9, null, -14, 2.6], ['tree', 10, null, -22, 3], ['tree', -11, null, -38, 2.8],
      ['dom', -30, null, -110, 1.6], ['cloud', -10, 18, -40, 2.2], ['cloud', 14, 16, -60, 2.6]],
  },
];

export const byId = (id) => LEVELS.find((l) => l.id === id);
