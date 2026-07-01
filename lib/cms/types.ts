// Shared CMS domain model. Imported by both server components (for SEO) and
// the client-side store, so this file must stay framework-agnostic (no
// 'use client', no browser APIs).

export type PostStatus = 'draft' | 'published';

export interface Author {
  name: string;
  role: string;
  avatar: string; // initials or image url
  bio?: string;
}

export interface PostSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Rich HTML content (sanitised on render). */
  content: string;
  coverImage?: string;
  coverGradient: string;
  category: string;
  tags: string[];
  author: Author;
  status: PostStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  publishedAt: string | null; // ISO when published
  readingMinutes: number;
  views: number;
  likes: number;
  featured?: boolean;
  seo: PostSeo;
}

export const CMS_CATEGORIES = [
  'News',
  'Strategy',
  'Guides',
  'Sports',
  'Technology',
  'Interviews',
  'Opinion',
] as const;

export type CmsCategory = (typeof CMS_CATEGORIES)[number];

export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0d2b1a 0%, #1a4a2e 45%, #0f3322 100%)',
  'linear-gradient(135deg, #0d2040 0%, #1a3a7a 100%)',
  'linear-gradient(135deg, #1a0a2e 0%, #3d1a6e 100%)',
  'linear-gradient(135deg, #2a1a00 0%, #4a3000 100%)',
  'linear-gradient(135deg, #001a2a 0%, #003a5a 100%)',
  'linear-gradient(135deg, #2a0a14 0%, #5a1a2e 100%)',
] as const;
