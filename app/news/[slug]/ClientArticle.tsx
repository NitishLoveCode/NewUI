'use client';

import Link from 'next/link';
import ArticleView from './ArticleView';
import { usePost } from '@/lib/cms/store';

// Resolves posts that only exist in the client store (authored in the CMS and
// not part of the static seed). Server-rendered SEO is limited for these — the
// note in the studio explains that production posts persist to the database.
export default function ClientArticle({ slug }: { slug: string }) {
  const post = usePost(slug);

  if (!post || post.status !== 'published') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Story not found</h1>
        <p className="mt-2 text-sm text-white/50">
          This post may be a draft or may have been removed.
        </p>
        <Link
          href="/news"
          className="mt-6 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          Back to Newsroom
        </Link>
      </div>
    );
  }

  return <ArticleView initialPost={post} />;
}
