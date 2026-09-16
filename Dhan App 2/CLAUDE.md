# Dhan App — design system memory

## Typography (Poppins throughout)
- **Page-level headings** (top-of-page titles below the app bar: Transactions, Budget, Bills & subs, More, Splits & Dues): 20px / weight 500 / #141C41. Never 22–24px, never bold.
- **Section headings** (SectionHead in components.jsx, and inline section labels like "With your people", "Savings goals", "Upcoming bills"): 16px / weight 500.
- App-bar titles use `ScreenHeader` (Insights, Savings goals screens) — separate from page-level headings.
- Amounts/values keep their own weights (600–700) and `fontVariantNumeric: "tabular-nums"`.

## Gold text buttons
Every tappable gold (#C9A84C / `--dhan-gold`) text-only CTA uses the shared `.gold-btn` class in `colors_and_type.css`:
1px solid gold border, 8px radius, 8px/16px padding, light gold fill (`rgba(201,168,76,.14)`, .24 on hover), gold text, weight 600.

Applies to: Categorise now, Change framework / Edit categories, + Create new budget, + New group, + Add needs / + Add wants / + Add goal, Request settlement reminders, Done (budget edit, split edit).
Does **not** apply to Home's "See all" links — those are plain navy (#141C41) Poppins Medium 12px text with a trailing caret, no border or fill.
Does **not** apply to gold used as a plain label, amount, percentage, icon, or progress-bar fill — those stay borderless.

## Home dashboard section order (do not reorder)
Greeting → quick actions → Uncategorised → This month's budget (+ Needs/Wants/Savings) → Recent transactions → Insights teaser → **Savings goals** → Upcoming bills.
Budget details and Savings goals are two separate, independently spaced sections; Savings goals must not sit directly under the budget card.

## Row / list standard (Transaction Detail visual standard)
Icon chip + regular-weight label + hairline divider, 16px row padding; right columns for amounts and pills use fixed widths so rows align.
