# CodeRabbit Review Comments - PR #2

Generated: 2026-01-15

---

## ⚡ Haiku-Suitable (4 comments)

### 1. Fix invalid package versions (CRITICAL)
**File:** `apps/web/package.json:18`
**Severity:** 🔴 Critical

**Issue:**
Two package versions don't exist and will cause install failures:
- `next`: 16.1.2 doesn't exist → use `^16.1.0`
- `zustand`: 5.0.10 doesn't exist → use `^5.0.9`

**Action:**
```diff
- "next": "^16.1.2",
+ "next": "^16.1.0",
- "zustand": "^5.0.10",
+ "zustand": "^5.0.9",
```

Then run `bun install` to update lockfile.

---

### 2. Use Node LTS version
**File:** `.nvmrc:1`
**Severity:** 🔵 Trivial

**Issue:**
Node 25.x is Current (non-LTS) with shorter support. Production should use LTS.

**Action:**
Change `.nvmrc` from `25.3.0` to `24` (or specific like `24.18.0`)

---

### 3. Remove /checkout from sitemap
**File:** `apps/web/src/app/sitemap.ts:36`
**Severity:** 🔵 Trivial

**Issue:**
Checkout pages shouldn't be indexed by search engines (they're user-specific flows).

**Action:**
Remove the `/checkout` entry from the sitemap array, or add `noindex` to checkout page metadata.

---

### 4. Extract hardcoded base URL
**File:** `apps/web/src/app/robots.ts:11`
**Severity:** 🔵 Trivial

**Issue:**
Base URL is hardcoded, causes issues in staging/dev environments.

**Action:**
- Add `NEXT_PUBLIC_SITE_URL` to `.env` files
- Use it in both `robots.ts` and `sitemap.ts`:
  ```typescript
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chinaislandgrill.com';
  ```

---

## 🧠 Sonnet-Suitable (1 comment)

### 5. Use fixed date for lastModified
**File:** `apps/web/src/app/sitemap.ts:37`
**Severity:** 🔵 Trivial

**Issue:**
Using `new Date()` causes `lastModified` to change on every build, triggering unnecessary re-crawls.

**Context needed:**
- Should we use build-time date?
- Or fetch from CMS/git for dynamic content?
- Trade-offs between static vs dynamic approach

**Suggested approach:**
```typescript
const lastUpdated = new Date('2026-01-15'); // Or from env/build time
// ... use lastUpdated for all entries
```

---

## 🚀 Opus-Suitable (0 comments)

None - all comments are straightforward fixes.

---

## Summary

| Severity | Count | Model |
|----------|-------|-------|
| 🔴 Critical | 1 | Haiku |
| 🔵 Trivial | 4 | Haiku/Sonnet |
| **Total** | **5** | |

**Recommended order:**
1. Fix package versions (CRITICAL) - Haiku
2. All other Haiku tasks in parallel
3. lastModified approach - Sonnet (requires design decision)
