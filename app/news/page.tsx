'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  Eye,
  Heart,
  Flame,
  ArrowUpRight,
  PenSquare,
  Search,
  Sparkles,
  BookOpen,
  Mail,
  Check,
  Newspaper,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { usePosts } from '@/lib/cms/store';
import { CMS_CATEGORIES, type Post } from '@/lib/cms/types';
import { timeAgo } from '@/lib/cms/utils';

export default function NewsListingPage() {
  const posts = usePosts();
  const [activeCat, setActiveCat] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const published = useMemo(
    () =>
      posts
        .filter((p) => p.status === 'published')
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
        ),
    [posts]
  );

  const featured = useMemo(
    () => published.find((p) => p.featured) ?? published[0],
    [published]
  );

  // Two "editor's picks" shown beside the hero.
  const picks = useMemo(
    () => published.filter((p) => p.id !== featured?.id).slice(0, 2),
    [published, featured]
  );

  const isFiltering = query.trim().length > 0 || activeCat !== 'All';

  const heroIds = useMemo(
    () => new Set([featured?.id, ...picks.map((p) => p.id)].filter(Boolean) as string[]),
    [featured, picks]
  );

  const feed = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = isFiltering ? published : published.filter((p) => !heroIds.has(p.id));
    return base
      .filter((p) => (activeCat === 'All' ? true : p.category === activeCat))
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
  }, [published, heroIds, activeCat, query, isFiltering]);

  const trending = useMemo(
    () => [...published].sort((a, b) => b.views - a.views).slice(0, 5),
    [published]
  );

  const topics = useMemo(
    () =>
      CMS_CATEGORIES.map((c) => ({
        name: c,
        count: published.filter((p) => p.category === c).length,
      })).filter((t) => t.count > 0),
    [published]
  );

  const totalReads = published.reduce((s, p) => s + p.views, 0);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30">
                <Newspaper size={18} />
              </span>
              Newsroom
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/45">
              <span>{published.length} stories</span>
              <span className="text-white/20">•</span>
              <span>{compact(totalReads)} total reads</span>
              <span className="text-white/20">•</span>
              <span>{topics.length} topics</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories…"
                className="w-44 rounded-xl border border-white/10 bg-[#0d1b24] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:w-56 focus:border-emerald-400/40"
              />
            </div>
            <Link
              href="/cms"
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              <PenSquare size={15} />
              <span className="hidden sm:inline">Studio</span>
            </Link>
          </div>
        </div>

        {/* Hero + editor's picks (only on the unfiltered view) */}
        {!isFiltering && featured && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <Link href={`/news/${featured.slug}`} className="group block">
              <article className="relative h-full overflow-hidden rounded-3xl border border-white/5">
                <div
                  className="absolute inset-0 transition duration-500 group-hover:scale-105"
                  style={{ background: featured.coverGradient }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                <div className="relative flex min-h-[340px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-8">
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
                    <Flame size={13} /> Featured · {featured.category}
                  </span>
                  <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/70 sm:text-base">
                    {featured.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/60">
                    <Avatar author={featured.author} />
                    <span className="font-semibold text-white/80">{featured.author.name}</span>
                    <span>·</span>
                    <span>{timeAgo(featured.publishedAt)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {featured.readingMinutes} min
                    </span>
                  </div>
                </div>
              </article>
            </Link>

            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/45">
                <Sparkles size={13} className="text-emerald-400" /> Editor&apos;s picks
              </p>
              {picks.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="group block flex-1">
                  <article className="flex h-full gap-3 overflow-hidden rounded-2xl border border-white/5 bg-[#16242f] p-3 transition hover:border-emerald-400/30 hover:bg-[#1a2a36]">
                    <div
                      className="h-full w-24 shrink-0 rounded-xl"
                      style={{ background: p.coverGradient, minHeight: 84 }}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                        {p.category}
                      </span>
                      <h3 className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-white group-hover:text-emerald-400">
                        {p.title}
                      </h3>
                      <p className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-white/40">
                        <Clock size={11} /> {p.readingMinutes}m
                        <Eye size={11} className="ml-1" /> {compact(p.views)}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main feed */}
          <div className="min-w-0">
            {/* Category tabs */}
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {['All', ...CMS_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    activeCat === c
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80">
                {query.trim()
                  ? `Results for “${query.trim()}”`
                  : activeCat === 'All'
                  ? 'Latest stories'
                  : activeCat}
              </h2>
              <span className="text-xs text-white/40">{feed.length} articles</span>
            </div>

            {feed.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">No stories match your search.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {feed.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <Link href={`/news/${p.slug}`} className="group block h-full">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#16242f] transition hover:border-emerald-400/30 hover:bg-[#1a2a36]">
                        <div className="relative h-40 overflow-hidden">
                          <div
                            className="absolute inset-0 transition duration-500 group-hover:scale-105"
                            style={{ background: p.coverGradient }}
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                            {p.category}
                          </span>
                          <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-black/40 text-white/0 backdrop-blur transition group-hover:text-white">
                            <ArrowUpRight size={15} />
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="line-clamp-2 font-bold leading-snug text-white group-hover:text-emerald-400">
                            {p.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 flex-1 text-sm text-white/55">
                            {p.excerpt}
                          </p>
                          {p.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {p.tags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3 text-xs text-white/45">
                            <Avatar author={p.author} small />
                            <span className="font-medium text-white/70">{p.author.name}</span>
                            <span className="ml-auto flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {p.readingMinutes}m
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye size={11} /> {compact(p.views)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Trending */}
            <div className="rounded-2xl border border-white/5 bg-[#16242f] p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Flame size={15} className="text-orange-400" /> Trending now
              </h3>
              <div className="mt-3 space-y-3">
                {trending.map((p, i) => (
                  <Link key={p.id} href={`/news/${p.slug}`} className="group flex gap-3">
                    <span className="text-lg font-black text-white/15 transition group-hover:text-emerald-400/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-white/85 group-hover:text-emerald-400">
                        {p.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {compact(p.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={11} /> {compact(p.likes)}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="rounded-2xl border border-white/5 bg-[#16242f] p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
                <BookOpen size={15} className="text-emerald-400" /> Browse topics
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setActiveCat(t.name);
                      setQuery('');
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeCat === t.name
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-white/65 hover:bg-white/10'
                    }`}
                  >
                    {t.name}
                    <span className="text-[10px] opacity-60">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-green-600/5 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Mail size={15} className="text-emerald-400" /> Weekly digest
              </h3>
              <p className="mt-1 text-xs text-white/55">
                The best stories, straight to your inbox. No spam.
              </p>
              {subscribed ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2.5 text-sm font-semibold text-emerald-300">
                  <Check size={15} /> You&apos;re subscribed!
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                  className="mt-3 space-y-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 py-2 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function Avatar({ author, small }: { author: Pick<Post['author'], 'avatar'>; small?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 font-bold text-white ${
        small ? 'size-5 text-[9px]' : 'size-7 text-[11px]'
      }`}
    >
      {author.avatar.slice(0, 2)}
    </span>
  );
}

function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

