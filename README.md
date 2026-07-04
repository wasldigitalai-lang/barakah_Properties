# Barakah AI — Deployment Guide (first-timer friendly)

This folder is your complete, saleable product:

```
barakah-ai/
├── index.html      → the website (frontend, safe to be public)
├── api/chat.js     → the secure backend (holds your AI key on the server)
├── package.json
└── .gitignore
```

Visitors chat on the website → the website calls YOUR server → your server
calls the AI with your secret key → the reply comes back. Nobody ever sees
your key. This is the same architecture every real AI product uses.

Total time to go live: about 30 minutes. Total cost to start: ₹0
(Vercel free plan + Anthropic trial credit). A custom domain is optional.

---

## Step 1 — Get your AI key (5 min)

1. Go to https://console.anthropic.com and sign up.
2. Left menu → **API Keys** → **Create Key**. Name it `barakah-production`.
3. Copy the key (starts with `sk-ant-...`) into a private note.
   You will paste it into Vercel in Step 3 — never into the code.

## Step 2 — Put the code on GitHub (10 min)

1. Sign up at https://github.com → **New repository** → name it `barakah-ai`,
   keep it **Private** → Create.
2. Click **uploading an existing file** and drag in: `index.html`,
   `package.json`, `.gitignore`, and the `api` folder (with `chat.js` inside).
   ⚠️ Make sure `chat.js` ends up inside a folder named `api` — the path
   must be `api/chat.js` or the backend won't work.
3. Commit.

## Step 3 — Deploy on Vercel (10 min)

1. Go to https://vercel.com → sign up **with your GitHub account**.
2. **Add New → Project** → Import your `barakah-ai` repository.
3. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key from Step 1
4. Click **Deploy**. In ~1 minute you get a live URL like
   `https://barakah-ai.vercel.app`.
5. Open it and chat — Barakah is now live on the internet for anyone.

## Step 4 — Custom domain (optional, ~₹1,000–2,500/year)

1. Buy `barakahproperties.com` (or `barakahproperties.com` — much cheaper) on GoDaddy,
   Hostinger or Namecheap.
2. Vercel → your project → **Settings → Domains** → add the domain and
   follow the DNS instructions shown (usually adding one A record and one
   CNAME record at your domain provider).
3. Done — https://barakahproperties.com is live with free SSL.

## Updating the site later

Edit the file on GitHub (or re-upload) → Vercel redeploys automatically
within a minute. To change what Barakah knows (inventory, prices, rules),
edit the `SYSTEM_PROMPT` inside `api/chat.js`.

---

## Costs to expect

- **Vercel:** free plan is enough until you have serious traffic.
- **AI usage:** you pay Anthropic per message. A typical chat reply costs a
  fraction of a rupee; even 1,000 full conversations/month usually stays
  in the low hundreds of rupees. Set a **spend limit** in the Anthropic
  console (Settings → Limits) so there are never surprises.

## Built-in protections

- Key stored only in the server environment variable — never in code.
- Backend accepts only the last 20 messages, max 2,000 characters each.
- Frontend caps each visitor session at 30 turns.
- Replies capped at 800 tokens to control cost.

**Recommended upgrades before heavy marketing:** per-IP rate limiting
(Vercel Firewall or Upstash Redis), a lead-capture endpoint that saves
qualified enquiries to a database (Supabase free tier is ideal), and
analytics (Vercel Analytics, one click).

## Troubleshooting

- **"Barakah could not respond"** right after deploy → the env variable is
  missing or misspelled. It must be exactly `ANTHROPIC_API_KEY`. After
  adding it, redeploy (Deployments → ⋯ → Redeploy).
- **Backend 404** → `chat.js` is not inside the `api/` folder in the repo.
- **Works, then stops after some days** → Anthropic trial credit finished;
  add a payment method or credits in the console.

---

# Database Setup (Supabase — free)

This stores every callback request permanently. 15 minutes, one time.

## Step A — Create the database

1. Go to https://supabase.com → sign up (GitHub login works) → **New project**.
   Name: `barakah` · choose region **Mumbai (ap-south-1)** · set a strong DB password.
2. When the project opens, go to **SQL Editor** → New query → paste and Run:

```sql
create table leads (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text,
  phone text,
  requirement text,
  source text
);
alter table leads enable row level security;
```

(No public policies are added on purpose — only your server key can write/read.)

## Step B — Get your keys

Project → **Settings → API**:
- Copy **Project URL** (like `https://abcdxyz.supabase.co`)
- Copy the **service_role** key (under "Project API keys" — the SECRET one, not anon)

## Step C — Connect to Vercel

Vercel → your project → **Settings → Environment Variables** → add BOTH:
- `SUPABASE_URL` = your Project URL
- `SUPABASE_SERVICE_KEY` = the service_role key

Then **Deployments → ⋯ → Redeploy**. Done — the "Request a callback"
form now saves every lead.

## Viewing your leads

Supabase → **Table Editor → leads**. Newest on top: name, phone,
requirement, source, time. Export to CSV anytime with one click.
Check it every morning — this table is your business.

---

# Publishing for ALL users — final checklist

- [ ] Anthropic credits purchased + monthly spend limit set (console → Settings → Limits)
- [ ] Deployed on Vercel, env vars set: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
- [ ] Supabase `leads` table created (above)
- [ ] Test on your phone: chat works, callback form saves a row in Supabase
- [ ] Domain attached (barakahproperties.com recommended) — site is now public for everyone
- [ ] WhatsApp Business profile set up on 9100109908 (greeting message + away message)
- [ ] Share the link in 3 WhatsApp groups and watch the leads table

Your public URL works for unlimited visitors worldwide the moment Vercel
deploys — "publishing for all" is automatic; the checklist above is what
makes it safe and profitable.

---

# Connecting barakahproperties.com (your GoDaddy domain)

Your domain currently shows GoDaddy Website Builder's "Launching Soon" page.
We will point it at your Vercel deployment instead. ~15 minutes + DNS wait.

## Option A (recommended): Barakah AI becomes your main website

1. Deploy this folder to Vercel first (see Step 2–3 at the top of this README).
   Confirm the temporary URL (like barakah-ai.vercel.app) works.
2. Vercel → your project → **Settings → Domains** → Add:
   `barakahproperties.com` and `www.barakahproperties.com`.
   Vercel will show you the exact DNS records it wants (typically an
   A record `76.76.21.21` and a CNAME `cname.vercel-dns.com`).
3. GoDaddy → My Products → your domain → **DNS / Manage DNS**:
   - Edit the existing **A record** with name `@` → change value to `76.76.21.21`
   - Edit/add **CNAME** with name `www` → value `cname.vercel-dns.com`
   - Delete/ignore other A records GoDaddy Website Builder added for `@`.
4. Wait 10–60 minutes (sometimes up to a few hours) for DNS to spread.
   Vercel's Domains page will show a green check when live, with free SSL.
5. Optional: cancel the GoDaddy "Website Builder" subscription (keep the
   DOMAIN itself — you're only dropping their site builder). Keep GoDaddy
   as your registrar and DNS; nothing else changes.

## Option B: keep the current site, run the AI on a subdomain

If you later build a separate main website and want the AI beside it:
1. Vercel → Domains → add `ai.barakahproperties.com`.
2. GoDaddy DNS → add **CNAME**: name `ai` → value `cname.vercel-dns.com`.
3. The AI lives at https://ai.barakahproperties.com, main site untouched.

## Option C: floating chat bubble on any page

`embed-widget.html` in this folder contains a copy-paste snippet that adds
a floating "Ask Barakah" button opening the AI in an overlay. Works on
GoDaddy Builder (HTML/Embed section), WordPress, or any custom site.
Set WIDGET_URL inside the snippet to wherever the AI is deployed.

## Email tip

Since you own the domain, set up info@barakahproperties.com
(GoDaddy sells email, or use Zoho Mail's free plan with your domain) —
the site's footer and privacy page already reference this address.

---

# LIVE INVENTORY — your real properties, updated in real time

The AI no longer depends on demo data. It reads YOUR property list from
your Supabase database on every chat (refreshes within 60 seconds).
Add a property → customers hear about it immediately. Mark it inactive →
it disappears from the AI instantly. No coding — it works like a
spreadsheet.

## One-time setup (5 minutes)

Supabase → your project → **SQL Editor** → New query → paste → Run:

```sql
create table properties (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  title text not null,
  area text,
  price text,
  size text,
  status text,
  details text,
  active boolean default true
);
alter table properties enable row level security;

-- two example rows (edit or delete them later):
insert into properties (title, area, price, size, status, details) values
('2BHK flat', 'Kondapur', '₹85L', '1150 sft', 'Ready to move', 'Near Botanical Garden Rd, gated society, 2 balconies'),
('Open plot', 'Shadnagar', '₹35L', '200 sq yd', 'Available', 'HMDA-approved layout, clear title, near NH-44');
```

That's it. The AI switches from "sample inventory" to
"LIVE INVENTORY — current, real listings" automatically.

## Daily use — adding / editing properties (like a spreadsheet)

Supabase → **Table Editor → properties**:
- **Add a property:** click "Insert row" → fill title, area, price, size,
  status, details → Save. Live within a minute.
- **Sold or on hold:** set `active` to false → AI stops mentioning it.
- **Price change:** edit the price cell → Save. Done.

Tip for phone use: Supabase works in the mobile browser too — you can
update inventory from a site visit.

# OPTIONAL: Live web search (current market news)

Want Barakah to also search the internet live for current market trends,
infrastructure news, and government updates when customers ask?

Vercel → Settings → Environment Variables → add:
`ENABLE_WEB_SEARCH` = `true` → Redeploy.

Cost note: web searches cost extra (about $10 per 1,000 searches, plus
normal tokens, capped at 2 searches per reply). Start WITHOUT it; switch
it on once you have real traffic and want the extra freshness.
