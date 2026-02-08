# Eco-Friendly Store Directory - Implementation Plan

## Project Overview
A directory website listing eco-friendly stores (online and brick & mortar) across North America, with automated discovery and maintenance via an agent system.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  JSON Data Files │◀────│  Discovery Agent│
│   (Vercel)      │     │  (Git Repo)      │     │  (GitHub Actions)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Phase 1: Project Setup & Data Structure

### 1.1 Initialize Next.js Project
- Create Next.js 14+ app with App Router
- Configure TypeScript
- Set up Tailwind CSS for styling
- Configure ESLint and Prettier

### 1.2 Data Schema
Each store will be stored as a JSON object:

```json
{
  "id": "unique-slug",
  "name": "Green Earth Refillery",
  "description": "Zero-waste store specializing in household products...",
  "category": ["refillery", "zero-waste"],
  "type": "brick-and-mortar",
  "logo": "/logos/green-earth.png",
  "website": "https://greenearthrefillery.com",
  "contact": {
    "email": "hello@greenearthrefillery.com",
    "phone": "+1-555-123-4567"
  },
  "location": {
    "address": "123 Main St",
    "city": "Portland",
    "state": "OR",
    "country": "USA",
    "coordinates": { "lat": 45.5155, "lng": -122.6789 }
  },
  "social": {
    "instagram": "@greenearthrefillery",
    "facebook": "greenearthrefillery"
  },
  "addedDate": "2024-01-15",
  "lastVerified": "2024-01-15",
  "status": "active"
}
```

### 1.3 File Structure
```
/data
  /stores
    - usa-or-portland.json    (stores grouped by location)
    - usa-ca-losangeles.json
    - can-on-toronto.json
  - categories.json
  - stats.json
/public
  /logos
    - (store logos)
```

---

## Phase 2: Frontend Development

### 2.1 Core Pages
- **Home** (`/`) - Hero, search bar, featured stores, category overview
- **Browse** (`/stores`) - Filterable/searchable store listing
- **Map** (`/map`) - Full-page interactive map view
- **Store Detail** (`/stores/[slug]`) - Individual store page
- **Category** (`/category/[category]`) - Stores by category
- **Location** (`/location/[state]`) - Stores by state/province
- **Submit** (`/submit`) - Store submission form for owners
- **About** (`/about`) - Project info, submission guidelines

### 2.2 Features
- **Search**: Full-text search across store names and descriptions
- **Filters**: By category, location (state/province), type (online/physical)
- **Map View**: Interactive map using Leaflet + OpenStreetMap (free, no API key needed)
- **Store Submission**: Form for store owners to submit their store (creates GitHub PR)
- **SEO**: Static generation for all store pages, proper meta tags

### 2.3 UI Components
- Store card (grid/list view)
- Search bar with autocomplete
- Filter sidebar
- Category badges
- Location breadcrumbs
- Pagination

---

## Phase 3: Agent System

### 3.1 Discovery Agent
Runs every 10-20 days via GitHub Actions cron job.

**Discovery Sources:**
- Google Search API (or SerpAPI) for queries like:
  - "zero waste store [city]"
  - "refillery near [city]"
  - "eco-friendly shop [state]"
  - "bulk store [city] sustainable"
- Scrape existing directories (with respect to robots.txt)
- Check social media for new store announcements

**Process:**
1. Query search APIs for eco-friendly store terms
2. Extract potential store URLs from results
3. Scrape store websites for contact info, description
4. Cross-reference against existing database to avoid duplicates
5. Create a pull request with new entries for review

### 3.2 Verification Agent
Runs alongside discovery or on separate schedule.

**Checks:**
- HTTP HEAD request to store website (detect 404, domain expired)
- Check for "permanently closed" indicators
- Verify social media accounts still active
- Flag stores not verified in 60+ days

**Actions:**
- Mark stores as "needs-review" if issues detected
- Create PR to update `lastVerified` dates
- Remove or archive confirmed closed stores

### 3.3 GitHub Actions Workflow
```yaml
name: Store Discovery & Verification
on:
  schedule:
    - cron: '0 0 */15 * *'  # Every 15 days
  workflow_dispatch:  # Manual trigger

jobs:
  discover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run agent:discover
      - run: npm run agent:verify
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
```

---

## Phase 4: Deployment & Infrastructure

### 4.1 Vercel Setup
- Connect GitHub repository
- Configure automatic deployments on push to main
- Set up preview deployments for PRs
- Configure environment variables for API keys

### 4.2 Environment Variables
```
SERPAPI_KEY=xxx          # For search queries
GITHUB_TOKEN=xxx         # For agent PR creation
```

### 4.3 Domain & DNS
- Purchase/configure custom domain
- Set up SSL (automatic via Vercel)

---

## Phase 5: Initial Data Population

### 5.1 Seed Data Strategy
1. Manually curate initial 50-100 stores across major cities
2. Focus on well-known chains and established local stores
3. Verify all initial entries manually

### 5.2 Target Cities for Launch
- USA: Portland, Seattle, San Francisco, Los Angeles, NYC, Austin, Denver, Chicago
- Canada: Vancouver, Toronto, Montreal

---

## Store Categories

- `refillery` - Bring-your-own-container refill stores
- `zero-waste` - Zero waste lifestyle stores
- `bulk-foods` - Bulk food stores with sustainable practices
- `sustainable-goods` - General eco-friendly products
- `thrift-consignment` - Secondhand/vintage stores
- `farmers-market` - Permanent eco-focused markets
- `online-only` - E-commerce eco stores

---

## Technical Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Maps | Leaflet + OpenStreetMap (react-leaflet) |
| Data | JSON files in Git |
| Hosting | Vercel |
| Agent Runtime | GitHub Actions |
| Search API | SerpAPI or Google Custom Search |
| Scraping | Cheerio + Puppeteer (if needed) |

---

## Decisions Made

1. **Manual review**: ✅ Yes - Agent creates PRs that require manual approval before merging
2. **Map feature**: ✅ Yes - Include interactive map view (using Leaflet with OpenStreetMap)
3. **User submissions**: ✅ Yes - Add a submission form that creates PRs for review
4. **Logo handling**: Link to external URLs (simpler, no storage costs)

---

## Next Steps

Once this plan is approved, I'll start with Phase 1:
1. Initialize the Next.js project in this folder
2. Set up the data schema and folder structure
3. Create the core components and pages
