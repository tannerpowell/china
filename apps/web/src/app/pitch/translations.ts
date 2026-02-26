export type Locale = 'en' | 'zh';

export interface Translations {
  meta: { title: string };
  toggle: string;
  hero: {
    kicker: string;
    titleLine1: string;
    titleAccent: string;
    subtitle: string;
    stats: {
      items: { value: string; label: string };
      categories: { value: string; label: string };
      commission: { value: string; label: string };
    };
  };
  problem: { headline: string; description: string };
  features: ReadonlyArray<{
    id: string;
    headline: string;
    copy: string;
    bullets: readonly string[];
  }>;
  checklist: {
    headline: string;
    subtitle: string;
    liveItems: readonly string[];
    soonLabel: string;
    soonItems: readonly string[];
  };
  cta: { headline: string; subtitle: string; button: string };
  commission: {
    badLabel: string; goodLabel: string;
    order: string; badFee: string; goodFee: string;
    badKeep: string; goodKeep: string; savings: string;
  };
  payment: {
    step1Label: string; step1Sub: string;
    step2Label: string; step2Sub: string;
    step3Label: string; step3Sub: string;
  };
  search: {
    query: string;
    result1Title: string; result1Desc: string;
    result2Title: string; result2Desc: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    meta: {
      title: 'The Pitch — Your New Website',
    },
    toggle: '中文',
    hero: {
      kicker: 'China Island Asian Grill',
      titleLine1: 'Your food deserves a website that',
      titleAccent: 'works as hard as you do.',
      subtitle:
        'A complete online presence — your full menu, online ordering, and a design that makes your food look as good as it tastes. Already built. Ready to go live.',
      stats: {
        items: { value: '114', label: 'Menu Items' },
        categories: { value: '13', label: 'Categories' },
        commission: { value: '$0', label: 'Commission' },
      },
    },
    problem: {
      headline:
        "Your current site can't take orders, doesn't work on phones, and Google barely knows it exists.",
      description:
        "The old site served its purpose. But customers today expect to browse a menu on their phone, add items to a cart, and check out — all without calling. If they can't, they order from somewhere else.",
    },
    features: [
      {
        id: 'menu',
        headline: 'Your entire menu. Every item. Every modifier.',
        copy: "All 114 items across 13 categories, organized the way your customers think about your food. Modifiers, spice levels, protein choices — it's all there. Searchable. Filterable. With a hover preview so customers can see what they're ordering.",
        bullets: [
          '114 items across 13 categories',
          '20 modifier groups (proteins, spice levels, sizes)',
          'Search and filter by name or category',
          'Desktop hover preview with descriptions and prices',
        ],
      },
      {
        id: 'ordering',
        headline: 'Take orders directly. Keep every dollar.',
        copy: "Third-party apps take 15–30% of every order. On a $25 order, that's up to $7.50 gone. When customers order from your site, the money goes to you. No middleman, no commission, no sharing your customer data.",
        bullets: [
          'Zero commission on direct orders',
          'Persistent cart — customers can browse and come back',
          'Modifier customization at checkout',
          'Tax calculated automatically (8.25%)',
        ],
      },
      {
        id: 'mobile',
        headline: 'Works on every phone your customers have.',
        copy: 'Most of your customers will find you on their phone. The menu adapts automatically — horizontal category chips, single-column layout, slide-in cart drawer. No pinching, no zooming, no squinting at tiny text.',
        bullets: [
          'Responsive from 320px phones to 4K desktops',
          'Touch-friendly cart and checkout',
          'Mobile menu drawer with swipe support',
          'Loads fast on cellular connections',
        ],
      },
      {
        id: 'seo',
        headline: "Show up when people search 'Chinese food near me.'",
        copy: "Right now, when someone searches for Chinese food in your area, they might never find you. Your new site has structured data that tells Google exactly what you serve, where you are, and when you're open.",
        bullets: [
          'JSON-LD structured data (Restaurant schema)',
          'XML sitemap for all pages',
          'Canonical URLs to prevent duplicate content',
          'Open Graph tags for social media sharing',
        ],
      },
      {
        id: 'cms',
        headline: 'Change a price in ten seconds. No developer needed.',
        copy: "Seasonal special? Price increase? 86'd an item? Log into the dashboard, make the change, hit publish. Every page on your site updates instantly. The menu, the checkout, everything.",
        bullets: [
          'Sanity CMS — edit menu items, prices, descriptions',
          'Changes go live immediately',
          'Add or remove items and categories',
          'Local data fallback if CMS is ever down',
        ],
      },
      {
        id: 'payments',
        headline: 'Payments go straight to your bank account.',
        copy: "Stripe handles the payment processing — the most trusted platform in the industry. Customers pay on your site, the money deposits directly to your bank. No shared pools, no waiting, no confusion.",
        bullets: [
          'Stripe payment processing — secure and PCI-compliant',
          'Direct deposit to your bank account',
          'Automatic webhook handling for order confirmation',
          'Full transaction history and reporting',
        ],
      },
    ],
    checklist: {
      headline: "This isn't a mockup. It's live code.",
      subtitle: 'Everything with a checkmark is built and working today.',
      liveItems: [
        'Full interactive menu (114 items)',
        '13 menu categories',
        '20 modifier groups',
        'Search and filter',
        'Shopping cart with persistence',
        'Checkout form',
        'Tax calculation (8.25%)',
        'Mobile responsive layout',
        'Loading skeletons',
        'Navigation progress bar',
        'SEO (sitemap, JSON-LD, robots)',
        'Open Graph social tags',
        'Sanity CMS integration',
        'Stripe API endpoints',
        'Accessibility (ARIA, keyboard)',
        'Sen custom typography',
      ],
      soonLabel: 'Coming Soon',
      soonItems: [
        'Live Stripe payments',
        'Order confirmation emails',
        'Customer accounts',
      ],
    },
    cta: {
      headline: 'Ready to see it live?',
      subtitle:
        'The site is built. Click below to walk through the full experience — menu, cart, checkout, everything.',
      button: 'Explore the Menu →',
    },
    commission: {
      badLabel: 'Third Party',
      goodLabel: 'Your Site',
      order: 'Order: $25.00',
      badFee: 'Commission: −$7.50',
      goodFee: 'Commission: $0.00',
      badKeep: 'You Keep: $17.50',
      goodKeep: 'You Keep: $25.00',
      savings: '+$7.50 saved',
    },
    payment: {
      step1Label: 'Customer Pays',
      step1Sub: 'on your website',
      step2Label: 'Your Account',
      step2Sub: 'Stripe direct',
      step3Label: 'Your Bank',
      step3Sub: 'direct deposit',
    },
    search: {
      query: "chinese food near me",
      result1Title: 'China Island Asian Grill — Menu & Online Ordering',
      result1Desc:
        'Fresh Asian cuisine. 114 menu items. Order online for pickup. Mon–Sat 11am–9pm, Sun 12pm–8pm.',
      result2Title: 'Full Menu — China Island Asian Grill',
      result2Desc:
        'Soups, appetizers, fried rice, noodles, house favorites, lunch specials & more. View prices and order online.',
    },
  },

  zh: {
    meta: {
      title: '产品介绍——您的新网站',
    },
    toggle: 'English',
    hero: {
      kicker: '中国岛亚洲烧烤',
      titleLine1: '您的美食值得拥有一个',
      titleAccent: '同样用心的网站。',
      subtitle:
        '完整的线上形象——完整菜单、在线订餐，以及让您的美食看起来与口感同样出色的专业设计。已经构建完成，随时可以上线。',
      stats: {
        items: { value: '114', label: '菜品数量' },
        categories: { value: '13', label: '菜品分类' },
        commission: { value: '$0', label: '佣金' },
      },
    },
    problem: {
      headline: '您现有的网站无法接受订单、不适配手机，而且谷歌几乎找不到它。',
      description:
        '旧网站曾经发挥了它的作用。但如今的顾客期望能在手机上浏览菜单、添加商品到购物车并完成结账——全程无需打电话。如果做不到，他们就会去别处订餐。',
    },
    features: [
      {
        id: 'menu',
        headline: '您的完整菜单。每一道菜。每一个选项。',
        copy: '13个分类下的114道菜品，按顾客的点餐思路进行整理。配料选项、辣度、蛋白质选择——应有尽有。可搜索、可筛选，悬停预览让顾客了解自己所点的菜品。',
        bullets: [
          '13个分类，共114道菜品',
          '20个选项组（蛋白质、辣度、份量）',
          '按名称或分类搜索和筛选',
          '桌面端悬停预览，显示描述和价格',
        ],
      },
      {
        id: 'ordering',
        headline: '直接接受订单。保留每一分钱。',
        copy: '第三方平台从每笔订单中抽取15%至30%的佣金。一笔25美元的订单，最多有7.50美元流失。当顾客通过您的网站下单时，款项直接归您所有——无中间商，零佣金，顾客数据不外泄。',
        bullets: [
          '直接订单零佣金',
          '持久购物车——顾客可以随时浏览并返回',
          '结账时可自定义配料',
          '自动计算税费（8.25%）',
        ],
      },
      {
        id: 'mobile',
        headline: '适配每一位顾客的手机。',
        copy: '大多数顾客都会通过手机找到您。菜单自动适配——水平分类标签、单列布局、滑入式购物车侧边栏。无需缩放，无需费力阅读小字。',
        bullets: [
          '从320px手机到4K桌面全面适配',
          '触控友好的购物车与结账流程',
          '支持滑动手势的移动端菜单抽屉',
          '蜂窝网络下快速加载',
        ],
      },
      {
        id: 'seo',
        headline: '当顾客搜索"附近中餐"时，出现在搜索结果中。',
        copy: '目前，当有人搜索附近的中餐时，可能根本找不到您的餐厅。新网站内置结构化数据，向谷歌清晰传达您的菜品、地址和营业时间。',
        bullets: [
          'JSON-LD结构化数据（餐厅模式）',
          '全页面XML站点地图',
          '规范URL防止重复内容',
          'Open Graph标签支持社交媒体分享',
        ],
      },
      {
        id: 'cms',
        headline: '十秒钟修改价格。无需开发人员。',
        copy: '新增时令特菜？调整价格？下架某道菜？登录后台，修改内容，点击发布。网站的每个页面即时更新——菜单、结账页，全部同步。',
        bullets: [
          'Sanity CMS——编辑菜品、价格和描述',
          '修改即时生效',
          '随时新增或删除菜品及分类',
          'CMS宕机时自动切换本地数据',
        ],
      },
      {
        id: 'payments',
        headline: '收款直接入账您的银行账户。',
        copy: '由业内最受信赖的支付平台Stripe处理交易。顾客在您的网站付款，款项直接存入您的银行账户——无共同资金池，无等待，无混乱。',
        bullets: [
          'Stripe支付——安全且符合PCI标准',
          '直接存入您的银行账户',
          '自动Webhook处理订单确认',
          '完整的交易记录与报告',
        ],
      },
    ],
    checklist: {
      headline: '这不是原型。这是真实运行的代码。',
      subtitle: '所有打勾的功能均已构建完成，今天就能运行。',
      liveItems: [
        '完整交互式菜单（114道菜品）',
        '13个菜品分类',
        '20个选项组',
        '搜索与筛选',
        '持久化购物车',
        '结账表单',
        '税费计算（8.25%）',
        '移动端响应式布局',
        '加载骨架屏',
        '导航进度条',
        'SEO（站点地图、JSON-LD、robots）',
        'Open Graph社交标签',
        'Sanity CMS集成',
        'Stripe API接口',
        '无障碍访问（ARIA、键盘操作）',
        'Sen自定义字体排版',
      ],
      soonLabel: '即将推出',
      soonItems: ['Stripe在线支付', '订单确认邮件', '顾客账户'],
    },
    cta: {
      headline: '准备好亲眼见证了吗？',
      subtitle:
        '网站已构建完成。点击下方，体验完整流程——菜单、购物车、结账，一应俱全。',
      button: '浏览菜单 →',
    },
    commission: {
      badLabel: '第三方平台',
      goodLabel: '您的网站',
      order: '订单金额：$25.00',
      badFee: '佣金：−$7.50',
      goodFee: '佣金：$0.00',
      badKeep: '您保留：$17.50',
      goodKeep: '您保留：$25.00',
      savings: '每单节省 $7.50',
    },
    payment: {
      step1Label: '顾客付款',
      step1Sub: '通过您的网站',
      step2Label: '您的账户',
      step2Sub: 'Stripe直连',
      step3Label: '您的银行',
      step3Sub: '直接存款',
    },
    search: {
      query: '附近的中餐',
      result1Title: '中国岛亚洲烧烤——菜单与在线订餐',
      result1Desc:
        '新鲜亚洲美食，精心烹制。114道菜品。在线订餐，自取更方便。周一至周六11am–9pm，周日12pm–8pm。',
      result2Title: '完整菜单——中国岛亚洲烧烤',
      result2Desc:
        '汤品、前菜、炒饭、面条、招牌菜、午市特惠及更多。查看价格并在线订餐。',
    },
  },
};
