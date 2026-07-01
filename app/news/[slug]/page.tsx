import type { Metadata } from 'next';
import Script from 'next/script';
import PageShell from '@/components/layout/PageShell';
import ArticleView from './ArticleView';
import ClientArticle from './ClientArticle';
import { getPublishedSeedPosts, getSeedPostBySlug } from '@/lib/cms/seed';

// Update to your production origin (or read from an env var) so canonical,
// OpenGraph and JSON-LD URLs are absolute — a Google News requirement.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
const SITE_NAME = 'Newsroom';

type RouteParams = { slug: string };

// Pre-render every published seed article at build time for instant, crawlable
// pages. Unknown slugs (CMS-authored, client-only) fall through to the client
// resolver thanks to dynamic params.
export function generateStaticParams(): RouteParams[] {
  return getPublishedSeedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getSeedPostBySlug(slug);

  if (!post) {
    return {
      title: `Article · ${SITE_NAME}`,
      robots: { index: false },
    };
  }

  const url = `${SITE_URL}/news/${post.slug}`;
  const title = post.seo.metaTitle || post.title;
  const description = post.seo.metaDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    category: post.category,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getSeedPostBySlug(slug);

  // Client-only (CMS-authored) post — resolve from the browser store.
  if (!post) {
    return (
      <PageShell>
        <ClientArticle slug={slug} />
      </PageShell>
    );
  }

  const url = `${SITE_URL}/news/${post.slug}`;
  const plainText = post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // NewsArticle structured data — the schema Google News uses to understand and
  // surface stories. Keep dates in ISO 8601 and URLs absolute.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.seo.metaDescription || post.excerpt,
    articleSection: post.category,
    keywords: post.seo.keywords.join(', '),
    wordCount: plainText.split(' ').length,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };

  return (
    <PageShell>
      <Script
        id={`ld-${post.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleView initialPost={post} />
    </PageShell>
  );
}
