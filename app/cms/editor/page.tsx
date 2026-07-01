'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading,
  Quote,
  List,
  Eye,
  Save,
  Globe,
  Sparkles,
  ImageIcon,
  Star,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { usePosts, savePost } from '@/lib/cms/store';
import { CMS_CATEGORIES, COVER_GRADIENTS, type Author, type Post } from '@/lib/cms/types';
import { readingMinutes, slugify } from '@/lib/cms/utils';

const CURRENT_AUTHOR: Author = {
  name: 'You',
  role: 'Author',
  avatar: 'YO',
  bio: 'Contributor on the platform.',
};

const STARTER = `<p>Start writing your story here. Use the toolbar to add headings, emphasis and quotes.</p>`;

function EditorInner() {
  const params = useSearchParams();
  const editId = params.get('id');
  const posts = usePosts();
  const editing = useMemo(() => posts.find((p) => p.id === editId), [posts, editId]);

  // Remount the form when the target post changes so its state initialises
  // cleanly from props — no setState-in-effect hydration dance.
  return <EditorForm key={editing?.id ?? 'new'} editing={editing} />;
}

function EditorForm({ editing }: { editing?: Post }) {
  const router = useRouter();

  const [title, setTitle] = useState(editing?.title ?? '');
  const [excerpt, setExcerpt] = useState(editing?.excerpt ?? '');
  const [content, setContent] = useState(editing?.content ?? STARTER);
  const [category, setCategory] = useState<string>(editing?.category ?? CMS_CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState(editing?.tags.join(', ') ?? '');
  const [coverGradient, setCoverGradient] = useState<string>(
    editing?.coverGradient ?? COVER_GRADIENTS[0]
  );
  const [featured, setFeatured] = useState(Boolean(editing?.featured));
  const [metaTitle, setMetaTitle] = useState(editing?.seo.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(editing?.seo.metaDescription ?? '');
  const [keywords, setKeywords] = useState(editing?.seo.keywords.join(', ') ?? '');
  const [showPreview, setShowPreview] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const slug = slugify(title) || 'untitled';
  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
  const mins = readingMinutes(content);
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  function wrapSelection(before: string, after: string, placeholder = '') {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function persist(status: 'draft' | 'published') {
    const saved = savePost({
      id: editing?.id,
      title,
      excerpt,
      content,
      category,
      tags,
      coverGradient,
      featured,
      status,
      author: editing?.author ?? CURRENT_AUTHOR,
      seo: {
        metaTitle: metaTitle.trim() || title,
        metaDescription: metaDescription.trim() || excerpt,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      },
    });
    if (status === 'published') {
      router.push(`/news/${saved.slug}`);
    } else {
      router.push('/cms');
    }
  }

  const canSave = title.trim().length > 2 && excerpt.trim().length > 4;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/cms"
          className="flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to studio
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              showPreview
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Eye size={15} />
            {showPreview ? 'Editing' : 'Preview'}
          </button>
          <button
            onClick={() => persist('draft')}
            disabled={!canSave}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={15} />
            Save draft
          </button>
          <button
            onClick={() => persist('published')}
            disabled={!canSave}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Globe size={15} />
            Publish
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main editor / preview */}
        <div className="min-w-0 space-y-4">
          {showPreview ? (
            <article className="rounded-2xl border border-white/5 bg-[#16242f] p-6">
              <div
                className="mb-5 h-40 w-full rounded-xl"
                style={{ background: coverGradient }}
              />
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-400">
                {category}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-white">{title || 'Untitled post'}</h1>
              <p className="mt-2 text-white/60">{excerpt}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                <span>{mins} min read</span>
                <span>·</span>
                <span>{words} words</span>
              </div>
              <div
                className="prose-cms mt-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-[#16242f] p-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/25"
                />
                <p className="mt-1 text-xs text-white/35">
                  /news/<span className="text-emerald-400/80">{slug}</span>
                </p>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short excerpt — shown in listings and search results…"
                  rows={2}
                  className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-[#0d1b24] p-3 text-sm text-white/80 outline-none placeholder:text-white/30 focus:border-emerald-400/40"
                />
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#16242f]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-2">
                  <ToolbarBtn label="Heading" onClick={() => wrapSelection('<h2>', '</h2>', 'Section heading')}>
                    <Heading size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn label="Bold" onClick={() => wrapSelection('<strong>', '</strong>', 'bold text')}>
                    <Bold size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn label="Italic" onClick={() => wrapSelection('<em>', '</em>', 'italic text')}>
                    <Italic size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn label="Quote" onClick={() => wrapSelection('<blockquote>', '</blockquote>', 'A memorable quote')}>
                    <Quote size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn label="List item" onClick={() => wrapSelection('<ul>\n  <li>', '</li>\n</ul>', 'List item')}>
                    <List size={15} />
                  </ToolbarBtn>
                  <span className="ml-auto px-2 text-xs text-white/35">
                    {mins} min · {words} words
                  </span>
                </div>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article. HTML is supported."
                  rows={18}
                  className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-white/85 outline-none placeholder:text-white/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar settings */}
        <aside className="space-y-4">
          <Panel title="Publishing">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/40"
              >
                {CMS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="webrtc, engineering"
                className="w-full rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300 ring-1 ring-emerald-400/20"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Field>
            <button
              onClick={() => setFeatured((v) => !v)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                featured
                  ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                  : 'border-white/10 bg-[#0d1b24] text-white/60 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star size={15} className={featured ? 'fill-amber-400 text-amber-400' : ''} />
                Feature on homepage
              </span>
              <span className="text-xs">{featured ? 'On' : 'Off'}</span>
            </button>
          </Panel>

          <Panel title="Cover">
            <div className="grid grid-cols-3 gap-2">
              {COVER_GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setCoverGradient(g)}
                  style={{ background: g }}
                  className={`h-12 rounded-lg ring-2 transition ${
                    coverGradient === g ? 'ring-emerald-400' : 'ring-transparent hover:ring-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/35">
              <ImageIcon size={12} /> Gradient covers render crisp at any size.
            </p>
          </Panel>

          <Panel title="SEO & Google News" icon={Sparkles}>
            <Field label="Meta title" hint={`${(metaTitle || title).length}/60`}>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'Search engine title'}
                maxLength={70}
                className="w-full rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40"
              />
            </Field>
            <Field label="Meta description" hint={`${(metaDescription || excerpt).length}/160`}>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={excerpt || 'Compelling summary for search results…'}
                rows={3}
                maxLength={180}
                className="w-full resize-none rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40"
              />
            </Field>
            <Field label="Focus keywords (comma separated)">
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="real-time, webrtc, collaboration"
                className="w-full rounded-lg border border-white/10 bg-[#0d1b24] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40"
              />
            </Field>
            {/* SERP preview */}
            <div className="mt-3 rounded-lg border border-white/10 bg-[#0d1b24] p-3">
              <p className="text-[11px] text-white/35">Search preview</p>
              <p className="mt-1 line-clamp-1 text-sm text-[#8ab4f8]">
                {metaTitle || title || 'Post title'}
              </p>
              <p className="text-[11px] text-emerald-400/70">example.com › news › {slug}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-white/50">
                {metaDescription || excerpt || 'Your meta description appears here.'}
              </p>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#16242f] p-4">
      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/45">
        {Icon && <Icon size={13} className="text-emerald-400" />}
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-white/55">
        {label}
        {hint && <span className="text-white/30">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export default function CmsEditorPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="px-6 py-16 text-center text-sm text-white/40">Loading editor…</div>
        }
      >
        <EditorInner />
      </Suspense>
    </PageShell>
  );
}
