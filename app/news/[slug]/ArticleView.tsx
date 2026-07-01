'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Check,
  Link as LinkIcon,
  Calendar,
} from 'lucide-react';
import { usePost, usePosts, incrementViews, toggleLike } from '@/lib/cms/store';
import type { Post } from '@/lib/cms/types';
import { formatDate } from '@/lib/cms/utils';

const LIKED_KEY = 'cms.liked.v1';
const SAVED_KEY = 'cms.saved.v1';

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  }
}

export default function ArticleView({ initialPost }: { initialPost: Post }) {
  const live = usePost(initialPost.slug);
  const post = live ?? initialPost;
  const allPosts = usePosts();

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Count a view once per mount, then sync browser-only state (localStorage +
  // location). Done in an effect to avoid SSR hydration mismatches.
  useEffect(() => {
    incrementViews(initialPost.id);
    /* eslint-disable react-hooks/set-state-in-effect */
    setLiked(readSet(LIKED_KEY).has(initialPost.id));
    setSaved(readSet(SAVED_KEY).has(initialPost.id));
    setShareUrl(window.location.href);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initialPost.id]);

  const related = useMemo(
    () =>
      allPosts
        .filter(
          (p) =>
            p.status === 'published' &&
            p.id !== post.id &&
            (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
        )
        .slice(0, 3),
    [allPosts, post]
  );

  function onLike() {
    const next = !liked;
    setLiked(next);
    toggleLike(post.id, next);
    const set = readSet(LIKED_KEY);
    if (next) set.add(post.id);
    else set.delete(post.id);
    writeSet(LIKED_KEY, set);
  }

  function onSave() {
    const next = !saved;
    setSaved(next);
    const set = readSet(SAVED_KEY);
    if (next) set.add(post.id);
    else set.delete(post.id);
    writeSet(SAVED_KEY, set);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <article className="relative">
      {/* Reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 top-14 z-40 h-0.5 w-full origin-left bg-gradient-to-r from-emerald-400 to-green-500"
      />

      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72" style={{ background: post.coverGradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f212e] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 sm:left-6">
          <Link
            href="/news"
            className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
          >
            <ArrowLeft size={14} /> Newsroom
          </Link>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-white/5 bg-[#16242f] p-6 sm:p-9">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40" aria-label="Breadcrumb">
            <Link href="/news" className="hover:text-white/70">
              News
            </Link>
            <span>/</span>
            <span className="text-emerald-400">{post.category}</span>
          </nav>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-white/60">{post.excerpt}</p>

          {/* Byline */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-white/5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-white">
                {post.author.avatar.slice(0, 2)}
              </span>
              <div>
                <p className="text-sm font-bold text-white">{post.author.name}</p>
                <p className="text-xs text-white/45">{post.author.role}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs text-white/45">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {post.readingMinutes} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye size={13} /> {post.views.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Body */}
          <div
            className="prose-cms mt-7"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/5 pt-6">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                liked
                  ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Heart size={16} className={liked ? 'fill-rose-400' : ''} />
              {post.likes.toLocaleString()}
            </button>
            <button
              onClick={onSave}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                saved
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Bookmark size={16} className={saved ? 'fill-emerald-400' : ''} />
              {saved ? 'Saved' : 'Save'}
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X"
                className="grid size-9 place-items-center rounded-full bg-white/5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                𝕏
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on LinkedIn"
                className="grid size-9 place-items-center rounded-full bg-white/5 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                in
              </a>
              <button
                onClick={onCopy}
                title="Copy link"
                className="grid size-9 place-items-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <LinkIcon size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Author bio */}
        {post.author.bio && (
          <div className="mt-5 flex gap-4 rounded-2xl border border-white/5 bg-[#16242f] p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-base font-bold text-white">
              {post.author.avatar.slice(0, 2)}
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                {post.author.name}{' '}
                <span className="font-normal text-white/40">· {post.author.role}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{post.author.bio}</p>
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Share2 size={16} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Keep reading</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="group block">
                  <article className="h-full overflow-hidden rounded-2xl border border-white/5 bg-[#16242f] transition hover:border-emerald-400/30">
                    <div className="h-24" style={{ background: p.coverGradient }} />
                    <div className="p-3">
                      <span className="text-[10px] font-bold uppercase text-emerald-400">
                        {p.category}
                      </span>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white group-hover:text-emerald-400">
                        {p.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
