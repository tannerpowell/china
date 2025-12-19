# Sanity Setup

If you create the Sanity project manually:
1) Create project + dataset (production)
2) Create API token with write access
3) Copy `.env.example` -> `.env` and fill SANITY_* vars

Import:
```bash
npm run import -w @ci/sanity
```
