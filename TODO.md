# TODO (Agent-driven)

## Checkpoints
- [ ] Install deps (npm install)
- [ ] Run discovery: identify the `addtocart(id)` network endpoint(s) (`npm run discover -w @ci/scrape`)
- [ ] Run scrape across all items; persist checkpoints every 10 items
- [ ] Validate extraction quality on 10 random items:
  - item name matches
  - base price correct
  - modifier groups + options + deltas correct
- [ ] Normalize data and ensure stable IDs
- [ ] Sanity import (schemas + image upload)
- [ ] Web app reads from Sanity, fallback to local JSON when env missing
- [ ] Style pass: warm-minimal, typography-forward, dense menu UX
- [ ] Vercel deploy doc completed

## Known inputs
- Menu page URL: http://www.chinaislandasiangrill.com/menu.asp
- Item link format: <a href="javascript:void(0)" onclick="addtocart(6609230)">Spicy Crispy</a>
- Current checkout/cart URL: https://us.chinesemenu.com/order/shoppingcart.htm
- Ordering is open (no login observed)

