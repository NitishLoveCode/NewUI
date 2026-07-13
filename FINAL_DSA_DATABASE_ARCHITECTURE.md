# Final DSA Platform Database Architecture (Supabase + PostgreSQL 16)

This file is your implementation guide for a production-ready, scalable schema using `final_` prefix naming.

## 1) Implementation order
1. Create shared enums and helper functions (`update_updated_at_column()`).
2. Create core identity and authorization tables.
3. Create problem and judge tables.
4. Create progress, contest, discussion, and daily challenge tables.
5. Create badges, playlists, blog, subscription, and payment tables.
6. Create admin, audit, flags, and system settings tables.
7. Apply indexes and constraints.
8. Enable RLS and apply policies table-by-table.
9. Add views/materialized views/RPC.
10. Add seed data and verify with integration tests.

## 2) Naming rules
- Every object starts with `final_`.
- User PKs: UUID (from Supabase Auth).
- Most other PKs: BIGSERIAL.
- Standard timestamps wherever applicable: `created_at`, `updated_at`.

## 3) Security model
- RLS enabled on every table.
- Policy style:
  - user-owned data: owner can CRUD
  - public catalog data: public read, admin write
  - system/judge/payment/admin data: service role or admin only

## 4) Frontend integration (Next.js)
- Keep browser client in `lib/supabase/client.ts` for user-facing reads/writes.
- Use server client in `lib/supabase/server.ts` for SSR-protected routes.
- Use Edge Functions for privileged workflows:
  - code execution submission
  - payment webhook handling
  - contest scoreboard recalculation
  - badge progression jobs
- Use RPC for atomic workflows:
  - submit solution
  - register contest
  - redeem coupon
  - activate subscription

## 5) Data access patterns
- Problem list pages should read from optimized views (not raw joins).
- Submission-heavy queries should use partition-ready schema and covering indexes.
- Leaderboards should prefer materialized views + incremental refresh strategy.

## 6) Storage bucket plan
- `final-avatars` (public read / owner write)
- `final-problem-assets` (public read / admin write)
- `final-editorial-assets` (public read / admin write)
- `final-blog-media` (public read / author/admin write)
- `final-invoices` (private read by owner/admin only)

## 7) Rollout checklist
- [ ] Migration folder structure created
- [ ] Extensions enabled (`pgcrypto`, optional `citext`)
- [ ] Tables and constraints created
- [ ] Indexes created
- [ ] RLS enabled and policies tested
- [ ] Views and RPC created
- [ ] Seed data loaded
- [ ] Performance baseline tests run
- [ ] Backup and PITR verified
- [ ] Frontend integration complete

## 8) Next step protocol
- Generate SQL one table at a time.
- For each table: enum -> create table -> constraints -> indexes -> trigger -> RLS -> policies -> inserts -> column explanation -> best practices.
- Move only when you type: **next table**.
