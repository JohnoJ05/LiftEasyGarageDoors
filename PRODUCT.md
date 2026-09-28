# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Domestic homeowners across West Yorkshire, North Yorkshire, Teesside and County Durham whose garage door has stopped working, is misbehaving (noisy, sticking, difficult to open), or needs routine servicing. The job: get a working garage door back, quickly, without being upsold a replacement.

## Product Purpose

Lift Easy Garage Doors is the marketing/contact site for Steve Procter's one-man garage door repair, servicing, and remote-control business. It exists to get the phone to ring (or a message sent) when someone's garage door has failed, and to communicate the trust signals (experience, directness, honesty) that matter for a home-repair trade decision. Success is a call, text, or enquiry from someone in the covered service area.

## Positioning

A repair-and-servicing specialist, not a garage door retailer or installer — explicitly and repeatedly distinguished from competitors who use repair calls as a lead-in to sell a new door. You speak directly to Steve, and Steve is the one who turns up and does the work: no call centre, no subcontractors, no middleman.

## Operating Context

- Single operator (Steve Procter), reached directly by phone/text (07939 500544) or email (ste.procter@live.com); no booking system, live chat, or online payment — the contact form opens the visitor's own email client (mailto-based) rather than submitting to a backend.
- Reactive, fast-response model with same-day repairs offered where possible.
- Site is split into standalone service pages (repairs, servicing, remotes) plus about/areas/contact, all static HTML sharing one header/footer/nav.
- Currently a **preview build**: `noindex, nofollow` is set on every page and is meant to be removed only once the site goes live.

## Capabilities and Constraints

- In scope: garage door repairs (springs, cables, locks, handles, hinges, rollers, motors, general mechanical faults), servicing/inspection, remote control replacement/programming, and supply/fitting of remote-control systems.
- Explicitly out of scope: selling or installing new garage doors.
- Domestic doors only; no evidence of a commercial/landlord offering.
- Service area is fixed and named consistently: West Yorkshire, North Yorkshire, Teesside, and County Durham.
- Static HTML/CSS/JS site, no framework or build tooling (no package.json) — plain files served as-is.
- No CMS or backend; content changes mean editing the HTML directly.

## Brand Commitments

- Name: **Lift Easy Garage Doors**, "by Steve Procter." Tagline framing: "Garage door not working? Don't struggle with it, give Steve a call."
- Voice: direct, plain-spoken, reassuring trade voice — short sentences, first-name familiarity with Steve, no corporate distance.
- Domain: lifteasygaragedoors.co.uk.
- Brand logos already vectorised for the door makes Steve services: Hörmann, Garador, Henderson, Cardale, Wessex, Gliderol (`assets/logos/`).

## Evidence on Hand

- All page copy (experience claims, service list, area coverage, contact details) is real, confirmed business copy already published across the site — not placeholder text.
- `Images/` contains real WhatsApp photos (van, work-in-progress shots) and raw/unvectorised logo files, but these are **not yet confirmed ready for production use** — treat as reference only, not as approved final assets. The `Images/` directory is gitignored.
- Every page currently has one or more `photo-slot` placeholders (with a camera icon and "Photo to add" label) marking exactly where a real photo is intended to go, with a note describing the desired shot (e.g. "Steve's Lift Easy van parked outside a customer's garage," "Portrait of Steve standing beside his Lift Easy van"). Do not fabricate photography to fill these — they stay as placeholders until real, approved photos are supplied.
- No testimonials, case studies, certifications, insurance details, guarantees, or press mentions exist anywhere in the current copy — none should be invented.

## Product Principles

1. Directness over polish-for-its-own-sake: every page should make it trivially easy to call or text Steve — the phone number is the primary conversion path, not a secondary link.
2. Repairs-first identity: never blur the "we don't sell/install new doors" distinction — it's the core differentiator from bigger competitors.
3. One-man-band trust: personal, first-name framing ("you speak to Steve") should stay legible in any future design or copy work, not get diluted into a faceless-company tone.
4. Honest, unembellished claims only: no fabricated reviews, stats, or credentials — the business currently has none published, and that must stay true of any new content.
5. Local and specific: lead with the named service area rather than generic "we cover your area" language.
