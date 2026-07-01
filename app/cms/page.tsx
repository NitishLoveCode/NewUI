'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Eye,
  Heart,
  PenSquare,
  Plus,
  Search,
  Trash2,
  Globe,
  EyeOff,
  TrendingUp,
  Clock,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { usePosts, usePostActions } from '@/lib/cms/store';
import { CMS_CATEGORIES, type PostStatus } from '@/lib/cms/types';
import { formatDate } from '@/lib/cms/utils';

type StatusFilter = 'all' | PostStatus;

export default function CmsDashboardPage() {
  const posts = usePosts();
  const { deletePost, setPostStatus } = usePostActions();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published');
    return {
      total: posts.length,
      published: published.length,
      drafts: posts.length - published.length,
      views: posts.reduce((s, p) => s + p.views, 0),
      likes: posts.reduce((s, p) => s + p.likes, 0),
    };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => (categoryFilter === 'all' ? true : p.category === categoryFilter))
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [posts, query, statusFilter, categoryFilter]);

  const statCards = [
    { label: 'Total posts', value: stats.total, icon: FileText, color: '#00e676' },
    { label: 'Published', value: stats.published, icon: Globe, color: '#1475e1' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: '#ffb020' },
    { label: 'Total views', value: stats.views.toLocaleString(), icon: Eye, color: '#9b59b6' },
    { label: 'Total likes', value: stats.likes.toLocaleString(), icon: Heart, color: '#ff5c8a' },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30">
                <PenSquare size={18} />
              </span>
              Content Studio
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Create, manage and publish posts optimised for search & Google News.
            </p>
          </div>
          <Link
            href="/cms/editor"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110"
          >
            <Plus size={16} />
            New post
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/5 bg-[#16242f] p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className="grid size-9 place-items-center rounded-lg"
                  style={{ background: `${s.color}1f`, color: s.color }}
                >
                  <s.icon size={16} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/45">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, tags…"
              className="w-full rounded-xl border border-white/10 bg-[#0d1b24] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl border border-white/10 bg-[#0d1b24] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0d1b24] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            <option value="all">All categories</option>
            {CMS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-[#16242f]">
          <div className="hidden grid-cols-[1fr_120px_110px_90px_140px] gap-3 border-b border-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-white/40 md:grid">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-right">Views</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-white/40">
              <TrendingUp size={28} className="mx-auto mb-3 text-white/20" />
              No posts match your filters.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-1 gap-2 border-b border-white/5 px-4 py-3 transition last:border-0 hover:bg-white/[0.03] md:grid-cols-[1fr_120px_110px_90px_140px] md:items-center md:gap-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/cms/editor?id=${p.id}`}
                    className="line-clamp-1 font-semibold text-white hover:text-emerald-400"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/40">
                    {p.tags.slice(0, 3).map((t) => `#${t}`).join(' ')} · {formatDate(p.updatedAt)}
                  </p>
                </div>
                <span className="text-xs text-white/60">{p.category}</span>
                <span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                      p.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-400/30'
                        : 'bg-amber-500/15 text-amber-400 ring-amber-400/30'
                    }`}
                  >
                    {p.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </span>
                <span className="text-right text-xs tabular-nums text-white/60">
                  {p.views.toLocaleString()}
                </span>
                <div className="flex items-center justify-start gap-1.5 md:justify-end">
                  {p.status === 'published' ? (
                    <>
                      <Link
                        href={`/news/${p.slug}`}
                        title="View live"
                        className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => setPostStatus(p.id, 'draft')}
                        title="Unpublish"
                        className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-amber-400"
                      >
                        <EyeOff size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setPostStatus(p.id, 'published')}
                      title="Publish"
                      className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 transition hover:bg-emerald-500/25"
                    >
                      <Globe size={15} />
                    </button>
                  )}
                  <Link
                    href={`/cms/editor?id=${p.id}`}
                    title="Edit"
                    className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-emerald-400"
                  >
                    <PenSquare size={15} />
                  </Link>
                  <button
                    onClick={() => setConfirmId(p.id)}
                    title="Delete"
                    className="grid size-8 place-items-center rounded-lg bg-white/5 text-white/70 transition hover:bg-rose-500/15 hover:text-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#16242f] p-5"
            >
              <h3 className="text-lg font-bold text-white">Delete this post?</h3>
              <p className="mt-1 text-sm text-white/50">
                This permanently removes the post. This action cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deletePost(confirmId);
                    setConfirmId(null);
                  }}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
