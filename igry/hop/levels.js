// The six levels of "Пригоди шкарпетки", seen from the side (2.5D): a sock that ran away from the washing machine hops
// through Xanten to find its pair. Each level hides the letters of one German word; all of them make the word, and the
// word goes into the garden.
// The game runs along X (to the right) and Y (up); z is only for the picture (how deep a thing stands in the scene).
// A platform: P (a box: middle x, top y, width), R (round: middle x, top y, radius), G (the ground: solid all the way
// down) or C (a column standing on the ground), with `look` for the drawing and optionally move (to and fro by `to` in
// `period` s), orbit (round an upright circle), fall (crumbles), spring (bounces up with this speed).
// `floor`: where the water, the foam or the dark below begins (falling past it brings the sock back); `route`: the way
// the test pilot takes; `par`: the time for the third star; `signs`: words lit up in the scene ([text, x, y, z, colour]);
// `lamps`: lights ([x, y, z, colour]).

const P = (x, y, w, o = {}) => ({ t: 'box', x, y, z: 0, w, d: 2.4, h: 1.2, ...o });
const R = (x, y, r, o = {}) => ({ t: 'cyl', x, y, z: 0, r, h: 1.2, ...o });
const G = (x, y, w, look, o = {}) => P(x, y, w, { look, h: 40, d: 4, ground: true, ...o });
const C = (x, y, r, look = 'column') => R(x, y, r, { look, h: 40, ground: true });
const bob = (dy, period, phase = 0) => ({ to: [0, dy, 0], period, phase });

export const LEVELS = [
  {
    id: 'pralnia', name: 'Пральня', word: ['die', 'Socke'], uk: 'шкарпетка', theme: 'laundry', par: 25, floor: -3.5,
    story: 'Ніч у пральні. Барабан зупинився, дверцята відчинились, і шкарпетка вистрибнула назовні. Де ж її пара?',
    start: [0, 0, 0], goal: [45.5, 0.8, 0],
    platforms: [
      G(2, 0, 8, 'tiles'),                                       // 0 start
      G(8.6, 0.8, 2.4, 'machine', { d: 2.6 }),                   // 1
      G(12.4, 1.6, 2.4, 'machine', { d: 2.6 }),                  // 2
      R(16.2, 1, 1.1, { look: 'basket', h: 1.4 }),                // 3 a laundry basket on a trolley
      G(22, 0, 6, 'tiles'),                                      // 4 checkpoint
      P(23.6, 1.2, 1.6, { look: 'powder', h: 1.2, d: 1.4 }),      // 5 a box of washing powder
      P(28.6, 1.4, 2.6, { look: 'shelf', h: 0.35 }),              // 6
      P(32.8, 2.4, 2.4, { look: 'shelf', h: 0.35 }),              // 7
      G(36.8, 1.6, 2.4, 'machine', { d: 2.6 }),                  // 8
      G(43, 0.8, 8, 'tiles'),                                    // 9 goal
    ],
    letters: [[8.6, 1.75, 0], [16.2, 1.95, 0], [23.6, 2.15, 0], [32.8, 3.35, 0], [42, 2.5, 0]],
    checkpoints: [[20.6, 0, 0]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    signs: [['WASCHSALON', 19, 8.4, -5.6, '#5FE3FF'], ['24 h', 3, 6.4, -5.6, '#FF5FA8'], ['geöffnet', 41, 8.4, -5.6, '#B8FF6B']],
    lamps: [[6, 11, -1.5, '#E6F6FF'], [24, 11, -1.5, '#E6F6FF'], [42, 11, -1.5, '#FFF0D8']],
  },
  {
    id: 'dvir', name: 'Двір', word: ['das', 'Hemd'], uk: 'сорочка', theme: 'yard', par: 35, floor: -3.5,
    story: 'Вечір у дворі. Між будинками сохне білизна, світлячки кружляють, а кошики їздять мотузками.',
    start: [0, 0, 0], goal: [55.5, 5.4, 0],
    platforms: [
      G(2, 0, 8, 'grass'),                                                              // 0 start
      G(9.5, 0.4, 3, 'grass'),                                                          // 1
      R(13.5, 0.4, 1, { look: 'basket', h: 1, move: { to: [3.5, 0, 0], period: 4.6 } }),  // 2 rides on the washing line
      G(21.5, 0.4, 3, 'grass'),                                                         // 3
      P(26, 0.4, 2.2, { look: 'bench', h: 0.5, move: { to: [0, 3.2, 0], period: 5 } }),  // 4 a lift up
      G(31, 3.6, 3.2, 'grass'),                                                         // 5 checkpoint
      R(32, 3.8, 0.5, { look: 'spring', h: 0.45, spring: 17 }),                          // 6
      P(36.2, 7.4, 2.6, { look: 'roof', h: 0.6 }),                                      // 7 up on the shed roof
      P(41, 6.6, 2.4, { look: 'roof', h: 0.6 }),                                        // 8
      R(45.5, 5.4, 1, { look: 'basket', h: 1, move: { to: [3.2, 0, 0], period: 3.8 } }),  // 9
      G(54, 5.4, 6, 'grass'),                                                           // 10 goal
    ],
    letters: [[15.2, 1.35, 0], [36.2, 8.35, 0], [37.6, 8.35, 0], [47, 6.35, 0]],
    checkpoints: [[30, 3.6, 0]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    signs: [['Hof 3', 24, 4.6, -7, '#FFC46B']],
    lamps: [[9, 4.4, -2.5, '#FFB46B'], [30, 7.6, -2.5, '#FFB46B'], [52, 9.2, -2.5, '#FFB46B']],
  },
  {
    id: 'vulytsia', name: 'Вулиця', word: ['der', 'Bus'], uk: 'автобус', theme: 'street', par: 35, floor: -3,
    story: 'Дощова ніч на вулиці. Неон відбивається в калюжах, автобуси їдуть повз, а мокрий картон довго не витримає.',
    start: [0, 0, 0], goal: [61.5, 2.8, 0],
    platforms: [
      G(2, 0, 8, 'pave'),                                                                // 0 start
      P(8.6, 0.6, 2.2, { look: 'crate', h: 1.4, fall: true }),                             // 1 wet cardboard
      P(12.4, 1.2, 2.2, { look: 'crate', h: 1.4, fall: true }),                            // 2
      G(18, 0.6, 5, 'pave'),                                                             // 3 checkpoint, the bus stop
      P(24, 1.8, 5.6, { look: 'bus', h: 2.2, d: 2.6, move: { to: [8, 0, 0], period: 7 } }), // 4 a bus to ride on
      G(39, 1.2, 4, 'pave'),                                                             // 5
      R(40.4, 1.4, 0.5, { look: 'spring', h: 0.45, spring: 17 }),                          // 6
      P(44.5, 5.2, 3, { look: 'awning', h: 0.4 }),                                       // 7 an awning
      P(49.2, 4.4, 2.2, { look: 'crate', h: 1.4, fall: true }),                            // 8
      P(53.4, 3.6, 2.2, { look: 'crate', h: 1.4, fall: true }),                            // 9
      G(60, 2.8, 6, 'pave'),                                                             // 10 goal
    ],
    letters: [[8.6, 1.55, 0], [28, 2.75, 0], [49.2, 5.35, 0]],
    checkpoints: [[16.6, 0.6, 0]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    signs: [['APOTHEKE', 9, 5.2, -7, '#3DFF8A'], ['BÄCKEREI', 31, 6.2, -9, '#FFB13D'], ['HALTESTELLE', 18, 4.4, -2.2, '#FFE14D'], ['KINO', 52, 8.4, -11, '#FF4D7D'], ['Döner', 44, 8.6, -6, '#FF7A3D']],
    lamps: [[16, 5.6, -1.8, '#FFE9B0'], [36, 6, -1.8, '#FFE9B0'], [57, 7.4, -1.8, '#FFE9B0']],
  },
  {
    id: 'rhein', name: 'Рейн', word: ['die', 'Brücke'], uk: 'міст', theme: 'rhine', par: 45, floor: -1,
    story: 'Світанок у тумані над Рейном. Буї гойдаються, баржі пливуть, а старі дошки на мосту тріщать.',
    start: [0, 0, 0], goal: [74.5, 1.6, 0],
    platforms: [
      G(2, 0, 8, 'stone'),                                                               // 0 start, the bank
      R(8, -0.2, 0.95, { look: 'buoy', h: 1.6, move: bob(-0.5, 2.6) }),                    // 1 buoys bob
      R(11.8, -0.2, 0.95, { look: 'buoy', h: 1.6, move: bob(-0.5, 2.6, 0.5) }),            // 2
      P(17, -0.4, 4, { look: 'barge', h: 1.2, d: 2.8, move: { to: [6.6, 0, 0], period: 8 } }), // 3 a barge
      P(28.4, 0.3, 2.4, { look: 'plank', h: 0.4, fall: true }),                            // 4 old planks on piles
      P(32, 0.3, 2.4, { look: 'plank', h: 0.4, fall: true }),                              // 5
      G(37, 0.6, 4, 'stone'),                                                            // 6 checkpoint, a pier
      P(42.5, 0, 3, { look: 'barge', h: 1.2, d: 2.8, move: { to: [5.6, 0, 0], period: 7 } }), // 7
      R(52, 0.4, 0.9, { look: 'buoy', h: 1.6, move: bob(-0.4, 2.4) }),                     // 8
      R(55.6, 0.9, 0.9, { look: 'buoy', h: 1.6, move: bob(-0.4, 2.4, 0.5) }),              // 9
      G(60, 1.6, 3, 'stone'),                                                            // 10 the bridge begins
      P(64, 1.6, 2.4, { look: 'plank', h: 0.4, fall: true }),                              // 11
      P(67.6, 1.6, 2.4, { look: 'plank', h: 0.4, fall: true }),                            // 12
      G(73, 1.6, 6, 'stone'),                                                            // 13 goal, the other bank
    ],
    letters: [[8, 0.6, 0], [20, 0.55, 0], [32, 1.25, 0], [45, 0.95, 0], [55.6, 1.55, 0], [67.6, 2.55, 0]],
    checkpoints: [[35.6, 0.6, 0]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    signs: [['RHEIN', 30, 4.4, -16, '#FFD27A']],
    lamps: [[37, 4.4, -1.2, '#FFE2A8'], [60, 5.4, -1.2, '#FFE2A8'], [73, 5.4, -1.2, '#FFE2A8']],
  },
  {
    id: 'rymskyi', name: 'Римський парк', word: ['das', 'Museum'], uk: 'музей', theme: 'roman', par: 40, floor: -3,
    story: 'Золота година в Римському парку. Колони стоять ще з часів римлян, каміння кришиться, а камінь-ліфт возить угору.',
    start: [0, 0, 0], goal: [59.5, 5.4, 0],
    platforms: [
      G(2, 0, 8, 'stone'),                                                               // 0 start
      C(8, 0.6, 1),                                                                      // 1 columns
      C(11.8, 1.3, 1),                                                                   // 2
      C(15.6, 2, 1),                                                                     // 3
      P(20, 1, 2.2, { look: 'block', h: 0.6, move: { to: [0, 2.6, 0], period: 4.4 } }),    // 4 a stone that lifts
      G(25, 3.6, 4, 'stone'),                                                            // 5 checkpoint
      R(26.4, 3.8, 0.5, { look: 'spring', h: 0.45, spring: 17 }),                          // 6
      C(30.4, 7.4, 1.1),                                                                 // 7 tall ones
      C(34.2, 7.4, 1),                                                                   // 8
      P(39, 6.2, 2.2, { look: 'disc', h: 0.5, orbit: { r: 1.6, period: 6 } }),             // 9 round and round
      C(44.4, 6.6, 1),                                                                   // 10
      P(48.4, 6, 2, { look: 'block', h: 0.8, fall: true }),                                // 11 crumbling stones
      P(52, 5.4, 2, { look: 'block', h: 0.8, fall: true }),                                // 12
      G(58, 5.4, 6, 'stone'),                                                            // 13 goal
    ],
    letters: [[11.8, 2.25, 0], [20, 4.4, 0], [30.4, 8.35, 0], [39, 8.65, 0], [48.4, 6.95, 0], [56.4, 6.35, 0]],
    checkpoints: [[24, 3.6, 0]],
    route: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    signs: [['MUSEUM', 36, 3.4, -12, '#FFE7B0']],
    lamps: [[25, 7, -2, '#FFC77A'], [58, 9.6, -2, '#FFC77A']],
  },
  {
    id: 'vitriak', name: 'Вітряк', word: ['der', 'Wind'], uk: 'вітер', theme: 'mill', par: 50, pair: true, floor: -3,
    story: 'Буряний захід сонця біля вітряка. Нагорі чекає друга шкарпетка. Крила крутяться повільно: катайся на них угору.',
    start: [0, 0, 0], goal: [56.5, 11.2, 0],
    platforms: [
      G(2, 0, 8, 'grass'),                                                               // 0 start
      G(8.4, 0.6, 2.4, 'brick'),                                                         // 1
      P(12.2, 1.2, 2.2, { look: 'plank', h: 0.4, fall: true }),                            // 2
      G(16, 1.8, 2.4, 'brick'),                                                          // 3
      ...[0, 1, 2, 3].map((k) => P(22.5, 5, 2, { look: 'sail', h: 0.4, orbit: { r: 3.4, period: 12, phase: k / 4 }, hub: [22.5, 5, -0.9] })),   // 4–7 the sails
      G(28.6, 7.6, 3, 'brick'),                                                          // 8 checkpoint, the mill's gallery
      P(33.2, 7.6, 2, { look: 'plank', h: 0.4, move: { to: [3.4, 0, 0], period: 4 } }),    // 9
      P(40.6, 8.2, 2.2, { look: 'plank', h: 0.4, fall: true }),                            // 10
      R(44.8, 8.2, 0.6, { look: 'spring', h: 1.2, spring: 16 }),                           // 11
      G(49, 11.2, 2.6, 'brick'),                                                         // 12
      G(55, 11.2, 6, 'grass'),                                                           // 13 goal: the pair
    ],
    letters: [[16, 2.75, 0], [22.5, 9.35, 0], [35.3, 8.55, 0], [49, 12.15, 0]],
    checkpoints: [[28, 7.6, 0]],
    route: [1, 2, 3, 4, 8, 9, 10, 11, 12, 13],
    signs: [['XANTEN', 10, 5, -18, '#FFD9A0']],
    lamps: [[28.6, 11, -1.6, '#FFC27A'], [55, 14.6, -1.6, '#FFC27A']],
  },
];

export const byId = (id) => LEVELS.find((l) => l.id === id);
