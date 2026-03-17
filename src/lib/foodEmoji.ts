/**
 * Returns a matching food emoji based on the dish name (Russian + English keywords).
 * Falls back to 🍽️ for unrecognized dishes.
 */
export function getFoodEmoji(name: string): string {
  const n = name.toLowerCase();

  // ── Птица ──────────────────────────────────────────────
  if (/(курин|грудк|курица|цыплён|индейк|утк|chicken|turkey)/.test(n)) return '🍗';
  if (/котлет|фрикадел/.test(n)) return '🍖';

  // ── Мясо ───────────────────────────────────────────────
  if (/(говяд|стейк|beef|бургер|burger)/.test(n)) return '🥩';
  if (/(свинин|свин|бекон|bacon|ветчин)/.test(n)) return '🥓';
  if (/(баранин|ягнён|lamb)/.test(n)) return '🍖';
  if (/(сосиск|колбас|сардельк|хот-дог|hot.?dog)/.test(n)) return '🌭';

  // ── Рыба и морепродукты ────────────────────────────────
  if (/(лосос|сёмг|salmon)/.test(n)) return '🐟';
  if (/(рыб|треск|тунец|горбуш|скумбри|сельд|форел|fish|seabass|окун)/.test(n)) return '🐠';
  if (/(краб|кревет|кальмар|осьминог|мидий|shrimp|crab|seafood|морепродукт)/.test(n)) return '🦐';
  if (/(икр|икра)/.test(n)) return '🍣';
  if (/(суши|роллы|сашими|sushi|roll)/.test(n)) return '🍣';

  // ── Яйца и молочное ────────────────────────────────────
  if (/(омлет|яичниц|яйц|яиц|scrambled|fried egg)/.test(n)) return '🍳';
  if (/^яйц|^яиц/.test(n) || n === 'яйца') return '🥚';
  if (/(творог|творожн)/.test(n)) return '🧀';
  if (/(сыр|cheese)/.test(n)) return '🧀';
  if (/(молок|кефир|ряженк|йогурт|milk|yogurt)/.test(n)) return '🥛';
  if (/(масл|butter|margarin)/.test(n)) return '🧈';
  if (/(сметан|cream|сливк)/.test(n)) return '🥛';

  // ── Супы ───────────────────────────────────────────────
  if (/(борщ|свекольн)/.test(n)) return '🍲';
  if (/(щи|рассольник|солянк|харчо|минестрон|похлёбк|бульон)/.test(n)) return '🍲';
  if (/(суп|soup|стю|stew)/.test(n)) return '🥣';
  if (/окрошк/.test(n)) return '🥗';

  // ── Каши и злаки ──────────────────────────────────────
  if (/(овсянк|геркулес|oatmeal|мюсли|granola|гранол)/.test(n)) return '🥣';
  if (/(гречк|buckwheat)/.test(n)) return '🌾';
  if (/\bрис\b|ризотто|плов|рисовый/.test(n)) return '🍚';
  if (/(макарон|паст|спагетти|лапш|фетучин|пенне|pasta|noodle)/.test(n)) return '🍝';
  if (/(хлеб|тост|bread|toast|бутерброд|сэндвич|sandwich)/.test(n)) return '🍞';
  if (/(блин|панкейк|pancake|вафл|waffle)/.test(n)) return '🥞';
  if (/(пельмен|вареник|хинкал|манты|dumpling)/.test(n)) return '🥟';
  if (/(пирог|пирожок|пицц|pizza|calzone)/.test(n)) return '🍕';
  if (/(пита|лаваш|тортилья|шаурм|буррито|бурито|wrap)/.test(n)) return '🌯';
  if (/(такос|taco)/.test(n)) return '🌮';

  // ── Овощи ─────────────────────────────────────────────
  if (/(салат|цезарь|греческ|нисуаз|оливье|vinaigrette|винегрет)/.test(n)) return '🥗';
  if (/(брокколи|цветная капуст|кабачок|цукини|zucchini)/.test(n)) return '🥦';
  if (/(морковь|морков|carrot)/.test(n)) return '🥕';
  if (/(картофел|картошк|пюре|potato|fries|драник)/.test(n)) return '🥔';
  if (/(помидор|томат|tomato)/.test(n)) return '🍅';
  if (/(огурец|огурц|cucumber)/.test(n)) return '🥒';
  if (/(перец болгарск|bell pepper)/.test(n)) return '🫑';
  if (/(авокадо|avocado)/.test(n)) return '🥑';
  if (/(кукурузa|кукурузн|corn)/.test(n)) return '🌽';
  if (/(грибы|гриб|шампиньон|mushroom|вешенк)/.test(n)) return '🍄';
  if (/(шпинат|spinach|руккола|базилик)/.test(n)) return '🥬';
  if (/(свекл|beetroot)/.test(n)) return '🫚';
  if (/(лук|onion|чеснок|garlic)/.test(n)) return '🧅';
  if (/(тыква|pumpkin|squash)/.test(n)) return '🎃';
  if (/(баклажан|eggplant|aubergine)/.test(n)) return '🍆';

  // ── Фрукты ────────────────────────────────────────────
  if (/(банан|banana)/.test(n)) return '🍌';
  if (/(яблок|apple)/.test(n)) return '🍎';
  if (/(апельсин|мандарин|orange|tangerine)/.test(n)) return '🍊';
  if (/(лимон|lemon|lime|лайм)/.test(n)) return '🍋';
  if (/(клубник|виктори|strawberry)/.test(n)) return '🍓';
  if (/(малин|вишн|черешн|raspberry|cherry)/.test(n)) return '🍒';
  if (/(виноград|grape)/.test(n)) return '🍇';
  if (/(груш|pear)/.test(n)) return '🍐';
  if (/(персик|абрикос|peach|apricot)/.test(n)) return '🍑';
  if (/(арбуз|watermelon)/.test(n)) return '🍉';
  if (/(дын|melon)/.test(n)) return '🍈';
  if (/(ананас|pineapple)/.test(n)) return '🍍';
  if (/(черник|голубик|blueberry)/.test(n)) return '🫐';
  if (/(ягод|berry|смородин)/.test(n)) return '🍓';

  // ── Орехи и семена ────────────────────────────────────
  if (/(орех|грецк|миндал|кешью|арахис|фундук|nut|almond|cashew|peanut)/.test(n)) return '🥜';
  if (/(семечк|семена|подсолнечник|seed)/.test(n)) return '🌻';

  // ── Сладкое и десерты ─────────────────────────────────
  if (/(торт|cake|чизкейк|cheesecake)/.test(n)) return '🎂';
  if (/(пирожн|пирожок|macaroon|макарун|éclair|эклер)/.test(n)) return '🍰';
  if (/(шоколад|chocolate|brownie|брауни)/.test(n)) return '🍫';
  if (/(мороженое|ice.?cream|gelato)/.test(n)) return '🍦';
  if (/(конфет|карамел|candy|sweet|зефир|мармелад)/.test(n)) return '🍬';
  if (/(варень|джем|повидл|honey|мёд|jam)/.test(n)) return '🍯';
  if (/(печень|cookie|biscuit|крекер|cracke)/.test(n)) return '🍪';
  if (/(вафл|wafer)/.test(n)) return '🧇';
  if (/(батончик|энергетик|protein bar|протеин)/.test(n)) return '🍫';
  if (/(мёд|honey)/.test(n)) return '🍯';

  // ── Напитки ───────────────────────────────────────────
  if (/(кофе|латте|капучино|американо|espresso|coffee|latte|cappuccino)/.test(n)) return '☕';
  if (/(чай|tea|матча|matcha)/.test(n)) return '🍵';
  if (/(сок|juice)/.test(n)) return '🧃';
  if (/(смузи|smoothie|коктейл|shake)/.test(n)) return '🥤';
  if (/(вода|water)/.test(n)) return '💧';
  if (/(молок|milk)/.test(n)) return '🥛';

  // ── Блюда смешанные ───────────────────────────────────
  if (/(голубц|cabbage roll)/.test(n)) return '🥬';
  if (/(запеканк|casserole)/.test(n)) return '🫕';
  if (/(рагу|stew|тушён)/.test(n)) return '🍲';
  if (/(жаркое|roast)/.test(n)) return '🍖';
  if (/(гуляш|gulash)/.test(n)) return '🍲';
  if (/(ланч|бокс|bento|lunchbox)/.test(n)) return '🍱';

  return '🍽️';
}
