# Madaalinsan Stable CMS Patch

This release focuses on making the platform operate as a real CMS instead of a visual prototype.

## Fixed in this patch

- Removed fake hard-coded hero statistics. Home statistics now come from the database and fall back to zero when empty.
- Kept public article/category pages database-driven only. Empty sections show honest empty states.
- Improved article slug handling using a dedicated slug helper that supports Arabic and generates stable URLs.
- Article links use `/articles/{slug}` consistently.
- Article pages decode URL slugs before querying the database.
- Article cover images use `coverImage`, then `thumbnail`, then a safe fallback.
- Admin dashboard queries are wrapped in safe fallbacks so one failed count does not crash the whole dashboard.
- Admin article editor supports creating, publishing, scheduling, archiving, cover upload, thumbnails, SEO fields and canonical URLs.
- Telegram duplicate dispatch is handled through `TelegramPublishLog`, not by requiring extra columns on `Post`.
- `.env` is intentionally excluded. Use `.env.example` for names only and Vercel Environment Variables for secrets.

## Required deployment steps

```bash
cp mada-env-admin-updated.env .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run cleanup:demo
npm run build
```

Then push to GitHub and redeploy in Vercel.

## Vercel DATABASE_URL

Use Transaction Pooler for runtime:

```env
DATABASE_URL=postgresql://postgres.wsqygwnyhnuhskeohjbk:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Use Session Pooler or Direct URL for `DIRECT_URL` depending on what works in your network.
