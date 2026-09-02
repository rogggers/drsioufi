# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| drsioufi (Dr. Georges Sioufi, orthopaedic surgeon) | Continuous world (worldflight, poster-only legs — no video, no generation) | Top-right toggleable index panel, doubling as the signature gauge; waypoints for the 4 world legs + IntersectionObserver for the flow sections below | 4 real photographs as worldflight legs (no scrub, no kinetic) — recognition leg greets on load | 1 continuous world (4 legs, 6.1vh) → 3 ordinary flow sections (about/expertise/contact) on an inverted light "paper" ground with higher z-index, occluding the fixed world once scrolled past | World's own finale copy window resolves with a real tel: CTA + secondary anchor link; page then continues into a conventional footer with full clinic/legal detail | A goniometer (angle-measurement instrument) reading whole-PAGE scroll progress in degrees (0-140°), needle rotation + ring fill, doubling as the nav toggle | Natural/documentary — real practice photography, no generated imagery at all | Static site (no framework), vanilla HTML/CSS/JS |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Continuous-world grammar built from poster-only worldflight legs (no video/generation) — free to reuse the *technique*, but a close reread of a real photographic subject the same way would collide on world + hero device.
- A world that hands off to ordinary flow content below it via z-index occlusion (world = story, flow = reference substance) — this hybrid structure is now a claimed shape.
- Scroll-progress-as-a-real-instrument-reading (degrees on a goniometer) as a signature move.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
