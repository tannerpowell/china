'use client';

import { useState } from "react";
import { T } from "@/components/T";
import styles from "./page.module.css";

type Status = "live" | "todo" | "owner";
type Filter = "all" | Status;

// Bilingual text: renders EN + ZH spans and lets the global language
// toggle (documentElement.dataset.lang) pick the visible one — same
// mechanism as <T>, so no subscription needed.
interface L {
  en: string;
  zh: string;
}

function B({ text }: { text: L }) {
  return (
    <>
      <span className="t-en">{text.en}</span>
      <span className="t-zh">{text.zh}</span>
    </>
  );
}

interface Item {
  text: L;
  note?: L;
  status: Status;
}

interface Group {
  heading: L;
  intro: L;
  items: Item[];
}

const groups: Group[] = [
  {
    heading: { en: "Completed", zh: "已完成" },
    intro: { en: "Shipped and verified on chinaislandgrill.vercel.app.", zh: "已在 chinaislandgrill.vercel.app 上线并验证。" },
    items: [
      { text: { en: "Full menu in HTML with real descriptions (56 of 118 items)", zh: "完整菜单 HTML（含真实描述，118 道菜中有 56 道）" }, note: { en: "The rest have no copy on the source site — nothing left to grab.", zh: "其余菜品在原网站上就没有介绍——没有可抓取的内容。" }, status: "live" },
      { text: { en: "Menu renders server-side with styles at first paint", zh: "菜单服务端渲染，首次绘制即带样式" }, note: { en: "No unstyled flash; verified 390–1440px.", zh: "无无样式闪烁；已验证 390–1440px 宽度。" }, status: "live" },
      { text: { en: "Home category cards deep-link into menu sections", zh: "首页分类卡片直达菜单对应分区" }, note: { en: "/menu#soups etc., with scroll offset for the sticky header.", zh: "/menu#soups 等，含吸顶栏的滚动偏移。" }, status: "live" },
      { text: { en: "Location Info page: phone, address, hours above the fold", zh: "到店信息页：电话、地址、营业时间首屏可见" }, note: { en: "Apple + Google Maps buttons, embedded map, pickup/delivery times.", zh: "苹果 + 谷歌地图按钮、嵌入式地图、自取/外卖时间。" }, status: "live" },
      { text: { en: "Restaurant JSON-LD: address, hours, cuisines, price range", zh: "餐厅结构化数据：地址、营业时间、菜系、价格区间" }, status: "live" },
      { text: { en: "Menu + MenuItem schema block for AI/dish search", zh: "菜单结构化数据块，便于 AI/菜品搜索" }, note: { en: "All 118 items; prices where set, descriptions where available, vegetarian flags.", zh: "全部 118 道菜；有价格的标价格，有描述的加描述，含素食标记。" }, status: "live" },
      { text: { en: "BreadcrumbList schema on menu, order, location", zh: "菜单、订餐、到店页面的面包屑结构化数据" }, note: { en: "Home excluded — a single-item trail isn't a valid breadcrumb.", zh: "首页除外——单层面包屑不符合规范。" }, status: "live" },
      { text: { en: "Custom 404 page", zh: "定制 404 页面" }, note: { en: "On-brand, links to home, menu, order, location.", zh: "品牌风格，链接到首页、菜单、订餐、到店页。" }, status: "live" },
      { text: { en: "FAQ content + FAQPage schema on /location", zh: "/location 的常见问题内容 + 结构化数据" }, status: "live" },
      { text: { en: "Favicon / touch icon / social share image wired", zh: "网站图标/触控图标/分享图已接好" }, note: { en: "Currently the logo — swap in food photography when available.", zh: "目前用的是 logo——有美食照片后替换。" }, status: "live" },
      { text: { en: "robots.txt, sitemap.xml, per-page canonical URLs", zh: "robots.txt、sitemap.xml、每页规范链接" }, status: "live" },
      { text: { en: "Analytics placeholder (renders only when an ID is set)", zh: "统计代码占位（仅在填入 ID 后生效）" }, status: "live" },
      { text: { en: "Owner CMS at /studio (menu, prices, descriptions, tags)", zh: "店主后台 /studio（菜单、价格、描述、标签）" }, note: { en: "Needs the two Sanity dashboard steps below before login works. Re-imports overwrite owner edits on managed fields — backup + approval first (see docs).", zh: "登录前需完成下方两个 Sanity 后台步骤。重新导入会覆盖托管字段上的店主修改——先备份并确认（见 docs）。" }, status: "live" },
      { text: { en: "Atomic Sanity/local fallback (never a mixed menu)", zh: "Sanity/本地整体切换（绝不出现混合菜单）" }, note: { en: "Empty or inconsistent datasets fall back to the bundled menu.", zh: "数据为空或不一致时回退到内置菜单。" }, status: "live" },
      { text: { en: "Preview builds opt-in via [preview] in the subject", zh: "预览构建需在标题注明 [preview] 才会触发" }, status: "live" },
    ],
  },
  {
    heading: { en: "Site work remaining", zh: "网站待办事项" },
    intro: { en: "Ours to do before or just after go-live.", zh: "上线前或上线后马上要做的事。" },
    items: [
      { text: { en: "Order button in Google search results (OrderAction markup)", zh: "谷歌搜索结果中的订餐按钮（OrderAction 标记）" }, note: { en: "Behind-the-scenes code that lets Google show e.g. “Order pickup” next to our listing, straight into /order.", zh: "幕后代码，让谷歌在我们店铺旁显示如“Order pickup”按钮，直达 /order。" }, status: "todo" },
      { text: { en: "Star rating in Google search results, once a review source is chosen", zh: "谷歌搜索结果中的星级评分（需先确定评价来源）" }, note: { en: "Needs a review source: Google Business Profile reviews, or ratings entered by hand. Lets Google show e.g. ★ 4.8 next to our listing.", zh: "需要评价来源：谷歌商家评价，或手工录入。可让谷歌在我们店铺旁显示如 ★ 4.8。" }, status: "todo" },
      { text: { en: "Same name, address, and phone number in a footer on every page", zh: "每页页脚放相同的店名、地址和电话" }, note: { en: "Search engines call this trio “NAP”. They trust us more when it matches everywhere — design call, home/menu currently have no footer.", zh: "搜索引擎称这三项为“NAP”。各处一致会更受信任——设计待定，首页/菜单目前没有页脚。" }, status: "todo" },
      { text: { en: "Homepage main heading names the cuisine + city", zh: "首页主标题点明菜系 + 城市" }, note: { en: "Currently brand only. The heading (called an “H1”) should read something like “Chinese Restaurant in Flower Mound” — that's the phrase people search.", zh: "目前只有品牌名。主标题（叫“H1”）应类似“Chinese Restaurant in Flower Mound”——这才是大家搜索的词。" }, status: "todo" },
      { text: { en: "Food photography + plain-English description on each photo", zh: "美食照片 + 每张照片的英文描述" }, note: { en: "Signature dishes, dining room, storefront. The attached description (called “alt text”) is what Google reads — e.g. “Kung Pao Chicken over steamed rice”.", zh: "招牌菜、店内、门面。附带的描述（叫“alt text”）是谷歌读取的内容——如“Kung Pao Chicken over steamed rice”。" }, status: "todo" },
      { text: { en: "Catering page (menu already has catering options)", zh: "宴会承办页（菜单里已有承办选项）" }, note: { en: "Placeholder route until the owner confirms details.", zh: "店主确认细节之前先占位。" }, status: "todo" },
      { text: { en: "Safe Stripe version check in test mode", zh: "测试模式下安全的 Stripe 版本检查" }, note: { en: "Confirms Stripe accepts our connection settings with a no-charge test request. Required before real payments.", zh: "用一笔不扣费的测试请求确认 Stripe 接受我们的连接设置。收款前必需。" }, status: "todo" },
    ],
  },
  {
    heading: { en: "Owner / external setup", zh: "店主/站外事项" },
    intro: { en: "Needs the owner's accounts, logins, or decisions. Can't be done from the repo.", zh: "需要店主的账号、登录或拍板。代码库里做不了。" },
    items: [
      { text: { en: "Claim + verify Google Business Profile", zh: "认领并验证谷歌商家资料" }, note: { en: "Name, address, phone (the “NAP” trio), hours, categories, photos, menu link → /menu, order link → /order.", zh: "店名、地址、电话（“NAP”三项）、营业时间、分类、照片，菜单链接 → /menu，订餐链接 → /order。" }, status: "owner" },
      { text: { en: "Google Business Profile upkeep habit: photos, posts, review replies", zh: "谷歌商家日常维护：照片、动态、评价回复" }, note: { en: "Posts weekly; reply to every review within 72h.", zh: "每周发动态；每条评价 72 小时内回复。" }, status: "owner" },
      { text: { en: "Apple Maps + Bing Places + Yelp + TripAdvisor listings", zh: "苹果地图 + 必应地点 + Yelp + TripAdvisor 收录" }, note: { en: "Name, address, and phone identical everywhere — mismatches hurt search ranking.", zh: "店名、地址、电话各处完全一致——不一致会拉低搜索排名。" }, status: "owner" },
      { text: { en: "Content system access: invite owner as Editor + approve our website", zh: "内容系统权限：邀请店主为编辑 + 批准我们的网站" }, note: { en: "Sanity (where menu edits happen) only talks to approved sites — ours must be on its list. See docs/sanity-setup.md. Blocks /studio login.", zh: "Sanity（改菜单的地方）只和批准过的网站通信——我们的站必须在名单里。见 docs/sanity-setup.md，否则登不上 /studio。" }, status: "owner" },
      { text: { en: "Google Analytics account + ID added to the hosting settings", zh: "谷歌统计账号 + ID 填入托管设置" }, status: "owner" },
      { text: { en: "Google Search Console: prove ownership + hand Google our page list", zh: "谷歌站长工具：验证归属 + 提交页面清单" }, note: { en: "Verification proves the site is ours; submitting the sitemap (the full page list) gets every page found faster.", zh: "验证证明网站是我们的；提交 sitemap（完整页面清单）让收录更快。" }, status: "owner" },
      { text: { en: "Holiday-hours process (who updates Google + site)", zh: "节假日时间流程（谁更新谷歌 + 网站）" }, status: "owner" },
    ],
  },
];

const filters: { id: Filter; labelId: string }[] = [
  { id: "todo", labelId: "launch.f.todo" },
  { id: "owner", labelId: "launch.f.owner" },
  { id: "live", labelId: "launch.f.completed" },
  { id: "all", labelId: "launch.f.all" },
];

const statusLabelId: Record<Status, string> = {
  live: "launch.f.completed",
  todo: "launch.f.todo",
  owner: "launch.f.owner",
};

export default function LaunchList() {
  const [filter, setFilter] = useState<Filter>("todo");

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => filter === "all" || item.status === filter),
    }))
    .filter((g) => g.items.length > 0);

  const counts = (id: Filter) =>
    id === "all"
      ? groups.reduce((n, g) => n + g.items.length, 0)
      : groups.reduce((n, g) => n + g.items.filter((i) => i.status === id).length, 0);

  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter checklist">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
          >
            <T id={f.labelId} /> · {counts(f.id)}
          </button>
        ))}
      </div>

      {visibleGroups.map((g) => (
        <section key={g.heading.en} className={styles.group}>
          <h2 className={styles.groupTitle}><B text={g.heading} /></h2>
          <p className={styles.groupIntro}><B text={g.intro} /></p>
          <ul className={styles.list}>
            {g.items.map((item) => (
              <li key={item.text.en} className={styles.item}>
                <span className={`${styles.pill} ${styles[item.status]}`}>
                  <T id={statusLabelId[item.status]} />
                </span>
                <div>
                  <p className={styles.itemText}><B text={item.text} /></p>
                  {item.note && <p className={styles.itemNote}><B text={item.note} /></p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
