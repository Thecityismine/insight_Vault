# Insight Terminal — Build Roadmap

Each phase builds on the last. Complete them in order.
Check off tasks as they're done.

---

## Phase 1 — Auth & Security
> Everything runs as "anonymous" right now. This locks it down to your account and protects Firestore.

- [ ] Add Firebase Auth (Google OAuth + email/password)
- [ ] Create `AuthProvider` context and `useUser` hook
- [ ] Build login page (`/login`) with Google sign-in button
- [ ] Protect all routes — redirect to `/login` if not authenticated
- [ ] Wire real `userId` from auth into every Firestore write
- [ ] Write Firestore security rules (users can only read/write their own data)
- [ ] Deploy security rules via Firebase CLI
- [ ] Show user avatar + sign-out button in TopBar

---

## Phase 2 — Live Data
> The dashboard, library, and action board all show static/empty state. This makes the app actually work end-to-end.

- [ ] Dashboard fetches real stats from Firestore (`getDashboardStats`)
- [ ] Dashboard "Recent Insights" section pulls live data
- [ ] Library page loads and renders all insights as `InsightCard` grid
- [ ] Library search filters by title/summary in real time
- [ ] Library platform filter actually queries Firestore
- [ ] Action Board loads all pending action items across every insight
- [ ] Action Board toggle (complete/incomplete) saves to Firestore
- [ ] Categories page groups insights by their `categories` field
- [ ] TopBar search bar works across all pages

---

## Phase 3 — Insight Management
> Users need to manage what they've saved — edit, delete, re-run.

- [ ] Delete insight (with confirmation prompt)
- [ ] Edit insight title inline on detail page
- [ ] Edit/add tags and categories on detail page
- [ ] Star / mark insight as "high value"
- [ ] Re-process button — run AI again on the same saved transcript
- [ ] Copy transcript to clipboard button on detail page
- [ ] Show processing warnings on detail page if any fallback was used

---

## Phase 4 — Platform & Transcript Quality
> Improve how transcripts are fetched and add metadata so insights look rich.

- [ ] Fetch YouTube video metadata (title, thumbnail, duration) via oEmbed API
- [ ] Display thumbnail on insight card and detail page
- [ ] Improve YouTube caption extraction (handle auto-captions, age-restricted, etc.)
- [ ] Add `youtube-transcript` npm package as a more reliable caption source
- [ ] TikTok transcript — audio download + Whisper fallback
- [ ] Podcast/RSS — extract audio URL from feed and run Whisper
- [ ] Preserve timestamps in transcript display (toggle on/off)
- [ ] Strip filler words / clean up auto-captions before sending to AI

---

## Phase 5 — UX Polish
> Make the app feel finished and professional.

- [ ] Loading skeletons on Library, Dashboard, Action Board
- [ ] Error boundary components (graceful crash pages)
- [ ] Mobile responsive layout (collapsible sidebar, touch-friendly)
- [ ] Settings page saves preferences to Firestore (auto-categorize toggle, etc.)
- [ ] Toast notifications for: insight saved, deleted, action item toggled
- [ ] Keyboard shortcut `Cmd/Ctrl + K` opens link input from anywhere
- [ ] Favicon and Open Graph meta tags
- [ ] Page titles update per route

---

## Phase 6 — Export & Sharing
> Get your insights out of the app and into your workflow.

- [ ] Export insight to Markdown file (download)
- [ ] Export insight to PDF (formatted)
- [ ] Push insight to Notion (Notion API integration)
- [ ] Copy insight as formatted text (for emails, docs, etc.)
- [ ] Public share link for a single insight (read-only)
- [ ] Export full library as JSON backup

---

## Phase 7 — Intelligence Layer
> Make the app smarter over time — connections between insights, patterns, memory.

- [ ] "Related Insights" section on detail page (vector similarity or tag overlap)
- [ ] Semantic search — "what have I learned about X?" powered by embeddings
- [ ] Weekly digest email — top insights and pending actions from the week
- [ ] Action item due dates and reminders
- [ ] Insight score trends — track which topics you engage with most
- [ ] "Knowledge gaps" — topics mentioned but not yet in your library

---

## Phase 8 — Growth & Capture
> Make it easier to feed the app content from anywhere.

- [ ] Browser extension — right-click any video/article → send to Insight Terminal
- [ ] iOS share sheet shortcut (via Shortcuts app → Webhook)
- [ ] Email-to-insight — forward a link or text to a capture email address
- [ ] Zapier / Make webhook for automation
- [ ] Multiple workspaces / vaults

---

## Current Stack Reference

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (server-side) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (to be set up — Phase 1) |
| Storage | Firebase Storage |
| AI | OpenAI GPT-4o-mini (insights) + Whisper (audio) |
| Deployment | Vercel (auto-deploys on git push to master) |
| Repo | github.com/Thecityismine/insight_Vault |

---

## Done

- [x] Next.js project scaffolded with premium dark fintech UI
- [x] Firebase project connected (Firestore, Auth, Storage config)
- [x] Vercel deployment live and auto-deploying on push
- [x] All environment variables set in Vercel (Firebase + OpenAI)
- [x] Add Link page — URL mode with transcript fallback chain
- [x] Add Link page — Paste Transcript mode (large textarea, word count)
- [x] Transcript fallback chain: YouTube captions → 3rd party → Whisper → manual
- [x] OpenAI GPT-4o-mini insight extraction (summary, key points, action items, framework)
- [x] Firestore CRUD helpers (create, read, update, delete insights)
- [x] Dashboard skeleton (Command Center layout)
- [x] Library page (empty state)
- [x] Action Board page (empty state)
- [x] Categories page (empty state)
- [x] Settings page (UI)
- [x] Insight detail page with split-panel view
- [x] TypeScript types for all data models
- [x] UI component library (Button, Card, Badge)
- [x] Sidebar, TopBar layout components
