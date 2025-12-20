# Data Model

Normalized output: `data/normalized/menu.normalized.json`

- restaurant
- categories[]
- modifierGroups[]
- items[] (sourceItemId, modifierGroupIds, images, and provider link-out)

Stable IDs:
- category: cat_<slug>
- modifierGroup: mod_<slugified-title>
- item: item_<sourceItemId>
