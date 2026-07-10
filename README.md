# CasinoWatch

A newsletter-style site delivering customizable information about online and
land-based casinos — news, bonuses, reviews, and regulatory updates — where
each user picks the topics, regions, and cadence they want.

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for the full roadmap, current
scaffold state, and open decisions (monetization, content sourcing).

## Getting started

```bash
npm install
# set DATABASE_URL in .env to a real Postgres instance, then:
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 (App Router, TypeScript, Tailwind)
- Prisma 7 (Postgres, driver adapter pattern)
