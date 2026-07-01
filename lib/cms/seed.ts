import type { Author, Post } from './types';
import { COVER_GRADIENTS } from './types';

// Static seed dataset. This doubles as the build-time "database" for the
// server-rendered, SEO-optimised public article pages and as the initial
// working set for the client CMS store.

const ALEX: Author = {
  name: 'Alex Rivera',
  role: 'Senior Editor',
  avatar: 'AR',
  bio: 'Alex covers product, strategy and the people building the next generation of online play.',
};

const MAYA: Author = {
  name: 'Maya Chen',
  role: 'Tech Correspondent',
  avatar: 'MC',
  bio: 'Maya writes about engineering, security and the technology powering modern platforms.',
};

const JORDAN: Author = {
  name: 'Jordan Blake',
  role: 'Sports Analyst',
  avatar: 'JB',
  bio: 'Jordan breaks down form, odds and the stories behind the biggest fixtures.',
};

function para(html: string) {
  return html;
}

export const SEED_POSTS: Post[] = [
  {
    id: 'seed-1',
    slug: 'building-realtime-collaboration-webrtc',
    title: 'How We Built Real-Time Collaboration With WebRTC and Zero Servers',
    excerpt:
      'A behind-the-scenes look at the peer-to-peer architecture that lets two people pair-program, talk and share code with sub-100ms latency.',
    coverGradient: COVER_GRADIENTS[1],
    category: 'Technology',
    tags: ['WebRTC', 'Engineering', 'Real-time', 'Collaboration'],
    author: MAYA,
    status: 'published',
    createdAt: '2026-06-20T09:00:00.000Z',
    updatedAt: '2026-06-22T09:00:00.000Z',
    publishedAt: '2026-06-22T09:00:00.000Z',
    readingMinutes: 7,
    views: 18420,
    likes: 942,
    featured: true,
    seo: {
      metaTitle: 'How We Built Real-Time Collaboration With WebRTC | Engineering',
      metaDescription:
        'A deep dive into the peer-to-peer WebRTC architecture behind sub-100ms pair programming — data channels, ICE, and graceful fallbacks.',
      keywords: ['WebRTC', 'real-time collaboration', 'peer to peer', 'pair programming', 'data channel'],
    },
    content: para(`
<p>When two engineers sit down to solve a problem together, milliseconds matter. A laggy cursor or a delayed keystroke breaks the flow that makes pairing valuable. So when we set out to build live collaboration, we made a deliberate bet: <strong>route everything peer-to-peer over WebRTC</strong> and keep our servers out of the hot path.</p>
<h2>Why peer-to-peer</h2>
<p>A traditional setup relays every edit through a backend. That adds a round trip, a scaling cost, and a single point of failure. WebRTC data channels let two browsers talk directly once they have exchanged connection details, which means edits travel the shortest possible path between collaborators.</p>
<h2>The signalling handshake</h2>
<p>Browsers still need a way to find each other. We use a lightweight socket server purely for <em>signalling</em> — exchanging SDP offers, answers and ICE candidates. Once the connection is established, the socket steps aside and the data channel carries code edits, cursor positions and chat.</p>
<blockquote>The server's only job is the introduction. After that, the two peers are on their own — and that is exactly what keeps latency low.</blockquote>
<h2>Handling the messy real world</h2>
<p>Strict NATs, dropped candidates and tab refreshes all conspire against a clean connection. We buffer ICE candidates that arrive before the remote description is set, retry gracefully, and fall back to relay servers for the small percentage of networks that block direct connections.</p>
<h2>What we learned</h2>
<p>Peer-to-peer is not free — it pushes complexity to the client and demands careful state management. But for an experience where latency is the product, the trade was worth every line of code.</p>
`),
  },
  {
    id: 'seed-2',
    slug: 'mastering-dynamic-programming-2026',
    title: 'Mastering Dynamic Programming: A Practical Framework for 2026',
    excerpt:
      'Stop memorising solutions. This framework breaks every DP problem into five repeatable steps you can apply under interview pressure.',
    coverGradient: COVER_GRADIENTS[0],
    category: 'Guides',
    tags: ['DSA', 'Dynamic Programming', 'Interviews', 'Algorithms'],
    author: ALEX,
    status: 'published',
    createdAt: '2026-06-18T08:00:00.000Z',
    updatedAt: '2026-06-19T08:00:00.000Z',
    publishedAt: '2026-06-19T08:00:00.000Z',
    readingMinutes: 9,
    views: 24310,
    likes: 1377,
    featured: false,
    seo: {
      metaTitle: 'Mastering Dynamic Programming: A Practical Framework (2026)',
      metaDescription:
        'A five-step framework for solving any dynamic programming problem — state, transition, base case, order and optimisation — with worked examples.',
      keywords: ['dynamic programming', 'DSA', 'coding interview', 'algorithms', 'memoization'],
    },
    content: para(`
<p>Dynamic programming intimidates people because it is taught as a bag of tricks. It is not. Every DP problem yields to the same five questions, and once you internalise them, the "aha" moment becomes a checklist.</p>
<h2>1. Define the state</h2>
<p>What is the smallest set of variables that fully describes a sub-problem? Get this wrong and nothing else matters. Get it right and the rest is mechanical.</p>
<h2>2. Write the transition</h2>
<p>How does the answer for a state depend on smaller states? This is the recurrence relation — the heart of the solution.</p>
<h2>3. Nail the base case</h2>
<p>Where does the recursion bottom out? Off-by-one errors live here.</p>
<h2>4. Decide the order</h2>
<p>Top-down with memoisation, or bottom-up with a table? Both are valid; pick the one that reads clearly.</p>
<h2>5. Optimise space</h2>
<p>Once it works, ask whether you really need the full table or just the last row. This is where O(n²) space becomes O(n).</p>
<p>Practise the framework, not the puzzles. The puzzles change; the framework does not.</p>
`),
  },
  {
    id: 'seed-3',
    slug: 'champions-league-final-tactical-preview',
    title: 'Champions League Final: The Tactical Battle That Will Decide It',
    excerpt:
      'Two contrasting philosophies meet on the biggest stage. We break down the press, the build-up and the one matchup that tips the balance.',
    coverGradient: COVER_GRADIENTS[3],
    category: 'Sports',
    tags: ['Football', 'Champions League', 'Tactics', 'Preview'],
    author: JORDAN,
    status: 'published',
    createdAt: '2026-06-15T12:00:00.000Z',
    updatedAt: '2026-06-16T12:00:00.000Z',
    publishedAt: '2026-06-16T12:00:00.000Z',
    readingMinutes: 6,
    views: 31980,
    likes: 2104,
    featured: false,
    seo: {
      metaTitle: 'Champions League Final: Tactical Preview & Key Matchup',
      metaDescription:
        'A tactical preview of the Champions League final — pressing structures, build-up patterns and the individual duel that decides the trophy.',
      keywords: ['Champions League final', 'football tactics', 'match preview', 'soccer analysis'],
    },
    content: para(`
<p>Finals are rarely won by the better team. They are won by the team that imposes its preferred game and forces the other to react. Tonight, two opposing visions of football collide.</p>
<h2>Press versus patience</h2>
<p>One side wants chaos — a high, aggressive press designed to win the ball in dangerous areas. The other wants control, drawing the press in and playing through it with quick combinations.</p>
<h2>The build-up phase</h2>
<p>Watch the goalkeeper. If they are comfortable with the ball at their feet, the press becomes a liability. If they hesitate, the press becomes a weapon.</p>
<h2>The matchup that matters</h2>
<p>It comes down to one duel on the left flank. Whoever wins it controls the width, and whoever controls the width controls the final.</p>
`),
  },
  {
    id: 'seed-4',
    slug: 'designing-dark-interfaces-that-convert',
    title: 'Designing Dark Interfaces That Actually Convert',
    excerpt:
      'Dark mode is more than a colour swap. Here is how contrast, accent colour and motion turn a moody UI into a high-performing one.',
    coverGradient: COVER_GRADIENTS[4],
    category: 'Opinion',
    tags: ['Design', 'UI', 'Dark Mode', 'Conversion'],
    author: ALEX,
    status: 'draft',
    createdAt: '2026-06-25T10:00:00.000Z',
    updatedAt: '2026-06-26T10:00:00.000Z',
    publishedAt: null,
    readingMinutes: 5,
    views: 0,
    likes: 0,
    featured: false,
    seo: {
      metaTitle: 'Designing Dark Interfaces That Convert',
      metaDescription:
        'Practical principles for dark UI design — contrast ratios, accent strategy and purposeful motion that lift conversion.',
      keywords: ['dark mode design', 'UI design', 'conversion', 'accessibility'],
    },
    content: para(`
<p>Dark interfaces feel premium, but they are easy to get wrong. Pure black backgrounds crush depth, low-contrast text fails accessibility, and neon accents fatigue the eye.</p>
<h2>Use near-black, not black</h2>
<p>A slightly elevated base lets you layer surfaces with subtle shadows. True black leaves you nowhere to go.</p>
<h2>One accent, used sparingly</h2>
<p>Reserve your brightest colour for the single action you want people to take. When everything glows, nothing does.</p>
<h2>Motion with intent</h2>
<p>A 200ms ease on the right element guides attention. Animate everything and you create noise.</p>
`),
  },
];

export function getSeedPostBySlug(slug: string): Post | undefined {
  return SEED_POSTS.find((p) => p.slug === slug);
}

export function getPublishedSeedPosts(): Post[] {
  return SEED_POSTS.filter((p) => p.status === 'published').sort(
    (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
  );
}
