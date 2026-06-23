// ---------------------------------------------------------------------------
// collabEditor — helpers for peer-to-peer live coding on top of Monaco.
//
// Responsibilities:
//   - Generate a fun, stable per-session identity (name + color).
//   - Inject the (single) stylesheet that renders the remote caret + name tag.
//   - RemoteCursorManager: draw the partner's caret / selection inside Monaco.
//
// Everything here is framework-agnostic and uses loose `any` typing for the
// Monaco editor + namespace so we don't take a hard dependency on the
// monaco-editor type package.
// ---------------------------------------------------------------------------

export type CollabIdentity = { name: string; color: string };

export type RemoteCursorState = {
    position: { lineNumber: number; column: number } | null;
    selection: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    } | null;
    name: string;
    color: string;
};

const ADJECTIVES = [
    'Swift', 'Clever', 'Brave', 'Nimble', 'Cosmic', 'Turbo', 'Witty',
    'Quantum', 'Lucky', 'Mighty', 'Stealth', 'Neon', 'Vivid', 'Pixel',
];
const NOUNS = [
    'Coder', 'Falcon', 'Tiger', 'Pulsar', 'Otter', 'Comet', 'Maple',
    'Raven', 'Lynx', 'Phoenix', 'Wolf', 'Byte', 'Nova', 'Drake',
];
const COLORS = [
    '#f59e0b', '#22d3ee', '#a78bfa', '#34d399', '#f472b6',
    '#60a5fa', '#fb7185', '#4ade80', '#fbbf24', '#c084fc',
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Build a random, friendly identity for this session. */
export function randomCollabIdentity(): CollabIdentity {
    return {
        name: `${pick(ADJECTIVES)} ${pick(NOUNS)}`,
        color: pick(COLORS),
    };
}

const STYLE_ID = 'collab-editor-styles';

/** Inject the remote-cursor stylesheet exactly once. */
export function ensureCollabStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.collab-remote-selection {
  background: var(--collab-color, #f59e0b);
  opacity: 0.22;
  border-radius: 2px;
}
.collab-remote-caret {
  border-left: 2px solid var(--collab-color, #f59e0b);
  margin-left: -1px;
  position: relative;
  pointer-events: none;
}
.collab-remote-caret::after {
  content: var(--collab-name, "Partner");
  position: absolute;
  top: -1.35em;
  left: -1px;
  font-size: 10px;
  line-height: 1.4;
  padding: 0 5px;
  white-space: nowrap;
  background: var(--collab-color, #f59e0b);
  color: #0b0f1a;
  border-radius: 4px 4px 4px 0;
  font-weight: 700;
  letter-spacing: 0.2px;
  z-index: 50;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  opacity: 0.95;
}
`;
    document.head.appendChild(style);
}

/**
 * Manages the partner's caret + selection decorations inside a single Monaco
 * editor instance. There is only ever one remote partner (1-to-1 matching),
 * which keeps this simple.
 */
export class RemoteCursorManager {
    private editor: any;
    private monaco: any;
    private decorationIds: string[] = [];
    private container: HTMLElement | null = null;

    constructor(editor: any, monaco: any) {
        this.editor = editor;
        this.monaco = monaco;
        try {
            this.container = editor.getContainerDomNode?.() ?? editor.getDomNode?.() ?? null;
        } catch {
            this.container = null;
        }
        ensureCollabStyles();
    }

    /** Draw / move the remote caret + selection. */
    update(state: RemoteCursorState) {
        if (!this.editor || !this.monaco) return;
        if (!state.position) {
            this.clear();
            return;
        }

        // Push identity into CSS custom properties so the pseudo-elements pick
        // up the right name + color without regenerating any stylesheet.
        if (this.container) {
            this.container.style.setProperty('--collab-color', state.color);
            // content: var() requires a quoted CSS string token.
            this.container.style.setProperty('--collab-name', JSON.stringify(state.name));
        }

        const { Range } = this.monaco;
        const decos: any[] = [];

        const sel = state.selection;
        const hasSelection =
            sel &&
            (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn);

        if (hasSelection && sel) {
            decos.push({
                range: new Range(sel.startLineNumber, sel.startColumn, sel.endLineNumber, sel.endColumn),
                options: { className: 'collab-remote-selection' },
            });
        }

        const { lineNumber, column } = state.position;
        decos.push({
            range: new Range(lineNumber, column, lineNumber, column),
            options: { className: 'collab-remote-caret', stickiness: 1 },
        });

        this.decorationIds = this.editor.deltaDecorations(this.decorationIds, decos);
    }

    clear() {
        if (!this.editor) return;
        try {
            this.decorationIds = this.editor.deltaDecorations(this.decorationIds, []);
        } catch {
            this.decorationIds = [];
        }
    }

    dispose() {
        this.clear();
        this.editor = null;
        this.monaco = null;
        this.container = null;
    }
}
