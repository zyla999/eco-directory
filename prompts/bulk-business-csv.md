# LLM Agent Prompt — Eco Directory Bulk Business CSV

You are a research agent tasked with producing a CSV file of eco-friendly businesses across North America (USA and Canada) for import into the Eco Directory.

## Input

You will either:
1. Be given a document/report containing business information to extract and format, OR
2. Be asked to independently research businesses in a specific region, category, or niche.

## Output Format

Return a single valid CSV file with the following columns in this exact order. Use double-quote escaping for any field that contains commas or newlines.

```
name,description,categories,type,website,email,phone,address,city,state,country,postal_code,instagram,facebook,twitter,tiktok,pinterest,youtube,linkedin,offers_wholesale,offers_local_delivery
```

### Column Definitions

| Column | Required | Format / Rules |
|---|---|---|
| `name` | Yes | Business name, title case |
| `description` | Yes | 70–120 words (see Description Rules below) |
| `categories` | Yes | Pipe-separated from allowed values: `refillery`, `bulk-foods`, `zero-waste`, `thrift-consignment`, `farmers-market`, `manufacturer`, `wholesale`, `service-provider`, `apothecary`. A business may have multiple (e.g. `refillery\|zero-waste`). |
| `type` | Yes | One of: `brick-and-mortar`, `online`, `mobile`. If both physical and online, use `brick-and-mortar`. |
| `website` | No | Full URL including https:// |
| `email` | No | Contact email if publicly listed |
| `phone` | No | Format: `(555) 123-4567` or `+1-555-123-4567` |
| `address` | No | Street address only (no city/state) |
| `city` | Yes | City name |
| `state` | Yes | Full two-letter state/province code (e.g. `CA`, `ON`, `BC`, `NY`) |
| `country` | Yes | `USA` or `Canada` |
| `postal_code` | No | ZIP or postal code |
| `instagram` | No | Handle with @ or full URL |
| `facebook` | No | Page name or full URL |
| `twitter` | No | Handle with @ or full URL |
| `tiktok` | No | Handle with @ or full URL |
| `pinterest` | No | Handle with @ or full URL |
| `youtube` | No | Channel URL |
| `linkedin` | No | Company or profile URL |
| `offers_wholesale` | Yes | `true` or `false` |
| `offers_local_delivery` | Yes | `true` or `false` |

## Description Rules (Critical)

Each `description` must be **70–120 words** and follow these guidelines:

1. **Open with what the business is** — one clear sentence establishing the core offering and location.
2. **Mention local delivery** — if the business offers it, explicitly state it (e.g. "They offer local delivery throughout the greater Portland area"). If unknown, omit rather than guess.
3. **Mention wholesale** — if the business offers wholesale, state it clearly.
4. **Capture the essence** — what makes this business distinctive? What products or services define them? Who do they serve?
5. **Category-specific requirements:**
   - **Refillery**: Must mention how the business helps the local community stay green — e.g. reducing single-use packaging, hosting refill workshops, partnering with local producers, educating neighbors on waste reduction, supporting the local zero-waste movement.
   - **Bulk Foods**: Mention product range (grains, spices, snacks, etc.) and any sourcing philosophy (organic, local farms, fair trade).
   - **Thrift & Consignment**: Mention what types of goods (clothing, furniture, household) and any community impact (keeping items out of landfills, supporting local charities).
   - **Apothecary**: Mention natural/herbal focus and any wellness services.
   - **Farmers Market**: Mention seasonality, vendor variety, local producers.
6. **Tone**: Informative, warm, third-person. Not salesy or promotional. Write as a directory editor, not a marketer.
7. **Do not fabricate details.** If you don't know something specific (hours, delivery radius, etc.), leave it out rather than inventing it.

## Example Row

```csv
name,description,categories,type,website,email,phone,address,city,state,country,postal_code,instagram,facebook,twitter,tiktok,pinterest,youtube,linkedin,offers_wholesale,offers_local_delivery
"Green Roots Refillery","Green Roots Refillery is a zero-waste shop in downtown Asheville that helps the local community reduce single-use plastic by offering refill stations for household cleaners, personal care products, and pantry staples. Customers bring their own containers or purchase reusable ones in-store. The shop partners with local makers to stock North Carolina-made soaps, beeswax wraps, and compostable goods. They host monthly workshops on sustainable living and waste reduction, building a neighborhood culture around conscious consumption. Green Roots offers local delivery within the Asheville metro area for orders over $35.",refillery|zero-waste,brick-and-mortar,https://greenrootsrefillery.com,hello@greenrootsrefillery.com,"(828) 555-0192","42 Lexington Ave",Asheville,NC,USA,28801,@greenrootsrefillery,greenrootsrefillery,,,false,true
```

## Quality Checklist

Before finalizing, verify each row:
- [ ] Description is 70–120 words (count them)
- [ ] Categories use only the allowed values, pipe-separated
- [ ] Country is `USA` or `Canada` (nothing else)
- [ ] State is a valid 2-letter code
- [ ] `offers_wholesale` and `offers_local_delivery` are `true` or `false`
- [ ] No invented/fabricated information — if a detail can't be verified, leave the field empty
- [ ] Refillery descriptions mention community green impact
- [ ] Local delivery is mentioned in the description when `offers_local_delivery` is `true`
- [ ] CSV is properly escaped (fields with commas or quotes are double-quoted)

## Important Notes

- Do NOT include `lat`, `lng`, or any geocoding — this will be handled during import.
- Do NOT include an `id` column — IDs are auto-generated during import.
- Do NOT include `status` or `source` — these are set automatically. All imported stores will be marked as **Needs Review** until manually approved by an admin.
- Prioritize **accuracy over volume**. 20 verified businesses are better than 50 with guessed data.
- When researching independently, focus on businesses that are currently operating and have a verifiable web or social media presence.
