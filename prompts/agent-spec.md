# Eco Directory — Automated Research Agent Spec

## Overview

An automated agent that discovers new eco-friendly businesses across North America and verifies/updates existing listings in the Eco Directory. Runs daily on a rolling geographic schedule, processing one state or province per day.

---

## Goals

1. **Scout** — Find new eco-friendly businesses not yet in the database
2. **Audit** — Re-verify existing businesses (still open? new socials? website changed?)
3. **Collect** — Gather full structured data + logo for each business
4. **Flag** — Insert new businesses as `needs-review`; flag changes to existing businesses for admin review (never auto-update)

---

## Rolling Schedule

The agent cycles through all US states and Canadian provinces/territories, one per day:

```
Day 1:   AB (Alberta)
Day 2:   BC (British Columbia)
Day 3:   MB (Manitoba)
Day 4:   NB (New Brunswick)
Day 5:   NL (Newfoundland and Labrador)
Day 6:   NS (Nova Scotia)
Day 7:   NT (Northwest Territories)
Day 8:   NU (Nunavut)
Day 9:   ON (Ontario)
Day 10:  PE (Prince Edward Island)
Day 11:  QC (Quebec)
Day 12:  SK (Saskatchewan)
Day 13:  YT (Yukon)
Day 14:  AL (Alabama)
Day 15:  AK (Alaska)
...
Day 63:  WI (Wisconsin)
Day 64:  WY (Wyoming)
Day 65:  → Back to AB (cycle restarts)
```

- One pass per state/province regardless of size
- Larger states (CA, NY, TX, ON, BC) will naturally find more per pass but catch additional businesses on the next cycle (~65 day rotation)
- The agent tracks which state is "next" so it picks up where it left off

---

## Search Method: Web Search API + LLM Combo

### Step 1: Web Search (programmatic)

Use a search API (Google Custom Search or Bing Web Search) to run structured queries:

```
"zero waste store {state}"
"refillery {city} {state}"
"eco-friendly shop {state}"
"bulk food store {state}"
"sustainable living store {state}"
"package free shop {state}"
"thrift store {city} {state}"        (for major cities)
"refill station {state}"
```

Collect the top results (URLs, titles, snippets) from each query.

### Step 2: LLM Analysis (cheap model)

Feed the search results to the LLM to:
- Determine if each result is a legitimate eco-friendly business
- Extract structured data (name, address, phone, website, categories, socials)
- Write a 70-120 word description following the rules in `prompts/bulk-business-csv.md`
- Score confidence (high/medium/low) on whether this is a real qualifying business

### Step 3: Website Scraping

For businesses that pass the LLM filter:
- Scrape the business website for additional data (socials, phone, email)
- Locate the logo image on the site
- Verify the business appears operational (no "permanently closed" signals)

### Step 4: Logo Processing

- Download the logo image from the business website
- Convert to SVG using **Vectorizer.ai** API (~$0.10/image)
- Upload the SVG to Supabase Storage (`logos/` bucket)
- Store the public URL on the store record

---

## Existing Business Verification

For each state/province, before searching for new businesses:

1. Query the Supabase `stores` table for all businesses in that state
2. For each existing business:
   - Check if the website is still live (HTTP status)
   - Check if social media links are still valid
   - Look for any new social channels not yet recorded
   - Look for signs of closure (website down, "permanently closed" on Google, etc.)
3. If changes detected:
   - Do NOT auto-update the record
   - Create a review note / flag on the store record describing what changed
   - Example: `"Agent 2026-02-14: Website returns 404. Possibly closed."`
   - Example: `"Agent 2026-02-14: Found new Instagram @storename not in DB."`

---

## LLM Configuration

**Provider-agnostic** — configurable via environment variable:

```env
AGENT_LLM_PROVIDER=anthropic    # or: openai, google
AGENT_LLM_MODEL=claude-haiku    # or: gpt-4o-mini, gemini-flash
```

Supported providers:
- **Anthropic** — Haiku (default, cheapest), Sonnet, Opus
- **OpenAI** — GPT-4o-mini (cheapest), GPT-4o
- **Google** — Gemini Flash (cheapest), Gemini Pro

Start with the cheapest tier. Upgrade only if output quality is insufficient.

### Estimated cost per state/day

| Model tier | Est. cost |
|---|---|
| Cheap (Haiku / 4o-mini / Flash) | $0.05–0.30 |
| Mid (Sonnet / 4o / Pro) | $0.50–3.00 |
| Premium (Opus / o1) | $5–15+ (not recommended) |

Plus:
- Search API: ~$0.005/query × ~20 queries/state = ~$0.10/state
- Vectorizer.ai: ~$0.10/logo × ~10-30 logos/state = $1–3/state
- **Total estimated: ~$2–5/state/day**

---

## Triggers

### 1. Scheduled (GitHub Actions cron)

```yaml
# .github/workflows/agent-research.yml
on:
  schedule:
    - cron: '0 6 * * *'   # Daily at 6:00 AM UTC
```

The workflow:
1. Determines which state/province is next in the rotation
2. Runs the agent script for that state
3. Sends email summary via Resend

### 2. Manual (Admin Panel)

An admin page button: **"Research [State] Now"**

- Dropdown to select a state/province
- Triggers the same GitHub Actions workflow via the [workflow_dispatch API](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)
- Shows progress/results in the admin dashboard

```
POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
{ "ref": "main", "inputs": { "state": "OR" } }
```

---

## Reporting

### Daily Email (via Resend)

Sent after each state run:

```
Subject: Agent Report: Oregon — 12 new, 3 flagged

New businesses found: 12
  - Green Roots Refillery (Portland) — needs-review
  - Pacific Bulk Foods (Eugene) — needs-review
  - ...

Existing businesses flagged: 3
  - Eco Haven (Salem) — website returning 404
  - Zero Waste PDX (Portland) — found new TikTok @zerowaste_pdx
  - Refill Revolution (Bend) — Google Maps shows "permanently closed"

Logos converted: 10 SVGs uploaded

Next state: Pennsylvania (scheduled tomorrow)
```

### Admin Dashboard

A new section in the admin panel (`/admin/agent`):

- **Run history** — table of past agent runs (date, state, new found, flagged, errors)
- **Manual trigger** — dropdown + "Run Now" button
- **Current rotation position** — shows which state is next
- **Pending reviews** — quick link to stores with agent-generated review notes

---

## Data Flow

```
GitHub Actions (cron or manual dispatch)
  → Node.js script (TypeScript)
    → Search API queries for the target state
    → LLM processes results → structured business data
    → For each business:
      → Check if already in DB (by name + city match)
      → If new: scrape website, grab logo, convert SVG, insert as needs-review
      → If existing: verify website/socials, flag changes in review_notes
    → Send email summary via Resend
    → Log run results to a `agent_runs` table in Supabase
```

---

## Database Additions Needed

### `agent_runs` table

```sql
CREATE TABLE agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  country text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  new_found integer DEFAULT 0,
  existing_flagged integer DEFAULT 0,
  logos_converted integer DEFAULT 0,
  errors text[],
  trigger_type text NOT NULL DEFAULT 'scheduled',  -- 'scheduled' or 'manual'
  llm_provider text,
  llm_model text,
  cost_estimate numeric(8,4)
);
```

### `agent_rotation` table (or simple key-value)

```sql
CREATE TABLE agent_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Track rotation position
INSERT INTO agent_config (key, value) VALUES ('next_state_index', '0');
```

---

## Required API Keys / Services

| Service | Purpose | Est. monthly cost |
|---|---|---|
| Google Custom Search API (or Bing) | Web search queries | Free tier: 100/day, then $5/1000 |
| Anthropic / OpenAI / Google AI | LLM for analysis | $2–10/month at cheap tier |
| Vectorizer.ai | Raster → SVG conversion | ~$30–90/month (300-900 logos) |
| Resend (already configured) | Email notifications | Free tier likely sufficient |
| GitHub Actions | Scheduling + compute | Free (2,000 min/month) |

**Estimated total: ~$40–120/month** depending on volume.

---

## File Structure (planned)

```
agent/
  index.ts              — Main entry point
  config.ts             — State rotation list, env config
  search.ts             — Web search API integration
  llm.ts                — LLM provider abstraction (Anthropic/OpenAI/Google)
  scraper.ts            — Website scraping for logos + data
  logo-converter.ts     — Vectorizer.ai integration
  verifier.ts           — Existing business verification logic
  reporter.ts           — Email summary + DB logging
  types.ts              — Agent-specific types

.github/workflows/
  agent-research.yml    — Cron + manual dispatch workflow

src/app/admin/agent/
  page.tsx              — Admin dashboard for agent runs + manual trigger
```

---

## Open Questions (to resolve before building)

1. **Google Custom Search vs Bing Search API** — which to use? Google has better coverage but stricter limits. Bing is cheaper.
2. **Duplicate detection heuristic** — match by exact name + city? Fuzzy matching? What threshold?
3. **How many search queries per state** — more queries = more coverage but higher cost. Start with ~15-20?
4. **Rate limiting** — how many websites to scrape per run before backing off?
5. **Vectorizer.ai fallback** — what if conversion fails? Store the raster image as-is?

---

## Build Priority

This is a **future project**. Current priorities:
1. Finish core site features (multi-location, homepage redesign)
2. Run pending SQL migrations
3. Build and populate the directory with manual/CSV imports
4. Then build this agent once there's a baseline of data to compare against
