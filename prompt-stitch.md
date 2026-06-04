# Gifcards — Stitch UI Prompt Pack

Copy-paste prompts for [Google Stitch](https://stitch.withgoogle.com/) to generate the full UI of the Gifcards MVP. Derived from `design.md` (P0 + P1 screens).

> **Scope:** 22 screens (P0 + P1). Excludes P2 screens (M9 Edit gift card, M10 Analytics, C7 Wallet, C8 Wallet login, M16 Payments settings).
> **Target:** Web / desktop layouts, responsive down to tablet/mobile.
> **Language of generated UI:** English (default), Spanish-ready copy.

---

## How to use with Stitch

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com/) and create a new project in **Web** mode.
2. Paste **Section 1 — Global Design System Prompt** first. This sets the theme (colors, typography, spacing, layout conventions) for the whole project.
3. Then generate each screen one at a time by pasting its prompt from **Section 2**. Each screen prompt is self-contained and restates the key theme tokens, so it also works standalone.
4. After a screen is generated, refine with short follow-up prompts (e.g. "make the sidebar collapsible", "tighten card spacing").
5. Tip: keep the palette hexes in every prompt so Stitch stays on-brand even across separate generations.

---

## Section 1 — Global Design System Prompt

```text
You are designing a modern, trustworthy B2B2C SaaS web product called "Gifcards". It lets local businesses in Latin America create, sell, and manage digital gift cards without technical setup. There are two audiences: merchants (business owners managing an admin dashboard) and customers (buyers/redeemers using public storefront and gift card pages).

Design language:
- Clean, minimal, professional fintech aesthetic. Generous whitespace. Confident but friendly.
- Web-first, fully responsive (desktop, tablet, mobile). Touch targets at least 44px. Mobile-friendly.
- Accessible: WCAG AA contrast, visible focus states, clear form labels.

Color palette (use exactly):
- Primary (text, headings, primary buttons, top nav): #111827
- Secondary / brand action (CTAs, links, active states, highlights): #4F46E5
- Accent / success (positive badges, confirmations, KPI highlights): #10B981
- Background (page background): #FFFFFF
- Surface (cards, panels, sidebars, input backgrounds): #F9FAFB
- Border (dividers, input and card borders): #E5E7EB
- Text secondary (subtitles, labels, metadata, placeholders): #6B7280

Typography:
- Modern geometric sans-serif (Inter or similar). Clear hierarchy: bold large headings, medium subheadings, regular body, small muted captions.

Components & style:
- 8px spacing scale. Rounded corners (cards/inputs ~12px, buttons ~8px). Subtle shadows on cards and dropdowns.
- Primary buttons: solid #4F46E5 with white text. Secondary buttons: white with #E5E7EB border and #111827 text. Success states use #10B981.
- Inputs: #F9FAFB fill, #E5E7EB border, #6B7280 placeholder, #4F46E5 focus ring.
- Status badges: green (active/success), gray (paused/neutral), red (error/expired), amber (warning/pending).
- Cards on #F9FAFB surface over #FFFFFF page, or vice versa, with #E5E7EB borders.

Layout conventions:
- Merchant admin app: persistent left sidebar nav (Dashboard, Gift Cards, Redeem, Transactions, Settings) + top bar with business name, language toggle (EN/ES), and avatar menu. Content area on the right.
- Auth & onboarding screens: centered single-column card on a soft #F9FAFB background, with the Gifcards logo on top.
- Public landing & customer screens: full-width marketing/storefront layout with a top navigation bar and footer.
- Always include an EN/ES language toggle in nav/headers.

This is a white-label-aware product: the platform UI uses the palette above, but customer storefront and gift card visuals also reflect each merchant's own logo and brand colors.
```

---

## Section 2 — Screen Prompts

### Public — Landing

#### L1 — Landing Page (`/`)

```text
Design a long, single-scroll marketing landing page (web, responsive) for "Gifcards", a platform that lets local businesses create and sell digital gift cards in minutes. Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280. Modern Inter-style sans-serif.

Sections top to bottom:
1. Sticky top nav: Gifcards logo (left); anchor links "Features", "How it works", "FAQ"; a ghost "Login" button and a solid #4F46E5 "Start free" CTA; EN/ES language toggle (right).
2. Hero: large bold headline "Create and sell gift cards in under 5 minutes", supporting subheadline about no code and growing revenue. Primary CTA "Start free" and secondary CTA "See how it works". To the right, an animated/floating mockup of a branded digital gift card with a QR code.
3. Social proof bar: muted row of placeholder business logos with caption "Trusted by local businesses in Ecuador".
4. Problem vs Solution: two-column contrast block. Left: the pain (no digital infrastructure, expensive complex tools). Right: the Gifcards solution (simple, mobile-first, white-label).
5. Benefits grid: 6 icon cards — Speed ("publish in under 5 minutes, no code"), Upfront revenue ("sell before you serve, improve cash flow"), Retention ("brings customers back"), Zero technical friction ("built for non-digital businesses"), Multichannel distribution ("link, downloadable QR, email"), Security ("unique codes, secure Stripe payments").
6. Features for Merchants: list with icons — create gift cards fast, branding (logo/colors), QR & link generation, sales dashboard, in-store redemption, real-time tracking.
7. Features for Customers: list with icons — buy online, receive by email/link, wallet, show QR in store, partial balance support.
8. How it works: 3-step horizontal visual — Create -> Sell -> Redeem, each with an icon and one line.
9. Product demo: a framed carousel/preview showing the creation wizard, a storefront, and a gift card QR.
10. Impact stats: 3 large stat blocks — "< 2 min setup", "100% digital", "Real-time tracking".
11. FAQ: accordion with 6 questions (pricing, accepted payments, how redemption works, security, expiration, support).
12. Final CTA banner: full-width #4F46E5 band with "Create your first gift card today" and a white "Start free" button.
13. Footer: Gifcards logo, legal links (Terms, Privacy), contact, social icons, EN/ES toggle.

Tone: confident, friendly fintech. Lots of whitespace, strong type hierarchy, the #4F46E5 CTA repeated in hero, mid-page, and footer band.
```

---

### Merchant — Auth & Onboarding

#### M1 — Login (`/login`)

```text
Design a merchant Login screen (web) for the Gifcards SaaS. Centered single-column card on a soft #F9FAFB background, Gifcards logo on top. Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Border #E5E7EB, Text Secondary #6B7280.

Card contents: title "Welcome back", email input, password input with show/hide toggle, a "Forgot password?" link aligned right, a full-width solid #4F46E5 "Log in" button, a divider "or", a white "Continue with Google" button with Google icon and #E5E7EB border. Below the card: "Don't have an account? Sign up" link. Top-right of the screen: EN/ES language toggle. Include an inline error toast style for invalid credentials. Clean, minimal, accessible labels.
```

#### M2 — Signup (`/signup`)

```text
Design a merchant Signup screen (web) for Gifcards. Centered single-column card on #F9FAFB, Gifcards logo on top. Palette: Primary #111827, Secondary #4F46E5, Border #E5E7EB, Text Secondary #6B7280.

Card contents: title "Create your account", full name input, email input, password input with strength hint, confirm password input, a terms-and-conditions checkbox with linked "Terms" and "Privacy", a full-width solid #4F46E5 "Create account" button, divider "or", white "Continue with Google" button with #E5E7EB border. Below: "Already have an account? Log in" link. Show inline field validation states (error in red, valid in #10B981). EN/ES toggle top-right.
```

#### M3 — Forgot Password (`/forgot-password`)

```text
Design a Forgot Password screen (web) for Gifcards merchants. Centered card on #F9FAFB, logo on top. Palette: Primary #111827, Secondary #4F46E5, Border #E5E7EB, Text Secondary #6B7280.

Card contents: title "Reset your password", short helper text "Enter your email and we'll send you a reset link.", email input, full-width #4F46E5 "Send reset link" button, and a "Back to login" link. Also show the success state variant: a confirmation card with a green #10B981 check icon, "Check your email" heading, and a "Resend link" text button.
```

#### M4 — Onboarding: Business Profile (`/onboarding`)

```text
Design an onboarding "Business profile" setup screen (web) for a Gifcards merchant, shown right after signup. Centered wider card on #F9FAFB with a small step progress indicator at top ("Step 1 of 1: Set up your business"). Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Form fields: business name input; a public URL/slug field shown as "gifcards.com/" prefix + editable slug with an availability check indicator (green check when available); logo upload area with drag-and-drop and crop/preview thumbnail; two color pickers labeled "Primary color" and "Secondary color" with swatches; optional contact email and phone inputs. On the right side, a live preview card showing how the business branding (logo + colors) will look on a gift card. Primary full-width #4F46E5 "Save & continue" button at the bottom. Friendly, guided tone.
```

---

### Merchant — Core

All merchant core screens share the admin shell: a persistent left sidebar (Dashboard, Gift Cards, Redeem, Transactions, Settings) and a top bar with business name, EN/ES toggle, and avatar menu.

#### M5 — Dashboard (`/dashboard`)

```text
Design the merchant Dashboard screen (web) for the Gifcards admin app. Use the admin shell: left sidebar nav (Dashboard active, Gift Cards, Redeem, Transactions, Settings) and a top bar (business name, EN/ES toggle, avatar). Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Main content: page title "Dashboard" with a prominent #4F46E5 "Create gift card" button top-right. A row of 3 KPI cards: "Total sales" (e.g. $4,820), "Redemptions" (e.g. $1,240), "Outstanding balance" (e.g. $3,580), each with a small trend indicator and a 30-day period selector. Below, a "Recent activity" panel listing the 5 latest transactions (type icon purchase/redemption, gift card name, amount, date). A secondary "Quick actions" row linking to Redeem, Gift cards, Transactions.

Also describe the empty state variant: a friendly onboarding checklist card ("Complete your profile", "Create your first gift card", "Share your link") with a big "Create your first gift card" CTA.
```

#### M6 — Create Gift Card Wizard (`/gift-cards/new`)

```text
Design a 3-step "Create gift card" wizard screen (web) inside the Gifcards admin shell. Top stepper with 3 steps: "Value", "Design", "Publish". Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280. Show a persistent live gift-card preview on the right side across all steps.

Step 1 - Value: gift card name input; a toggle between "Fixed amount" and "Variable range"; if fixed, an amount input; if variable, min and max amount inputs; currency shown as USD.
Step 2 - Design: a personal message textarea; a toggle "Use my business branding" (inherit merchant logo and colors); optional color/message overrides; live preview updates.
Step 3 - Publish: full card preview, summary of value and design, a big #4F46E5 "Publish" button. After publishing, show a success share panel: public link with a "Copy link" button and a QR code with a "Download QR" button.

Footer nav: Back and Next buttons; a "Discard" text link that opens a confirmation. Keep it fast and minimal (target under 2 minutes to complete).
```

#### M7 — Gift Card List (`/gift-cards`)

```text
Design the "Gift cards" list screen (web) in the Gifcards admin shell (Gift Cards active in sidebar). Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Top: page title "Gift cards", a search input, a status filter (All / Active / Paused), and a #4F46E5 "New gift card" button. Main: a responsive grid of gift card tiles. Each tile shows a branded card thumbnail, the name, a status badge (green "Active" / gray "Paused"), sales count, and revenue, plus an overflow menu (View, Edit, Pause). Include an empty state with an illustration and a "Create your first gift card" CTA.
```

#### M8 — Gift Card Detail (`/gift-cards/:cardId`)

```text
Design the Gift Card Detail screen (web) in the Gifcards admin shell. Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Header: gift card name with a status badge and a pause/resume toggle; an "Edit" button. Left/main: a large branded card preview and a share panel (public link with "Copy link", QR code with "Download QR"). A row of mini metric cards: "Sold", "Redeemed", "Outstanding". Below: a "Transactions" tab/section showing a paginated table of purchases and redemptions for this card (date, type, amount, customer email, status). A back link to the gift cards list.
```

#### M11 — Transactions (`/transactions`)

```text
Design the Transactions screen (web) in the Gifcards admin shell (Transactions active in sidebar). Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Top: page title "Transactions" and a filter bar — type filter (All / Purchases / Redemptions), date range picker, gift card selector, and a search input. Main: a clean, sortable table with columns: Date, Type (badge: purchase / redemption), Gift card, Amount, Customer email, Code, Status. Rows are clickable and open a right-side detail drawer with full transaction info. Include pagination at the bottom and an empty state. This is the auditable log of all activity.
```

#### M12 — Redemption Mode (`/redeem`)

```text
Design the in-store "Redeem" screen (web, also works on mobile) in the Gifcards admin shell (Redeem active in sidebar). This is used by the merchant/staff to redeem a customer's gift card. Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Layout: page title "Redeem a gift card". A large camera QR-scanner viewport with a scanning frame overlay, and below it a divider "or enter code manually" with a code input and a #4F46E5 "Validate" button. To the side, a "Recent redemptions" list.

Show the validation result panel in multiple states:
- Valid: green #10B981 panel with the card name, current balance, and a "Continue" button.
- Invalid / code not found: red error panel with a clear message.
- No balance: panel showing $0 balance, redemption blocked.
- Already redeemed: panel showing the previous transaction (idempotent).
```

#### M13 — Redemption Confirmation (`/redeem/confirm`)

```text
Design the Redemption Confirmation screen (web/mobile) in the Gifcards admin shell, shown after a code is validated. Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Card summary at top: gift card name, masked code, and current balance prominently. An "Amount to redeem" input with a max equal to the current balance and quick "Use full balance" option; an optional notes field. A live "Remaining balance" preview updates as the amount changes. Two buttons: a solid #4F46E5 "Confirm redemption" and a secondary "Cancel".

Also include the success receipt state: a green #10B981 check, "Redemption successful", the redeemed amount, the new remaining balance, the date/time, and options to "Print receipt" or "Done".
```

---

### Merchant — Settings

#### M14 — Settings: Account (`/settings/account`)

```text
Design the "Account settings" screen (web) in the Gifcards admin shell (Settings active in sidebar), with a settings sub-navigation showing tabs "Account", "Business", "Payments" (Account selected). Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Content sections in cards: "Email" (shows current email with an "emailVerified" green badge); "Change password" (current password, new password, confirm new password, Save button); "Language" (EN/ES selector); a "Log out" button; and a subdued "Delete account" link at the bottom (marked as coming soon). Clean form layout with section headers and helper text in #6B7280.
```

#### M15 — Settings: Business (`/settings/business`)

```text
Design the "Business settings" screen (web) in the Gifcards admin shell with settings tabs "Account", "Business" (selected), "Payments". Palette: Primary #111827, Secondary #4F46E5, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Reuse the onboarding profile fields in an editable form: business name; public URL/slug ("gifcards.com/" prefix + editable slug) with a warning note that changing the slug breaks existing links; logo upload with current logo preview; primary and secondary color pickers with swatches; contact email and phone. A live branding preview card on the right. A sticky "Save changes" #4F46E5 button. Show a slug-change warning banner in amber.
```

---

### Customer — Storefront, Purchase & Gift Card

Customer screens are public and white-label: they show the individual merchant's logo and brand colors, while keeping the clean Gifcards layout structure. Use a placeholder merchant ("Cafe Luna", warm brand color) in the mockups.

#### C1 — Storefront (`/:merchantSlug`)

```text
Design a public white-label gift card storefront page (web, responsive) for a single merchant on Gifcards. Use the merchant's branding: a header with the merchant logo, business name, and the merchant's brand color as an accent (use a warm placeholder like "Cafe Luna"). Keep layout structure clean with Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Top nav: merchant logo and name (left), EN/ES toggle (right). Hero: short headline "Gift cards for Cafe Luna" with a friendly subtext. Main: a responsive grid of available gift card products. Each product tile shows a branded card thumbnail, the card name, the price (fixed like "$25" or a range like "$10-$100"), and a "Buy" button in the merchant's brand color. Footer: merchant contact info and a subtle "Powered by Gifcards" line. No login required.
```

#### C2 — Gift Card Product Detail (`/:merchantSlug/:cardId`)

```text
Design a public gift card product detail page (web, responsive) for a merchant on Gifcards, white-label with the merchant's logo and brand color (placeholder "Cafe Luna"). Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Two-column layout: left, a large branded gift card preview; right, the product info — card name, description/message, and an amount selector. If fixed amount, show the price clearly; if variable, show a range slider plus an editable amount input with min/max validation hints. A prominent "Continue to checkout" button in the merchant's brand color. A trust footer with merchant contact and "Powered by Gifcards".
```

#### C3 — Checkout (`/checkout`)

```text
Design a guest checkout page (web, responsive) for buying a gift card on Gifcards, white-label for the merchant (placeholder "Cafe Luna"). No account required. Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Secondary #4F46E5, Text Secondary #6B7280.

Two-column layout: left, the form — buyer email input; a "Send as a gift" toggle that reveals recipient name, recipient email, and a gift message textarea; a terms link. Right, an order summary card: the branded gift card preview, the selected amount, the merchant name, and the total. A primary "Continue to payment" button in the merchant brand color. Show inline email validation. Keep it short and low-friction.
```

#### C4 — Payment (Stripe) (`/checkout/pay`)

```text
Design the payment step (web, responsive) for a Gifcards purchase using Stripe. Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Secondary #4F46E5, Text Secondary #6B7280, white-label merchant accent (placeholder "Cafe Luna").

Centered checkout card with a compact order summary at top (card name, amount, merchant). Below, a Stripe-style embedded payment form: card number, expiry, CVC, and name on card fields, plus a "Pay $25" primary button. Show a secure-payment note with a lock icon and "Payments secured by Stripe". Include a loading/processing state and an error retry state ("Payment failed, try again") with a link back to checkout.
```

#### C5 — Purchase Confirmation (`/checkout/success`)

```text
Design a purchase confirmation / success page (web, responsive) for Gifcards, white-label merchant accent (placeholder "Cafe Luna"). Background #FFFFFF, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Centered card: a large green #10B981 success check, "Your gift card is ready!" heading, and a short confirmation that a copy was emailed (note "Sent to buyer@example.com"). An order summary (gift card name, amount, merchant). A prominent "View your gift card" button and a secondary "Send another" link. Friendly, celebratory but clean.
```

#### C6 — Gift Card View (`/gift/:token`)

```text
Design a public gift card view page (web, responsive) accessed via a secure link, white-label with the merchant's logo and brand color (placeholder "Cafe Luna"). Background #FFFFFF, Accent #10B981, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Main: a large branded gift card visual; a prominent balance display (e.g. "$25.00"); a status badge; a QR code with the alphanumeric code below it and a "Copy code" button; a "Show QR fullscreen" button; and a "Usage history" list (each entry: amount redeemed, date, remaining balance). Merchant info footer.

Show these state variants clearly:
- Active: full balance, QR and code visible, green "Active" badge.
- Partially used: highlighted remaining balance, gray "Partially used" badge, history with prior redemptions.
- Redeemed (depleted): gray "Redeemed" badge, QR hidden, $0 balance.
```

#### C9 — QR Fullscreen (`/gift/:token/qr`)

```text
Design a fullscreen QR presentation mode (web/mobile) for showing a Gifcards gift card to be scanned in store. Minimal, high-contrast: a near-white background with a very large, crisp QR code centered, the alphanumeric code shown large below it, and the current balance above it. A small hint "Increase your screen brightness". A subtle "Swipe down to exit" / close affordance at top. No other chrome. Block/hide the QR with a message if the card status is redeemed, expired, or invalid.
```

#### C10 — Terminal / Error States (`/gift/:token` variants)

```text
Design a set of terminal-state pages (web, responsive) for a Gifcards gift card that cannot be used, white-label merchant accent (placeholder "Cafe Luna"). Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text Secondary #6B7280.

Centered card with a status illustration, a clear heading, a short explanation, and a "Contact merchant" button. Produce these variants:
- Redeemed: "This gift card has been fully redeemed."
- Expired: "This gift card has expired." with merchant contact.
- Invalid: a generic "This gift card link is not valid." (do not reveal fraud details).
- Payment failed: "Your payment couldn't be completed." with a #4F46E5 "Try again" button linking back to checkout.

Keep messaging calm and trustworthy.
```

