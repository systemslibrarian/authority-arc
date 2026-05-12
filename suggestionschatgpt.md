# Suggestions from ChatGPT

> **Status (2026-05-12):** Items below are annotated with their landing PR.
> - **PR #1 — `a11y-mobile-pass`** *(merged)*: WCAG 2.1 AA / mobile pass.
> - **PR #2 — `stage1-depth-and-progress`** *(open)*: Stage 1 depth, progress framing, additional a11y polish.
>
> Legend: ✅ done · ◐ partial · ⏭ deferred (intentionally out of scope so far).

## Overall opinion

The Authority Arc already has something most educational apps do not: a real point of view. The writing is strong, the premise is serious, and the visual direction feels authored instead of templated. That matters.

Right now, though, it feels more like an exceptional Stage 1 experience inside a larger promised product than a fully realized five-stage app. I would rate it as a very strong concept with excellent craft, but not yet a complete 10/10 application.

If the goal is a true 10/10, the next step is not cosmetic refinement first. The next step is making the product promise materially true, then tightening mobile and accessibility until the whole experience feels deliberate under pressure.

## What is already working

- The voice is distinctive and memorable.
- The visual system avoids generic SaaS design and feels like a museum placard or archival exhibit.
- Stage 1 has real intellectual substance instead of empty interaction.
- The honest-capability framing builds trust.
- The site already shows stronger taste than most educational demos.

## What keeps it from being a 10/10

### 1. The app promise is bigger than the shipped product

The landing page promises a five-stage arc, but only one stage is fully alive. That creates a gap between narrative ambition and product reality. A 10/10 app cannot mostly be roadmap.

### 2. The best interactive is still too shallow

The resolver is good, but it should reward deeper exploration. Right now it teaches. It should also invite play, comparison, and re-use.

### 3. Mobile needs harder product decisions

The app is visually responsive, but “mobile-friendly” at a 10/10 level means more than stacking layouts. It means obvious touch targets, scroll affordances, calmer density, and faster comprehension on a small screen.

### 4. ADA/accessibility is good in intent, not yet fully rigorous

There are clear accessibility instincts in the codebase, but a truly ADA-friendly app needs stronger interaction patterns, more explicit focus management, better form feedback, and routine testing against screen readers and keyboard-only use.

### 5. Product scaffolding is still light

There is not yet enough retention structure around the experience: progress cues, shareable states, glossary support, and clearer bridges for different audience types.

## What I would do next

### Priority 1: Finish Stage 2 for real

If I had to pick one thing, I would build Stage 2 into a serious, usable experience before polishing the rest. That is the cleanest way to make the app feel like a product instead of an elegant preview.

- ⏭ **Stage 2 build** — deferred. Real disambiguation needs VIAF AutoSuggest wiring, a contested-cluster walkthrough, and side-by-side record voting. That is a project, not a polish pass; slotting it into a single PR would mean shipping it half-done.

### Priority 2: Deepen Stage 1 interaction

I would add:

- ✅ **Shareable URLs for a resolved curator and identifier.** *(PR #2)* — `/identify?curator=LC&id=n79018049` loads that record directly; the form updates the URL via `router.replace` on every resolve, back/forward navigation re-resolves.
- ✅ **Copy actions for IDs and canonical URIs.** *(PR #2)* — `CopyButton` next to the canonical URI and the identifier, with transient "copied" state.
- ⏭ **Better example flows, including one or two curated "interesting failures."** — not yet. The chip set is still success-only; a curated failure (e.g., a deprecated/redirected cluster, a known split) is a content task on its own.
- ✅ **More obvious distinction between live upstream data and fixture fallback.** *(PR #2)* — prominent provenance pill ("Live · VIAF" / "Fixture fallback") at the top of the resolved card, with a tooltip explaining the difference. Live region announces it too.
- ✅ **A stronger default loaded state so the page never feels blank.** *(PR #2)* — the identify page server-seeds the resolver with the bundled Stephen King fixture; the page is filled in on first visit.

### Priority 3: Do a serious mobile pass

I would review every page at narrow widths and improve:

- ✅ **Tap target size and spacing.** *(PR #1)* — `.tap-target` utility (44px min-height), full-width submit on mobile, larger chip spacing.
- ✅ **Horizontal nav affordance.** *(PR #1)* — strip nav stacks (brand row + horizontally scrollable stages) below `sm:`.
- ◐ **Long-form reading rhythm.** *(PR #1)* — heading sizes, line-height, and padding scaled down on mobile via `clamp()` + `sm:` breakpoints. The drop-cap and figure block could still be tuned further.
- ✅ **Overflow behavior for code and identifier content.** *(PR #1)* — `break-all` on URI/ID strings, `overflow-x-auto` on the wire-view `<pre>`, stacked `Field` rows on mobile so 140px label gutters don't crush content.
- ◐ **Whether the most important action is visible without hunting.** *(PR #1 + PR #2)* — hero/section padding tightened on mobile so the resolver lands closer to the fold; seeded state means it's also useful before you scroll. Could be tightened further.

### Priority 4: Tighten accessibility end to end

I would specifically improve:

- ✅ **Focus placement when opening and closing annotations.** *(PR #2)* — close button + Escape close annotations; `aria-expanded` / `aria-controls` wire trigger to panel.
- ✅ **Restoration of focus to the trigger after close.** *(PR #2)* — `triggerRef` captures the opening button at click time; `requestAnimationFrame(el.focus())` restores focus when the panel unmounts.
- ✅ **Clearer form errors and field-level guidance.** *(PR #2)* — empty curator/id sets `aria-invalid`, wires `aria-describedby`, and renders an inline `role="alert"` message under the field. Errors clear as the user types.
- ✅ **`aria-busy` and more robust live status behavior during resolution.** *(PR #1 + PR #2)* — `role="status" aria-live="polite"` region announces outcomes (PR #1); `aria-busy` on the form during resolution (PR #2); the announcement now names the provenance too.
- ⏭ **Automated accessibility checks in the test suite.** — not yet. Adding `vitest-axe` or `@axe-core/playwright` is worth doing but is its own setup task.

### Priority 5: Add product framing around the learning path

I would add:

- ⏭ **A glossary for domain terms.** — deferred. This is a content-authoring project (curator, cluster, MARC, FAST, LCNAF, ISNI, VIAF, etc.) and deserves its own sprint.
- ✅ **Progress indicators across stages.** *(PR #2)* — eyebrows now read "§ 0X of 05 — Stage X · …"; landing intro gets a "● 1 of 5 live" chip.
- ⏭ **Better onboarding for engineers unfamiliar with library metadata.** — deferred. Partially addressed by the existing essay copy and Honest Capability framing, but a dedicated "for engineers" on-ramp is a separate piece.
- ◐ **Stronger metadata and social sharing presentation.** — base `<title>` template, OpenGraph metadata, and `metadataBase` already in `app/layout.tsx`. Per-stage OG images and Twitter card art still TODO.
- ✅ **A more explicit reason to continue from one stage to the next.** *(PR #2)* — new "Continue to Stage 2" museum-placard callout card above the identify footer, explicitly framed against what just happened in Stage 1.

## Bottom line

My opinion is that this is already unusually good work. The design has taste, the writing has conviction, and the subject matter is handled with seriousness. What it needs now is not more ornament. It needs product completion, deeper interaction, and stricter mobile and accessibility discipline.

That is what would make it feel like a 10/10 app instead of a beautifully executed first chapter.