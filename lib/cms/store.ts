'use client';

import { useSyncExternalStore } from 'react';
import type { Post, PostStatus } from './types';
import { SEED_POSTS } from './seed';
import { ensureUniqueSlug, readingMinutes, slugify } from './utils';

// A tiny localStorage-backed store with a pub/sub so React components stay in
// sync. Seeded from SEED_POSTS on first load. In production this layer would
// talk to Supabase/an API instead — the component surface stays the same.

const STORAGE_KEY = 'cms.posts.v1';
const listeners = new Set<() => void>();

let cache: Post[] | null = null;

function read(): Post[] {
  if (cache) return cache;
  if (typeof window === 'undefined') return SEED_POSTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as Post[];
    } else {
      cache = SEED_POSTS;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    cache = SEED_POSTS;
  }
  return cache;
}

function write(next: Post[]) {
  cache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Post[] {
  return read();
}

function getServerSnapshot(): Post[] {
  return SEED_POSTS;
}

// ---- mutations -------------------------------------------------------------

export interface PostDraftInput {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverGradient: string;
  coverImage?: string;
  status: PostStatus;
  author: Post['author'];
  featured?: boolean;
  seo: Post['seo'];
}

export function savePost(input: PostDraftInput): Post {
  const posts = read();
  const now = new Date().toISOString();
  const existing = input.id ? posts.find((p) => p.id === input.id) : undefined;

  const baseSlug = slugify(input.title) || 'untitled';
  const slug = existing ? existing.slug : ensureUniqueSlug(baseSlug, posts);

  const publishedAt =
    input.status === 'published'
      ? existing?.publishedAt ?? now
      : null;

  const post: Post = {
    id: existing?.id ?? `post-${Date.now()}`,
    slug,
    title: input.title.trim() || 'Untitled',
    excerpt: input.excerpt.trim(),
    content: input.content,
    coverGradient: input.coverGradient,
    coverImage: input.coverImage,
    category: input.category,
    tags: input.tags,
    author: input.author,
    status: input.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt,
    readingMinutes: readingMinutes(input.content),
    views: existing?.views ?? 0,
    likes: existing?.likes ?? 0,
    featured: input.featured ?? existing?.featured ?? false,
    seo: input.seo,
  };

  const next = existing
    ? posts.map((p) => (p.id === post.id ? post : p))
    : [post, ...posts];
  write(next);
  return post;
}

export function deletePost(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function setPostStatus(id: string, status: PostStatus) {
  const now = new Date().toISOString();
  write(
    read().map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            publishedAt: status === 'published' ? p.publishedAt ?? now : null,
            updatedAt: now,
          }
        : p
    )
  );
}

export function incrementViews(id: string) {
  write(read().map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
}

export function toggleLike(id: string, liked: boolean) {
  write(
    read().map((p) =>
      p.id === id ? { ...p, likes: Math.max(0, p.likes + (liked ? 1 : -1)) } : p
    )
  );
}

export function resetStore() {
  write(SEED_POSTS);
}

// ---- React bindings --------------------------------------------------------

export function usePosts(): Post[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePost(idOrSlug: string): Post | undefined {
  const posts = usePosts();
  return posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

// Module-level functions are already stable references — expose them directly.
export const postActions = {
  savePost,
  deletePost,
  setPostStatus,
  incrementViews,
  toggleLike,
  resetStore,
};

export function usePostActions() {
  return postActions;
}
