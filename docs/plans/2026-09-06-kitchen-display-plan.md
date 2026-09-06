# Kitchen Display Plan: online orders → iPad in the kitchen

Pitch companion for China Island Asian Grill. Goal: a customer orders on
the website, the ticket pops up on a kitchen iPad seconds later, staff get
pinged. One holistic system, not three vendors bolted together.

All file references verified 2026-09-06. No code written yet — this is the
build plan.

**Review history:** v1 reviewed by Sol Pro batch (adversarial +
implementation, 2026-09-06, $0.11, batch Nd9PNW9ieHEGdjdjcESR) with
verdict *blocked / not executable as written*. Every finding below is
incorporated; §12 maps findings to dispositions. Ledger:
`/Users/tp/Tools/review-ledger.csv`, results in
`reviews/2026-09-06-china-kitchen-plan-openai-gpt-5-6-sol-pro-batch/`.

## Where we stand (verified, not assumed)

**China repo (`/Users/tp/Projects/China Island Grill`).** Checkout is
unwired scaffolding: `/order` links out to chinesemenu.com, both checkout
pages simulate success with a fake `CI-<timestamp>` number
(`apps/web/src/app/checkout/page.tsx:30-42`), the Stripe PaymentIntent
endpoint exists but has zero callers
(`apps/web/src/app/api/payment/intent/route.ts`), and the Stripe webhook
only `console.log`s with explicit TODOs where order persistence should be
(`apps/web/src/app/api/webhooks/stripe/route.ts:42-44`). No database, no
order records, no kitchen surface, no email/SMS. The cart shape is
well-defined (`src/lib/types.ts:62-108`) and reusable as a client-side
*proposal* only — the server re-derives everything (see §4).

**Catch repo (`/Users/tp/Projects/Catch`).** Has the production-grade
kitchen system this plan reuses: kiosk PWA kitchen boards
(`app/kitchen/`, V2 Station + Expo dashboards primary), offline action
queue with conflict-safe sync, audible new-order chime (iOS gesture
unlock solved), QR pairing for shared iPads, device kill-switch, ops
console (`app/kitchen/ops/`), Supabase Realtime, and staff/customer
notifications (Twilio SMS + Resend). Its order intake is Sanity-webhook
driven (`app/api/kitchen/intake/route.ts`) with atomic upsert RPCs; its
Revel POS link is a static menu snapshot, not a live API. Kitchen UI
imports nothing brand-specific — it ports cleanly.

## Proposed shape

```
checkout submit (server action)
  → validate cart → server prices from menu data (integer cents)
  → create order row `pending_payment` + checkout idempotency key (unique)
  → create ONE PaymentIntent for exactly the stored total, metadata.order_id
  → client confirms with Stripe
  → webhook payment_intent.succeeded
      → verify signature, livemode, currency, amount == stored total,
        intent == stored intent, event ID not yet processed
      → atomic transition pending→confirmed + notification outbox rows
      → async worker sends SMS/email (deduped, retried)
  → KDS (realtime + resync, §5) shows ticket + chimes
```

Design rules (load-bearing, do not relax):

1. **Never take money without a record.** The pending row is created
   server-side BEFORE the payment is confirmed. If the database is down,
   checkout errors instead of charging into the void.
2. **Kitchen shows paid orders only.** The display subscribes to
   `confirmed`, never `pending_payment`. No free tickets from abandoned
   checkouts.
3. **The server is the sole pricing authority** (§4). Browser names,
   prices, and totals are ignored for charging.
4. **Order payloads snapshot the menu.** Item names, prices, and modifiers
   are frozen into the order row at purchase time. Later menu edits never
   rewrite history, and the KDS never needs menu integration to render a
   ticket.
5. **No POS integration required.** Online orders bypass the counter POS
   entirely (same as Catch today). Kitchen tickets + end-of-day
   reconciliation print cover the gap. POS sync is a Phase-2 option if
   their POS turns out to have an API — ask, don't block on it.
6. **Paid-but-unconfirmed is a recoverable state, never a lost order**
   (§6). The webhook is the normal path; reconciliation is the backstop.
7. **Realtime is a hint; the database is the truth** (§5). Every
   (re)connect starts from an authoritative query.

## Tenancy decision (recommended: separate everything)

Port the Catch kitchen subsystem INTO the China repo rather than sharing
Catch's deployment: client separation (the owner never sees another
restaurant's system), independent deploys, and the China site already
owns its Sanity project and menu data. Extracting a shared package comes
later, after the second install proves what is actually shared.

- **Supabase:** new project owned by the restaurant's account (they own
  their order data). Tier selected on availability, not volume: this DB
  is on the critical path for charging AND fulfillment, so launch on a
  tier with backups, recovery objectives, and log retention — currently
  Pro ($25/mo). Define quota alerts and a degraded-mode procedure
  (take-orders-paused banner + phone-orders fallback) before launch.
- **Schema:** a reviewed, SQUASHED baseline migration for the China
  tenant (explicit tables, constraints, seeds, grants, RLS, Realtime
  publication) — not a cherry-picked subset of Catch migrations, whose
  dependencies can't be eyeballed. Applied to a disposable project in CI
  with schema checksums; expand/contract for any overlapping deploys.
- **Code to port:** `app/kitchen/*` (V2 boards, pair, ops console),
  `components/kitchen/*`, `lib/kitchen/*`, `lib/supabase/*`,
  PWA shell (`manifest`, service worker build, iOS meta), notification
  routes + Twilio/Resend libs. Leave behind: Sanity-order round trip
  (China intake writes Supabase directly), V1 Kanban, Revel leftovers.
- **Menu stays where it is.** China Sanity project already serves the
  site; KDS renders from order snapshots.

## Order / payment state machine

Statuses: `pending_payment` → `confirmed` → `preparing` → `ready` →
`completed`, plus `cancelled` (any time before `completed`) and
`failed` (terminal, from PaymentIntent failure/cancel/expiry).

- One active PaymentIntent per order (DB uniqueness on
  `stripe_payment_intent_id`); one checkout idempotency key per checkout
  (unique; tab reloads and double submits reuse, never duplicate).
- `metadata.order_id` is immutable once set; the webhook rejects an
  intent/order mismatch, wrong account/livemode, or amount ≠ stored total.
- Processed Stripe event IDs are recorded; duplicates and out-of-order
  deliveries are no-ops. Webhook acknowledges ONLY after the state
  transition commits.
- Pending orders expire (swept to `failed` after N hours; N=2 default).
- **Refunds/cancellations are first-class:** `charge.refunded`,
  partial refunds, and disputes are consumed idempotently; a
  post-confirmation cancel emits a cancellation event that chimes on
  every assigned station and stays in history (staff may already be
  cooking — the ticket must visibly die, not silently vanish).

## Server pricing contract

One server-side pricing transaction per checkout. Input: canonical
menu/modifier IDs + quantities. The server resolves them against
Sanity/local menu data, rejects unknown/stale/unavailable selections and
illegal modifier combos, and computes in integer cents: lines, modifiers,
discounts, fees, 8.25% TX tax, tip, total. Output stored immutably on the
order row AND used verbatim as the PaymentIntent amount. The webhook
re-verifies amount + currency against the stored snapshot.

## Roles, RLS, and secrets

| Actor | Can |
|---|---|
| Anonymous checkout | Submit a priced checkout proposal; read NOTHING back except its own order via an unguessable scoped token (never bare order numbers) |
| Paired kitchen iPad | Subscribe to `confirmed`+ tickets at its location; advance ticket status; nothing else |
| Ops user | Pair/revoke devices, view health; no order mutation |
| Server routes only | Create orders/intents, run transitions, send notifications (service role never leaves the server) |

RLS on every table + Realtime publication, tested per role. Pairing codes
are one-time, expiring, location-scoped; revocation (kill-switch) takes
effect immediately. A leaked anon key yields nothing beyond what the
public site already shows.

## Ticket delivery (beyond realtime)

- On startup, focus/resume, and every reconnect, the board queries ALL
  actionable confirmed orders and reconciles against local state
  (dedupe by order ID). A durable observed-set cursor + periodic polling
  backstop cover subscription gaps. UAT must prove: pay while the iPad
  is offline → ticket appears and chimes on reconnect.
- Notifications are outbox rows written atomically with confirmation,
  processed asynchronously with unique `(order_id, type, recipient)`
  keys, retries, and dead-letter visibility. No provider calls inside
  the webhook request path.
- **Who texts what:** system → staff SMS on confirm ("New order #1234 ·
  3 items · pickup · $28.50", owner + kitchen lead numbers); system →
  customer email receipt via Resend. Stripe's own receipts stay OFF to
  avoid doubles. Customer "ready" SMS is a Phase-2 opt-in, not launch.

## Reconciliation (the backstop for rule 6)

A scheduled job compares stale `pending_payment` orders against Stripe:
auto-confirm verified-successful payments (same validation as the
webhook), alert loudly on anything unresolvable, and support safe manual
replay. A paid order can be late to the kitchen; it can never be lost.

## Phases + estimates

| Phase | Work | Est. |
|---|---|---|
| 0 — Foundation (FIRST — checkout can't be built without it) | Squashed baseline migration; RLS + publication per §7; upsert/transition RPCs; pricing contract tests; disposable-project CI check | 2–3 days |
| 1 — Real money + order records | Wire orphaned PaymentForm/StripeProvider; server pricing; pending-row-before-charge; idempotent webhook + outbox; scoped-token success screen | 3–4 days |
| 2 — Kitchen tenant | Port + rebrand KDS; location seed (stations, routing); resync protocol; QR pairing; kill-switch; ops console | 4–6 days |
| 3 — iPad kiosk | PWA install, Guided Access lockdown, kitchen wifi survey. **Screen-only at launch** — LAN thermal printing deferred (browser→LAN print architecture unproven; revisit with a concrete integration, not a hardware pick) | 1–2 days |
| 4 — Notifications + reconciliation | Twilio staff SMS; Resend receipt; outbox worker + retries; recon job + alerts | 2 days |
| 5 — Harden + UAT | Offline/backpressure drills, failed/refunded/cancelled paths, expiry sweep, end-of-day reconciliation print, four-mode deploy test (no config / healthy / unreachable / malformed), owner + staff training | 2–3 days |
| 0 (elapsed) — Accounts & decisions | Stripe owner + test keys; Supabase project; Twilio number; POS identity (info); SMS numbers; §12 decisions | 1 day elapsed (mostly waiting) |

**Demo-able for the pitch in ~1 week** (Stripe test mode → live ticket on
an iPad, no real money). **Live in 4–5 weeks** including Stripe approval,
hardware shipping, reconciliation proof, and owner UAT. Add 1–2 weeks if
their POS has an API worth syncing.

## Money (monthly, launch)

| Item | Cost |
|---|---|
| Supabase Pro (availability, not volume — §tenancy) | $25 |
| Twilio (number $1.15 + ~$0.008/SMS; ~2 texts/order) | ~$3–8 at pitch volume, ~$17 at 1k orders |
| Resend (receipts) | $0 free tier |
| Vercel hosting | existing ($0 incremental) |
| iPad 10.9" + rugged case (one-time) | ~$400 |
| Stripe | 2.9% + 30¢ per transaction (owner's account) |

No Cloudflare R2/D1: D1 has no realtime (would hand-roll push on Durable
Objects to replace what Supabase ships), and menu images already live on
Sanity's CDN — the KDS renders text tickets. Revisit only if Sanity
assets are outgrown.

## Risks + mitigations

- **Counter POS is a parallel universe.** Online tickets won't appear in
  it. Mitigation: printed kitchen tickets + nightly totals print for the
  register; revisit only if their POS exposes an API.
- **Paid-but-invisible orders.** Covered by design rule 6 + §8
  reconciliation; UAT case: kill the webhook endpoint, pay in test mode,
  prove the order still surfaces.
- **Kitchen wifi dead zones.** Resync protocol (§5) + survey in Phase 3.
- **Who owns the money.** Stripe account, tax reporting, refunds are the
  owner's entity from day one.
- **Abandoned carts.** Never reach the kitchen (rule 2); explicit UAT
  case retained.
- **Scope creep into POS sync / multi-location.** Deferred; location_id
  plumbing and snapshot payloads keep those doors open unpaid-for.

## Decisions needed (owner or us, before Phase 0)

1. Stripe account: owner's new or existing? (owner — blocks live money)
2. Separate Supabase project (recommended) vs shared with Catch (us —
   default separate unless told otherwise)
3. Which POS runs the counter? (owner — info only, Phase-2 option)
4. Screen-only kitchen at launch? (us — recommended yes; printer deferred)
5. Staff phone numbers for SMS alerts (owner — Phase 4)
6. Stripe receipts OFF + Resend branded receipt: agreed? (us — default yes)
7. Pending-order expiry window (us — default 2h)
8. Who trains counter/kitchen staff? (us to propose, owner to staff)

## Finding disposition (Sol Pro batch Nd9PNW9ieHEGdjdjcESR)

P1 webhook-visibility → §6 reconciliation + idempotent protocol (§3).
P1 realtime-durability → §5 resync + polling + UAT case. P1 RLS → §7
matrix. P1 pricing authority → §4 contract. P1 phase ordering → Phase 0
foundation. P2 notification dedup → outbox (§5). P2 migration subset →
squashed baseline (§tenancy). P2 refunds → state machine (§3). P2 tier →
Pro on availability (§tenancy). Printer scope → deferred screen-only
(Phase 3). Skipped with reason: none — all findings incorporated above.
