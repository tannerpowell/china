/** Site UI chrome dictionary (English + Simplified Chinese).
 *
 * Scope is UI CHROME ONLY — navigation, headers, buttons, helper copy.
 * Dish names, descriptions, category titles, modifier labels, prices, and
 * business proper nouns always render in English (see T component docs).
 * Internal pages (/launch, /menu-questions, /studio) keep their own copy.
 */

export type SiteLang = "en" | "zh";

export const SITE_LANG_KEY = "china-island-lang";

type Entry = { en: string; zh: string };

export const STR: Record<string, Entry> = {
  // Shell / sidebar
  "nav.menu": { en: "Menu", zh: "菜单" },
  "nav.order": { en: "Order Online", zh: "在线订餐" },
  "nav.visit": { en: "Visit Us", zh: "到店信息" },
  "nav.call": { en: "Call to Order", zh: "致电订餐" },
  "nav.hours": { en: "Hours", zh: "营业时间" },
  "nav.theme": { en: "Preview theme", zh: "预览主题" },
  "nav.lang": { en: "Language", zh: "语言" },
  "nav.blurb": {
    en: "Fresh Asian cuisine made with care. Dine-in • Take-out • Delivery.",
    zh: "用心烹制的亚洲美食。堂食 • 自取 • 外卖。",
  },
  "hours.sunThu": { en: "Sun–Thu", zh: "周日–周四" },
  "hours.friSat": { en: "Fri–Sat", zh: "周五–周六" },
  "theme.classic": { en: "Classic theme", zh: "经典主题" },
  "theme.warm": { en: "Warm theme", zh: "暖色主题" },
  "theme.dark": { en: "Dark theme", zh: "深色主题" },
  "theme.group": { en: "Site theme", zh: "网站主题" },

  // Home
  "home.welcome": { en: "Welcome", zh: "欢迎" },
  "home.lede": {
    en: "Browse our menu and order your favorites online. Click any category below to explore our dishes.",
    zh: "在线浏览菜单、点您喜欢的菜，点击下方分类查看。",
  },
  "home.card.soups": { en: "Soups", zh: "汤类" },
  "home.card.soupsTitle": { en: "Start with Soup", zh: "先来碗汤" },
  "home.card.appetizers": { en: "Appetizers", zh: "前菜" },
  "home.card.appetizersTitle": { en: "Appetizers", zh: "开胃前菜" },
  "home.card.favorites": { en: "House Favorites", zh: "招牌菜" },
  "home.card.favoritesTitle": { en: "Favorites", zh: "人气招牌" },
  "home.card.friedRice": { en: "Fried Rice", zh: "炒饭" },
  "home.card.friedRiceTitle": { en: "Fried Rice", zh: "粒粒分明" },
  "home.card.noodles": { en: "Noodles", zh: "面食" },
  "home.card.noodlesTitle": { en: "Noodles", zh: "面面俱到" },
  "home.card.specialties": { en: "Specialties", zh: "特色菜" },
  "home.card.specialtiesTitle": { en: "Chef's Specials", zh: "主厨特色" },
  "home.viewMenu": { en: "View Full Menu", zh: "查看完整菜单" },
  "home.checklist": { en: "Go-live checklist →", zh: "上线清单 →" },

  // Location
  "loc.title": { en: "Location Info", zh: "到店信息" },
  "loc.call": { en: "Call to Order", zh: "致电订餐" },
  "loc.pickup": {
    en: "Call ahead for pickup — about 15 minutes normally, about 30 minutes during the evening rush (5:30–7:30 p.m.).",
    zh: "请提前电话订餐自取——平时约15分钟，晚间高峰（5:30–7:30）约30分钟。",
  },
  "loc.address": { en: "Address", zh: "地址" },
  "loc.hours": { en: "Hours", zh: "营业时间" },
  "loc.hoursSunThu": { en: "Sunday – Thursday", zh: "周日–周四" },
  "loc.hoursFriSat": { en: "Friday – Saturday", zh: "周五–周六" },
  "loc.about": { en: "About", zh: "关于我们" },
  "loc.aboutTitle": { en: "Sichuan, Mandarin & Hunan", zh: "川湘风味" },
  "loc.about1": {
    en: "Find us in the Highland of Flower Mound Shopping Center in Flower Mound. Dine in, grab takeout, or get your favorites delivered.",
    zh: "我们位于 Flower Mound 的 Highland 购物中心，欢迎堂食、自取，或将您喜欢的菜品外卖到家。",
  },
  "loc.about2": {
    en: "Everything is cooked to order, and online ordering makes dinner easy.",
    zh: "所有菜品现点现做，在线订餐让晚餐更省心。",
  },
  "loc.delivery": { en: "Delivery", zh: "外卖" },
  "loc.deliveryTitle": { en: "Get it delivered", zh: "外卖直送" },
  "loc.deliveryBody": {
    en: "Delivery runs 45 minutes to 1 hour normally, 1 to 1.5 hours during the evening rush. Call to verify. Also find us on your favorite delivery app:",
    zh: "平时外卖约45分钟到1小时，晚间高峰约1到1.5小时，请电话确认。也可以在以下外卖平台找到我们：",
  },
  "loc.faq": { en: "FAQ", zh: "常见问题" },
  "loc.faqTitle": { en: "Good to know", zh: "须知" },
  "loc.faq1q": { en: "How long does pickup take?", zh: "自取要等多久？" },
  "loc.faq1a": {
    en: "About 15 minutes normally, and about 30 minutes during the evening rush (5:30–7:30 p.m.). Call ahead and we'll have it ready.",
    zh: "平时约15分钟，晚间高峰（5:30–7:30）约30分钟。提前来电，我们会准备好。",
  },
  "loc.faq2q": { en: "Do you offer delivery?", zh: "提供外卖吗？" },
  "loc.faq2a": {
    en: "Yes. Delivery runs 45 minutes to 1 hour normally, and 1 to 1.5 hours during the evening rush — call to verify. We're also on Uber Eats and Grubhub.",
    zh: "提供。平时约45分钟到1小时，晚间高峰约1到1.5小时——请电话确认。我们也在 Uber Eats 和 Grubhub 上。",
  },
  "loc.faq3q": { en: "Where are you located?", zh: "餐厅在哪里？" },
  "loc.faq3a": {
    en: "6101 Long Prairie Rd, Suite 740, Flower Mound, TX 75028, in the Highland of Flower Mound Shopping Center.",
    zh: "6101 Long Prairie Rd, Suite 740, Flower Mound, TX 75028（Highland of Flower Mound 购物中心内）。",
  },
  "loc.faq4q": { en: "What are your hours?", zh: "营业时间是？" },
  "loc.faq4a": {
    en: "Sunday through Thursday, 11 a.m. to 9 p.m.; Friday and Saturday, 11 a.m. to 9:30 p.m.",
    zh: "周日到周四，上午11点到晚上9点；周五周六，上午11点到晚上9点半。",
  },

  // Order page
  "order.title": { en: "Order", zh: "订餐" },
  "order.body": {
    en: "Ordering currently links out while we replace checkout.",
    zh: "新的结账功能即将上线，目前先跳转到现有订餐页面。",
  },
  "order.call": { en: "Call for Takeout", zh: "致电自取" },
  "order.empty": { en: "Your cart is empty", zh: "购物车是空的" },
  "order.emptyBody": {
    en: "Browse the menu and add something delicious — pickup and delivery available.",
    zh: "去菜单看看，加点好吃的——支持自取和外卖。",
  },
  "order.browse": { en: "Browse Menu", zh: "浏览菜单" },
  "order.summary": { en: "Your order", zh: "您的订单" },
  "order.count": { en: "{n} items", zh: "{n} 件商品" },
  "order.clear": { en: "Clear", zh: "清空" },
  "order.checkout": { en: "Continue to Checkout", zh: "去结账" },
  "order.subtotal": { en: "Subtotal", zh: "小计" },
  "order.tax": { en: "Tax", zh: "税费" },
  "order.total": { en: "Total", zh: "总计" },
  "order.remove": { en: "Remove", zh: "删除" },

  // Interactive menu
  "menu.searchPh": { en: "Search menu...", zh: "搜索菜单…" },
  "menu.searchAria": { en: "Search menu items", zh: "搜索菜品" },
  "menu.allItems": { en: "ALL ITEMS", zh: "全部" },
  "menu.item1": { en: "item", zh: "道菜" },
  "menu.itemN": { en: "items", zh: "道菜" },
  "menu.noResults": { en: "No items found", zh: "没有找到菜品" },
  "menu.noResultsHint": { en: "Try adjusting your search", zh: "换个关键词试试" },
  "menu.viewCart": { en: "View Cart", zh: "查看购物车" },
  "menu.singlePage": { en: "Single Page", zh: "单页版" },
  "menu.mp": { en: "MP", zh: "时价" },
  "menu.modalClose": { en: "Close modal", zh: "关闭窗口" },
  "menu.modalMp": { en: "Market Price", zh: "时价" },
  "menu.modalRequired": { en: "(Required)", zh: "（必选）" },
  "menu.modalOne": { en: "Choose one", zh: "选择一项" },
  "menu.modalUpTo": { en: "Choose up to", zh: "最多选择" },
  "menu.modalNotes": { en: "Special Instructions", zh: "特殊要求" },
  "menu.modalNotesPh": {
    en: "Any allergies or special requests?",
    zh: "有过敏或特殊要求请注明",
  },
  "menu.modalDec": { en: "Decrease quantity", zh: "减少数量" },
  "menu.modalInc": { en: "Increase quantity", zh: "增加数量" },
  "menu.modalAdd": { en: "Add to Order", zh: "加入订单" },
  "menu.modalAdded": { en: "Added!", zh: "已加入！" },

  // Single-page menu
  "all.brand": { en: "Full Menu", zh: "完整菜单" },
  "all.title": { en: "The Full Menu", zh: "完整菜单" },
  "all.lede": {
    en: "Every dish, start to finish — {n} items across {s} sections. Scroll, or jump straight to a craving.",
    zh: "从头到尾每一道菜——{s}个分类共{n}道菜。慢慢看，或直接跳到想吃的那类。",
  },
  "all.sectionLine": {
    en: "Section {num} · {n} dishes",
    zh: "第 {num} 部分 · {n} 道菜",
  },
  "all.spicy": { en: "spicy", zh: "辣味" },
  "all.veg": { en: "vegetarian", zh: "素食" },
  "all.pop": { en: "house favorite", zh: "招牌" },
  "all.mpFull": { en: "market price", zh: "时价" },
  "all.orderCta": { en: "Order Online", zh: "在线订餐" },
  "all.callCta": { en: "Call", zh: "致电" },
  "all.searchAria": { en: "Search the menu", zh: "搜索菜单" },
  "all.searchPh": { en: "Search dishes…", zh: "搜索菜品…" },
  "all.searchClose": { en: "Close search", zh: "关闭搜索" },
  "all.searchMin": { en: "Type at least 2 characters.", zh: "至少输入2个字。" },
  "all.searchMatch1": { en: "match", zh: "个结果" },
  "all.searchMatchN": { en: "matches", zh: "个结果" },
  "all.searchFirst": {
    en: "Enter jumps to the first.",
    zh: "回车跳到第一个。",
  },
  "all.searchEsc": { en: "Esc closes.", zh: "Esc 关闭。" },
  "all.searchNone": { en: "No dishes match", zh: "没有匹配的菜品" },
  "all.more": { en: "More sections", zh: "更多分类" },
  "all.footerCta": { en: "Hungry? Skip the scroll.", zh: "饿了？直接下单吧。" },
  "all.interactive": { en: "Interactive Menu", zh: "互动版菜单" },
  "all.home": { en: "Home", zh: "首页" },
  "all.top": { en: "Back to top ↑", zh: "回到顶部 ↑" },

  // 404
  "nf.title": { en: "Not on the menu", zh: "本页不在菜单上" },
  "nf.body": {
    en: "That page doesn't exist — but dinner still does. Head back home or browse the menu.",
    zh: "这个页面不存在——但晚餐还在。回首页或看看菜单吧。",
  },
  "nf.home": { en: "Back to Home", zh: "回到首页" },
  "nf.menu": { en: "View Menu", zh: "查看菜单" },
};

export function st(key: string, lang: SiteLang): string {
  return STR[key]?.[lang] ?? STR[key]?.en ?? key;
}

/** Template lookup: replaces {name} placeholders with vars. */
export function tf(
  key: string,
  lang: SiteLang,
  vars: Record<string, string | number>
): string {
  let s = st(key, lang);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
