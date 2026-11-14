// The exercises of «Тренування»: how each one moves (key poses for sport/figure.js) and how to do it right.
// Written for beginners and for people who want to spare their knees: every exercise says what makes it easier.
//
// A move: {id, uk, group, view ('side' | 'front'), props, frames [{pose, ms, hold}], key (the pose for a still picture),
//          met (effort for the calorie estimate), low (true: no jumps, kind to the knees), muscles, how [steps],
//          mistakes [what goes wrong], easier, harder, breath}
import { FLOOR } from './figure.js';

export const GROUPS = [
  { id: 'warm', uk: 'Розминка й кардіо' }, { id: 'legs', uk: 'Ноги й сідниці' }, { id: 'upper', uk: 'Руки, груди, спина' },
  { id: 'core', uk: 'Прес і кор' }, { id: 'stretch', uk: 'Розтяжка' },
];

/* ---------- poses ---------- */
const AN = [104, 182], AF = [96, 182];                          // ankles, standing side view
const AFN = [92, 182], AFF = [108, 182];                        // ankles, standing front view
const stand = (o = {}) => ({ hip: [100, 100], torso: 180, armN: [8, 14], armF: [-6, 2], legN: { to: AN }, legF: { to: AF }, ...o });
const front = (o = {}) => ({ hip: [100, 100], torso: 180, armN: [-8, -4], armF: [8, 4], legN: { to: AFN }, legF: { to: AFF }, ...o });
const dir = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
const ang = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;
// a straight body from a point on the floor (toes or knees) to the shoulders: where the hips are and how the back lies
function line(pivot, toHip, shoulder) {
  const u = dir(pivot, shoulder);
  return { hip: [pivot[0] + u[0] * toHip, pivot[1] + u[1] * toHip], torso: ang(u) };
}
// shoulders `len` from the pivot at height y (the pivot on the floor, the body straight)
const shoulderAt = (pivot, len, y) => [pivot[0] + Math.sqrt(len * len - (pivot[1] - y) ** 2), y];
const BODY = 82 + 46, THIGH_TORSO = 42 + 46;   // ankle→shoulder and knee→shoulder along a straight body
const TOES = (x) => ({ to: [x, 176] });

// push-up: on the toes (ankle at 32, 176), hands under the shoulders
const PU_A = [32, 176], PU_TOP = line(PU_A, 82, shoulderAt(PU_A, BODY, 127)), PU_LOW = line(PU_A, 82, shoulderAt(PU_A, BODY, 163));
// on the knees (knee at 70, 180)
const KN = [70, 180], KP_TOP = line(KN, 42, shoulderAt(KN, THIGH_TORSO, 127)), KP_LOW = line(KN, 42, shoulderAt(KN, THIGH_TORSO, 162));
// forearm plank
const PL_A = [24, 176], PLANK = line(PL_A, 82, shoulderAt(PL_A, BODY, 151));
// wall push-up: leaning on the wall at x 178
const lean = (deg) => { const a = [98, 182], u = [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)]; return { hip: [a[0] + u[0] * 82, a[1] + u[1] * 82], torso: deg }; };
// lying on the back, head to the left
const SUP = { hip: [100, 175], torso: -90 };

const handsDown = (x) => ({ armN: { to: [x, 184] }, armF: { to: [x - 4, 184] } });
const legsTo = (a) => ({ legN: { to: a }, legF: { to: [a[0] - 4, a[1]] } });

export const MOVES = [
  /* ---- warm-up and cardio ---- */
  { id: 'march', uk: 'Марш на місці', group: 'warm', view: 'side', met: 3.5, low: true, key: 0,
    frames: [
      { pose: stand({ legN: [82, 4], armN: [-35, -20], armF: [40, 95] }), ms: 380 },
      { pose: stand({ armN: [5, 10], armF: [0, 5] }), ms: 380 },
      { pose: stand({ legF: [82, 4], armN: [40, 95], armF: [-35, -20] }), ms: 380 },
      { pose: stand({ armN: [5, 10], armF: [0, 5] }), ms: 380 },
    ],
    muscles: 'Ноги, серце', how: ['Стань рівно, плечі розслаблені.', 'По черзі піднімай коліна до рівня стегна, ніби крокуєш.', 'Руки рухаються навхрест з ногами.', 'Став стопу м’яко, з носка на п’яту.'],
    mistakes: ['Сутулитися й дивитися під ноги.', 'Тупотіти: ставити ногу на п’яту з розмаху.'], easier: 'Піднімай коліна нижче, тримайся рукою за спинку стільця.', harder: 'Вище коліна й швидше темп.', breath: 'Дихай рівно, не затримуй подих.' },
  { id: 'armcircle', uk: 'Кругові рухи руками', group: 'warm', view: 'side', met: 2.5, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [0, 0], armF: [0, 0] }), ms: 450 }, { pose: stand({ armN: [120, 120], armF: [120, 120] }), ms: 450 },
      { pose: stand({ armN: [240, 240], armF: [240, 240] }), ms: 450 }, { pose: stand({ armN: [360, 360], armF: [360, 360] }), ms: 0 },
    ],
    muscles: 'Плечі, верх спини', how: ['Стань рівно, ноги на ширині плечей.', 'Прямими руками роби великі кола вперед.', 'Через половину часу — кола назад.'],
    mistakes: ['Піднімати плечі до вух.', 'Прогинатися в попереку.'], easier: 'Менші кола або по одній руці.', harder: 'Більші й повільніші кола.', breath: 'Вдих, коли руки йдуть угору, видих — униз.' },
  { id: 'stepjack', uk: 'Крок убік з руками вгору', group: 'warm', view: 'front', met: 4, low: true, key: 1,
    frames: [
      { pose: front(), ms: 420 }, { pose: front({ hip: [92, 101], legN: { to: [62, 182] }, armN: [-150, -165], armF: [150, 165] }), ms: 420 },
      { pose: front(), ms: 420 }, { pose: front({ hip: [108, 101], legF: { to: [138, 182] }, armN: [-150, -165], armF: [150, 165] }), ms: 420 },
    ],
    muscles: 'Ноги, плечі, серце', how: ['Стань рівно, руки вздовж тіла.', 'Крокни однією ногою вбік і одночасно підніми руки над головою.', 'Повернися, потім крок в інший бік.'],
    mistakes: ['Стрибати: тут ноги лише крокують.', 'Згинати руки в ліктях.'], easier: 'Піднімай руки лише до плечей.', harder: 'Стрибки «зірочка».', breath: 'Вдих — руки вгору, видих — униз.' },
  { id: 'jack', uk: 'Стрибки «зірочка»', group: 'warm', view: 'front', met: 8, low: false, key: 1,
    frames: [
      { pose: front({ legN: { to: [94, 182] }, legF: { to: [106, 182] } }), ms: 260 },
      { pose: front({ hip: [100, 94], legN: { to: [70, 178] }, legF: { to: [130, 178] }, armN: [-160, -172], armF: [160, 172] }), ms: 260 },
    ],
    muscles: 'Усе тіло, серце', how: ['Стань рівно, ноги разом.', 'Стрибком розстав ноги ширше плечей і сплесни руками над головою.', 'Стрибком повернися назад.', 'Приземляйся м’яко на носки.'],
    mistakes: ['Приземлятися на прямі ноги й п’яти.', 'Коліна всередину.'], easier: 'Крок убік з руками вгору (без стрибків).', harder: 'Швидший темп.', breath: 'Дихай ритмічно.' },
  { id: 'highknee', uk: 'Біг на місці з високими колінами', group: 'warm', view: 'side', met: 8, low: false, key: 0,
    frames: [
      { pose: stand({ hip: [100, 97], torso: 176, legN: [100, 8], legF: { to: [96, 179] }, footF: 60, armN: [-40, 60], armF: [45, 140] }), ms: 230 },
      { pose: stand({ hip: [100, 99], torso: 177, armN: [0, 60], armF: [0, 60] }), ms: 230 },
      { pose: stand({ hip: [100, 97], torso: 176, legF: [100, 8], legN: { to: [104, 179] }, footN: 60, armN: [45, 140], armF: [-40, 60] }), ms: 230 },
      { pose: stand({ hip: [100, 99], torso: 177, armN: [0, 60], armF: [0, 60] }), ms: 230 },
    ],
    muscles: 'Ноги, прес, серце', how: ['Біжи на місці, піднімаючи коліна до рівня стегна.', 'Працюй руками, як під час бігу.', 'Приземляйся на носки, м’яко.'],
    mistakes: ['Відхилятися назад.', 'Тупотіти п’ятами.'], easier: 'Марш на місці.', harder: 'Швидший темп, коліна вище.', breath: 'Коротко й ритмічно.' },

  /* ---- legs ---- */
  { id: 'squat', uk: 'Присідання', group: 'legs', view: 'side', met: 5, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [30, 40], armF: [25, 35] }), ms: 1000 },
      { pose: stand({ hip: [84, 132], torso: 148, armN: [95, 95], armF: [92, 92] }), ms: 1000, hold: 300 },
    ],
    muscles: 'Стегна, сідниці', how: ['Ноги на ширині плечей, носки трохи врозтіч.', 'Відводь таз назад, ніби сідаєш на стілець, руки вперед.', 'Опускайся, поки стегна не стануть майже паралельно підлозі.', 'Відштовхнися п’ятами й випрямися.'],
    mistakes: ['П’яти відриваються від підлоги.', 'Коліна зводяться всередину.', 'Спина круглиться.'], easier: 'Присідання до стільця.', harder: 'Затримка внизу на 2 секунди.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'chairsquat', uk: 'Присідання до стільця', group: 'legs', view: 'side', props: ['chair'], met: 3.5, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [30, 40], armF: [25, 35] }), ms: 1200 },
      { pose: stand({ hip: [72, 136], torso: 146, armN: [92, 92], armF: [90, 90] }), ms: 1200, hold: 400 },
    ],
    muscles: 'Стегна, сідниці', how: ['Стань спиною до стільця на відстані кроку.', 'Повільно відводь таз назад і торкнися сидіння сідницями.', 'Не сідай повністю: одразу вставай, відштовхуючись п’ятами.'],
    mistakes: ['Плюхатися на стілець.', 'Допомагати руками.'], easier: 'Сідай повністю, а вставай з опорою руками на коліна.', harder: 'Звичайні присідання без стільця.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'lunge', uk: 'Випад назад', group: 'legs', view: 'side', met: 5, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [-8, 40], armF: [-8, 40] }), ms: 900 },
      { pose: stand({ hip: [94, 134], armN: [-8, 40], armF: [-8, 40], legN: { to: [108, 182] }, legF: { to: [48, 176] }, footF: 50 }), ms: 900, hold: 300 },
    ],
    muscles: 'Стегна, сідниці', how: ['Стань рівно, руки на поясі.', 'Зроби широкий крок однією ногою назад і опустися, поки заднє коліно майже не торкнеться підлоги.', 'Переднє коліно над стопою, корпус рівний.', 'Відштовхнися передньою ногою й повернися. Чергуй ноги.'],
    mistakes: ['Переднє коліно виходить далеко за носок.', 'Нахил корпусу вперед.'], easier: 'Тримайся рукою за стілець або стіну.', harder: 'Повільніше опускання: 3 секунди.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'sidelunge', uk: 'Випад у сторону', group: 'legs', view: 'front', met: 5, low: true, key: 1,
    frames: [
      { pose: front({ legN: { to: [80, 182] }, legF: { to: [120, 182] }, armN: [20, 150], armF: [-20, -150] }), ms: 900 },
      { pose: front({ hip: [80, 124], torso: 186, legN: { to: [62, 182] }, legF: { to: [132, 182] }, armN: [25, 150], armF: [-15, -150] }), ms: 900, hold: 250 },
      { pose: front({ legN: { to: [80, 182] }, legF: { to: [120, 182] }, armN: [20, 150], armF: [-20, -150] }), ms: 900 },
      { pose: front({ hip: [120, 124], torso: 174, legN: { to: [68, 182] }, legF: { to: [138, 182] }, armN: [15, 150], armF: [-25, -150] }), ms: 900, hold: 250 },
    ],
    muscles: 'Внутрішня й зовнішня частина стегна, сідниці', how: ['Стань, ноги вдвічі ширше плечей, носки вперед.', 'Переносячи вагу на одну ногу, згинай її в коліні й відводь таз назад.', 'Друга нога пряма. Повернися в центр і зроби в інший бік.'],
    mistakes: ['Коліно зігнутої ноги «падає» всередину.', 'П’ята відривається.'], easier: 'Менша глибина.', harder: 'Глибше, з паузою внизу.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'calf', uk: 'Підйоми на носки', group: 'legs', view: 'side', met: 3, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [5, 10] }), ms: 700 },
      { pose: stand({ hip: [102, 89], armN: [5, 10], legN: { to: [107, 171] }, legF: { to: [99, 171] }, footN: 42, footF: 42 }), ms: 700, hold: 400 },
    ],
    muscles: 'Литки', how: ['Стань рівно, можна триматися за стіну.', 'Повільно піднімись на носки якомога вище.', 'Затримайся на секунду й повільно опустись.'],
    mistakes: ['Розгойдуватися.', 'Різко падати на п’яти.'], easier: 'Тримайся обома руками за спинку стільця.', harder: 'На одній нозі.', breath: 'Видих — угору, вдих — униз.' },
  { id: 'bridge', uk: 'Ягідний місток', group: 'legs', view: 'side', props: ['mat'], met: 3.5, low: true, key: 1,
    frames: [
      { pose: { ...SUP, armN: { to: [110, 182] }, armF: { to: [106, 182] }, ...legsTo([140, 181]), footN: 92, footF: 92 }, ms: 1000 },
      { pose: { hip: [106, 140], torso: -67, head: 24, armN: { to: [110, 182] }, armF: { to: [106, 182] }, ...legsTo([140, 181]), footN: 92, footF: 92 }, ms: 1000, hold: 700 },
    ],
    muscles: 'Сідниці, задня поверхня стегна, поперек', how: ['Ляж на спину, ноги зігнуті, стопи на підлозі на ширині таза.', 'Руки вздовж тіла.', 'Підніми таз, стискаючи сідниці, щоб тіло від колін до плечей стало прямою лінією.', 'Затримайся й повільно опустись.'],
    mistakes: ['Прогинатися в попереку замість роботи сідниць.', 'Розводити коліна.'], easier: 'Піднімай таз невисоко.', harder: 'На одній нозі, друга витягнута.', breath: 'Видих — угору, вдих — униз.' },
  { id: 'sideleg', uk: 'Відведення ноги вбік стоячи', group: 'legs', view: 'front', met: 3, low: true, key: 1,
    frames: [
      { pose: front({ armN: { to: [86, 102] }, armF: { to: [114, 102] } }), ms: 800 },
      { pose: front({ hip: [97, 100], torso: 184, armN: { to: [83, 102] }, armF: { to: [111, 102] }, legF: [48, 48] }), ms: 800, hold: 300 },
      { pose: front({ armN: { to: [86, 102] }, armF: { to: [114, 102] } }), ms: 800 },
      { pose: front({ hip: [103, 100], torso: 176, armN: { to: [89, 102] }, armF: { to: [117, 102] }, legN: [-48, -48] }), ms: 800, hold: 300 },
    ],
    muscles: 'Бічна частина стегна й сідниць', how: ['Стань рівно, руки на поясі (або тримайся за стілець).', 'Не нахиляючи корпус, відведи пряму ногу вбік.', 'Повільно повернися. Зроби з кожною ногою.'],
    mistakes: ['Розвертати носок угору.', 'Нахилятися в протилежний бік.'], easier: 'Менша амплітуда, з опорою.', harder: 'Затримка вгорі на 2 секунди.', breath: 'Видих — нога вбік.' },

  /* ---- upper body ---- */
  { id: 'wallpush', uk: 'Віджимання від стіни', group: 'upper', view: 'side', props: ['wall'], met: 3, low: true, key: 1,
    frames: [
      { pose: { ...lean(168), armN: { to: [176, 62] }, armF: { to: [176, 66] }, legN: { to: [98, 182] }, legF: { to: [92, 182] } }, ms: 1000 },
      { pose: { ...lean(156), armN: { to: [176, 62] }, armF: { to: [176, 66] }, legN: { to: [98, 182] }, legF: { to: [92, 182] } }, ms: 1000, hold: 300 },
    ],
    muscles: 'Груди, руки, плечі', how: ['Стань на відстані витягнутих рук від стіни.', 'Долоні на стіні на рівні плечей, трохи ширше за них.', 'Згинай руки й наближай груди до стіни, тіло пряме.', 'Відштовхнися назад.'],
    mistakes: ['Прогинатися в попереку.', 'Розводити лікті в сторони під прямим кутом.'], easier: 'Стань ближче до стіни.', harder: 'Віджимання від столу або з колін.', breath: 'Вдих — до стіни, видих — від стіни.' },
  { id: 'kneepush', uk: 'Віджимання з колін', group: 'upper', view: 'side', props: ['mat'], met: 3.8, low: true, key: 0,
    frames: [
      { pose: { ...KP_TOP, ...handsDown(140), legN: { to: [30, 180] }, legF: { to: [26, 180] }, footN: -90, footF: -90 }, ms: 1000 },
      { pose: { ...KP_LOW, ...handsDown(140), legN: { to: [30, 180] }, legF: { to: [26, 180] }, footN: -90, footF: -90 }, ms: 1000, hold: 200 },
    ],
    muscles: 'Груди, руки, плечі', how: ['Стань на коліна, долоні на підлозі під плечима, трохи ширше.', 'Тіло від колін до голови — пряма лінія.', 'Згинай руки й опускай груди до підлоги.', 'Вижми себе вгору.'],
    mistakes: ['Таз стирчить угору.', 'Голова опускається вниз.'], easier: 'Віджимання від стіни.', harder: 'Класичні віджимання.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'pushup', uk: 'Віджимання', group: 'upper', view: 'side', props: ['mat'], met: 5, low: true, key: 0,
    frames: [
      { pose: { ...PU_TOP, ...handsDown(150), legN: TOES(32), legF: TOES(28), footN: 40, footF: 40 }, ms: 1000 },
      { pose: { ...PU_LOW, ...handsDown(150), legN: TOES(32), legF: TOES(28), footN: 40, footF: 40 }, ms: 1000, hold: 200 },
    ],
    muscles: 'Груди, руки, плечі, прес', how: ['Упор лежачи: долоні під плечима, тіло — пряма лінія від п’ят до голови.', 'Згинай руки, лікті трохи назад, і опускай груди майже до підлоги.', 'Вижми себе вгору, не прогинаючись.'],
    mistakes: ['Провисає поперек.', 'Лікті в сторони під прямим кутом.'], easier: 'Віджимання з колін.', harder: 'Повільне опускання на 3 рахунки.', breath: 'Вдих — униз, видих — угору.' },
  { id: 'superman', uk: 'Супермен', group: 'upper', view: 'side', props: ['mat'], met: 3, low: true, key: 1,
    frames: [
      { pose: { hip: [88, 176], torso: 90, armN: [90, 90], armF: [92, 92], legN: [-90, -90], legF: [-92, -92], footN: -90, footF: -90 }, ms: 1000 },
      { pose: { hip: [88, 176], torso: 100, head: -6, armN: [104, 104], armF: [106, 106], legN: [-102, -102], legF: [-104, -104], footN: -100, footF: -100 }, ms: 1000, hold: 800 },
    ],
    muscles: 'Спина, сідниці', how: ['Ляж на живіт, руки витягни вперед.', 'Одночасно трохи підніми руки, груди й ноги.', 'Затримайся на 2 секунди й опустись.'],
    mistakes: ['Задирати голову: дивись у підлогу.', 'Різкі ривки.'], easier: 'Піднімай по черзі руку й протилежну ногу.', harder: 'Довша затримка вгорі.', breath: 'Видих — угору.' },

  /* ---- core ---- */
  { id: 'plank', uk: 'Планка', group: 'core', view: 'side', props: ['mat'], met: 3.5, low: true, key: 0,
    frames: [
      { pose: { ...PLANK, armN: [0, 88], armF: [-2, 86], legN: TOES(24), legF: TOES(20), footN: 40, footF: 40 }, ms: 1600 },
      { pose: { ...PLANK, hip: [PLANK.hip[0], PLANK.hip[1] - 1.5], armN: [0, 88], armF: [-2, 86], legN: TOES(24), legF: TOES(20), footN: 40, footF: 40 }, ms: 1600 },
    ],
    muscles: 'Прес, спина, плечі', how: ['Упор на передпліччя: лікті під плечима.', 'Ноги прямі, на носках. Тіло — пряма лінія.', 'Втягни живіт, стисни сідниці й тримай.'],
    mistakes: ['Провисає поперек.', 'Таз задертий угору.', 'Затримувати дихання.'], easier: 'Планка з колін.', harder: 'Підніми одну ногу на кілька секунд.', breath: 'Дихай спокійно весь час.' },
  { id: 'deadbug', uk: 'Мертвий жук', group: 'core', view: 'side', props: ['mat'], met: 3, low: true, key: 1,
    frames: [
      { pose: { ...SUP, armN: [180, 180], armF: [178, 178], legN: [180, 90], legF: [178, 88] }, ms: 900 },
      { pose: { ...SUP, armN: [262, 262], armF: [178, 178], legN: [180, 90], legF: [96, 96], footF: 110 }, ms: 900, hold: 300 },
      { pose: { ...SUP, armN: [180, 180], armF: [178, 178], legN: [180, 90], legF: [178, 88] }, ms: 900 },
      { pose: { ...SUP, armN: [180, 180], armF: [262, 262], legN: [96, 96], legF: [178, 88], footN: 110 }, ms: 900, hold: 300 },
    ],
    muscles: 'Глибокі м’язи живота', how: ['Ляж на спину, руки витягни вгору, ноги зігнуті під прямим кутом.', 'Притисни поперек до підлоги.', 'Повільно опусти одну руку за голову і протилежну ногу вперед, не торкаючись підлоги.', 'Повернися і зміни сторону.'],
    mistakes: ['Поперек відривається від підлоги.', 'Поспіх.'], easier: 'Рухай лише ногами, руки нерухомі.', harder: 'Повільніше, з паузою в кінці.', breath: 'Видих — коли руку й ногу відводиш.' },
  { id: 'birddog', uk: 'Птах-собака', group: 'core', view: 'side', props: ['mat'], met: 3, low: true, key: 1,
    frames: [
      { pose: { hip: [88, 138], torso: 95, armN: { to: [136, 184] }, armF: { to: [132, 184] }, legN: [0, -90], legF: [-2, -92], footN: -90, footF: -90 }, ms: 900 },
      { pose: { hip: [88, 138], torso: 93, armN: [100, 100], armF: { to: [132, 184] }, legN: [0, -90], legF: [-96, -96], footF: -96 }, ms: 900, hold: 700 },
      { pose: { hip: [88, 138], torso: 95, armN: { to: [136, 184] }, armF: { to: [132, 184] }, legN: [0, -90], legF: [-2, -92], footN: -90, footF: -90 }, ms: 900 },
      { pose: { hip: [88, 138], torso: 93, armN: { to: [136, 184] }, armF: [100, 100], legN: [-96, -96], legF: [-2, -92], footN: -96, footF: -90 }, ms: 900, hold: 700 },
    ],
    muscles: 'Спина, прес, сідниці', how: ['Стань на коліна й долоні: коліна під тазом, долоні під плечима.', 'Одночасно витягни вперед одну руку і назад протилежну ногу.', 'Тримай таз рівно, затримайся на 2 секунди.', 'Повернися і зміни сторону.'],
    mistakes: ['Прогинатися в попереку.', 'Розвертати таз.'], easier: 'Витягуй лише ногу або лише руку.', harder: 'Довша затримка, повільніше.', breath: 'Видих — коли витягуєш.' },
  { id: 'crunch', uk: 'Скручування', group: 'core', view: 'side', props: ['mat'], met: 3.8, low: true, key: 1,
    frames: [
      { pose: { ...SUP, armN: [93, 93], armF: [91, 91], ...legsTo([140, 181]), footN: 92, footF: 92 }, ms: 900 },
      { pose: { ...SUP, torso: -112, head: -10, armN: [112, 112], armF: [110, 110], ...legsTo([140, 181]), footN: 92, footF: 92 }, ms: 900, hold: 300 },
    ],
    muscles: 'Прес', how: ['Ляж на спину, ноги зігнуті, стопи на підлозі.', 'Руки витягни вздовж тіла над підлогою.', 'На видиху відірви лопатки від підлоги й потягнися руками до колін.', 'Повільно опустись.'],
    mistakes: ['Тягнути себе за шию.', 'Відривати поперек.'], easier: 'Менша амплітуда.', harder: 'Руки за головою, лікті в сторони.', breath: 'Видих — угору, вдих — униз.' },
  { id: 'climber', uk: 'Скелелаз', group: 'core', view: 'side', props: ['mat'], met: 8, low: false, key: 0,
    frames: [
      { pose: { ...PU_TOP, ...handsDown(150), legN: [58, -58], legF: TOES(28), footN: 60, footF: 40 }, ms: 330 },
      { pose: { ...PU_TOP, ...handsDown(150), legN: TOES(32), legF: [58, -58], footN: 40, footF: 60 }, ms: 330 },
    ],
    muscles: 'Прес, плечі, серце', how: ['Упор лежачи на прямих руках.', 'По черзі підтягуй коліна до грудей.', 'Таз тримай низько, спина рівна.'],
    mistakes: ['Таз задирається вгору.', 'Плечі заходять далеко за долоні.'], easier: 'Повільно, крок за кроком, або з упором руками на стілець.', harder: 'Швидший темп.', breath: 'Коротко й ритмічно.' },
  { id: 'standcross', uk: 'Коліно до ліктя стоячи', group: 'core', view: 'side', met: 4, low: true, key: 1,
    frames: [
      { pose: stand({ armN: [-150, 30], armF: [-150, 30] }), ms: 500 },
      { pose: stand({ torso: 164, armN: [-150, 30], armF: [-30, 100], legN: [92, 0] }), ms: 500, hold: 100 },
      { pose: stand({ armN: [-150, 30], armF: [-150, 30] }), ms: 500 },
      { pose: stand({ torso: 164, armN: [-30, 100], armF: [-150, 30], legF: [92, 0] }), ms: 500, hold: 100 },
    ],
    muscles: 'Косі м’язи живота, ноги', how: ['Стань рівно, долоні за головою.', 'Підніми коліно і поверни корпус, тягнучи до нього протилежний лікоть.', 'Повернися і зміни сторону.'],
    mistakes: ['Тягнути голову руками.', 'Горбитися: повертай корпус, а не голову.'], easier: 'Нижче коліно, з опорою рукою на стілець.', harder: 'Швидший темп.', breath: 'Видих — коли коліно йде до ліктя.' },

  /* ---- stretching ---- */
  { id: 'hamstring', uk: 'Нахил до ніг', group: 'stretch', view: 'side', met: 2.3, low: true, key: 1,
    frames: [
      { pose: stand(), ms: 1500 },
      { pose: stand({ hip: [92, 99], torso: 98, head: 10, armN: [8, 8], armF: [6, 6] }), ms: 1500, hold: 2500 },
    ],
    muscles: 'Задня поверхня стегна, спина', how: ['Стань рівно, коліна трохи зігнуті.', 'Повільно нахиляйся вперед з рівною спиною, руки тягнуться до гомілок.', 'Тримай 20–30 секунд, дихай.', 'Повільно випрямись.'],
    mistakes: ['Пружинити.', 'Тягнутися через біль.'], easier: 'Руки на стегна або на стілець.', harder: 'Ноги прямі, долоні до підлоги.', breath: 'Глибоко, на видиху трохи глибше.' },
  { id: 'quad', uk: 'Розтяжка стегна стоячи', group: 'stretch', view: 'side', met: 2.3, low: true, key: 1,
    frames: [
      { pose: stand({ armF: [40, 80] }), ms: 1200 },
      { pose: stand({ armF: [40, 80], legN: [6, -164], footN: 180, armN: { to: [96, 104] } }), ms: 1200, hold: 3000 },
    ],
    muscles: 'Передня поверхня стегна', how: ['Стань рівно, вільною рукою тримайся за стіну.', 'Зігни ногу й візьми рукою за стопу позаду.', 'Підтягни п’яту до сідниці, коліна поруч.', 'Тримай 20–30 секунд і зміни ногу.'],
    mistakes: ['Відводити коліно вбік.', 'Прогинатися в попереку.'], easier: 'Тримай стопу за штанину або рушником.', harder: 'Без опори.', breath: 'Спокійно й глибоко.' },
  { id: 'breathe', uk: 'Глибоке дихання з руками', group: 'stretch', view: 'front', met: 1.5, low: true, key: 1,
    frames: [
      { pose: front(), ms: 2600 },
      { pose: front({ armN: [-168, -176], armF: [168, 176] }), ms: 2600, hold: 600 },
    ],
    muscles: 'Відновлення', how: ['Стань рівно.', 'На вдиху через ніс повільно підніми руки через сторони над головою.', 'На видиху повільно опусти.'],
    mistakes: ['Поспішати.', 'Піднімати плечі.'], easier: 'Сидячи.', harder: '—', breath: 'Вдих 4 рахунки, видих 6.' },
];
export const MOVE = Object.fromEntries(MOVES.map((m) => [m.id, m]));
export { FLOOR };
