# Brief — Dr. Georges Sioufi, MD, FRCSC (relaunch)

Interviewed live with the site owner (Roger, on behalf of Dr. Sioufi's practice), 2026-09-02.

## The eight

1. **Vibe + references.** Warm, human, reassuring — leads with the person-first
   philosophy, approachable and calming for someone anxious about surgery,
   credentials present but not front-and-center. Reference given: Royal Pop
   (Audemars Piguet × Swatch microsite) — cited for its *modern, scrollable,
   interactive-but-simple* feel, not for its tone or subject (a luxury watch
   launch and a surgeon's practice are different registers, and the build
   respects that gap: no scarcity messaging, no marquee, no product-drop
   energy).
2. **Scroll journey, in the owner's words.** Home page becomes one continuous
   scroll: recognition of the doctor, his credentials landing, his philosophy,
   an invitation to book — then the practical substance (full training path,
   full expertise range, the three real clinics) underneath, reachable by a
   top-right jump index. About/Expertise/Contact stop being separate pages;
   their content moves into that same scroll.
3. **Energy curve.** Calm open, one clear rise into the credentials peak, a
   quieter human turn after it, a settled resolve at the close — not loud
   throughout, not flat throughout.
4. **Feeling, stage by stage, and the one moment.** See §Feeling curve and
   §Peak below. Chosen peak: *the moment his credentials land* (Montreal →
   Sacré-Cœur → Paris under Prof. Letournel → 30+ years, FRCSC) — the
   assembling sense that "this is a serious, highly trained surgeon."
5. **The one thing no other doctor's site does.** The goniometer arc already
   on the old site's hero (an angle-measurement instrument, standard
   orthopaedic exam tool) becomes the page's own scroll progress: a persistent
   gauge that sweeps and reads out in degrees as the visitor scrolls, so their
   own progress through the site is shown as a clinical measurement, not a
   generic progress bar.
6. **Aesthetic range.** Premium-minimal — restrained, editorial, generous
   whitespace, confident type. Reads as trustworthy and modern without trying
   hard.
7. **Structure: world or scenes.** One unbroken world (continuous flight),
   explicitly chosen over distinct cut scenes — but with a top-right index
   that lets the visitor jump section to section, because a world you cannot
   skip around in is a video, not a page (this is also what the continuous-
   world grammar's own nav rule requires).
8. **Assets on hand.** Real photography already exists and is the only
   photographic source used: hero-portrait, about-portrait, about-secondary,
   headshot-coat, headshot-grey, notes (hands writing a consultation note,
   Eiffel-Tower-stamped folder), consultation (doctor + patient), knee-exam.
   No photo of the doctor, a patient, or a clinic is generated. The only
   generated-in-the-sense-of-authored assets are hand-drawn SVG line art (the
   goniometer mechanism itself, and small joint/anatomy motifs on the
   expertise cards) — vector, coded directly in the page, free, no API, no
   key. This was a deliberate substitution after the owner asked for the
   "extra stuff" (e.g. a knee visual) but for free: kie.ai generation was
   ruled out as soon as "free" was stated, and hand-authored SVG was offered
   and accepted in its place.

## Structural resolution (not asked verbatim, decided from the above)

The continuous-world grammar (uniqueness.md §2.4) requires worldflight mode:
one fixed stage, legs that crossfade, nothing in document flow but the spacer.
Its standard form chains *generated video* legs. That is incompatible with
"real photos only" + "free." Resolution used here, and it is a supported
engine path, not a workaround: worldflight legs with **no `<video>`**, poster-
only. The engine already treats a clipless leg's poster as the whole leg for
its entire life (continuous slow push-in, opacity crossfade at the seams,
full reduced-motion parity because reduced motion is poster-only for every
build anyway). Four real photographs become four legs of one flight. Zero
video, zero generation spend.

The dense reference content this practice actually needs — three clinics with
real addresses and phone numbers, hours, directions links, hospital
affiliation, the full training timeline, six expertise areas, the legal/
emergency disclaimer — does not belong inside a fixed cinematic world where a
patient has to time a click against a moving camera. That content lives in
ordinary document flow *after* the world's spacer ends, on an opaque "paper"
surface with its own higher stacking context so it visibly lands on top of
and occludes the fixed world once scrolled into view. The world carries the
story (arc 1); the flow section carries the substance (arc 2). This is the
"world vs. scenes" answer applied literally: one unbroken world for the part
that is actually a journey, ordinary sections for the part that is actually a
reference document.

## Journey (beats)

1. Recognition — his face, his name, the practice, calm.
2. Confidence (**peak**) — his training assembles, one institution at a time.
3. Warmth — the human-first philosophy, stated plainly.
4. Readiness — arrival, the phone-booking invitation.
5. Substance — the full training path and the full range of expertise, laid
   out for anyone who wants to verify rather than take it on faith.
6. Action — the three real clinics, hours, directions, hospital affiliation,
   the emergency disclaimer.

## Feeling curve

```
1  Calm / recognition     his portrait held long enough to actually look at him,
                          name and credential line arriving already lit (greet),
                          nothing else competing for attention
2  Held quiet             (authored silence) the hero copy settles and empties
                          for a beat before anything new arrives — the intake
                          breath before the peak, not a loading gap
3  Awe / confidence        [PEAK] four training milestones land one at a time —
                          Montreal, Sacré-Cœur, Paris under Prof. Letournel,
                          30+ years & FRCSC — against his own steady portrait
4  Relief / warmth         the frame turns human: doctor and patient talking,
                          the pull-quote lands ("the whole person, not just
                          the condition") after the technical high
5  Resolve                his arrival portrait, settled and direct, the phone-
                          booking line as the world's own closing object
6  Trust (verification)   the training path and the full expertise range,
                          unhurried, laid out as something to check rather
                          than something to be sold
7  Certainty               three real clinics, real numbers, real hours — the
                          page ends on the thing a patient actually needs
```

Two adjacent emotions never repeat. The authored silence (state 2) is
deliberate: it is there so the credentials leg has something to be a change
from, and the verification pass should read it as intended quiet, not as dead
scroll.

## Peak

> His training lands on the screen one line at a time — Montreal, then
> Sacré-Cœur, then Paris under a surgeon who wrote the book on pelvic
> trauma — and by the time it stops you already know this isn't a general
> practice.

Lives in leg 2 of the world ("Credentials"). Gets the largest `data-sc-w` on
the page, the calmest/cleanest portrait (grey backdrop, nothing in the
background competing with the text), and the silence in the act before it.

## Tell-someone sentence

> It's the site where a little angle gauge in the corner fills up as you
> scroll, like it's reading a knee's range of motion, and it's most of the
> way through its sweep exactly when his training, Montreal, Paris, thirty
> years, lands in front of you one line at a time.

The signature move (angle gauge as scroll progress) and the peak (credentials
landing) are the same moment by construction, not two competing hooks: the
gauge's fill is a function of total scroll, and the credentials leg owns the
largest single share of the track, so most of the gauge's visible sweep
happens while the credentials are landing.

## Grammar chosen, and why the other seven lost

**Continuous world** (uniqueness.md §2.4), via worldflight, poster-only legs.

- *Filmic one-shot* — the default drift, and the one every prior fingerprint
  row would have used. The owner explicitly asked for one unbroken world
  rather than a linear act sequence; filmic one-shot is acts.
- *Chaptered editorial* — closest runner-up (this page does have a long-form
  half), but its hero must be a paper title page with no media above the
  fold, which contradicts "recognition of the doctor's own face first."
  Used instead as the *register* of the flow section below the world, not as
  the page grammar.
- *Live surface* — no software to operate; this is a person and a practice.
- *Typographic poster* — real, strong photography exists; using type-only
  would throw it away.
- *Gallery/catalog* — the expertise areas are a range, but the page's spine
  is trust in one surgeon, not browsing a collection; catalog forbids the
  single hero claim this brief's peak depends on.
- *Split stage* — no two-sided argument here.
- *Rhythmic cutlist* — wrong energy entirely; this is a reassurance brief,
  not a pulse brief, and cutlist bans the long pinned dwell the peak needs
  (moot here since the peak lives in a world leg, not an act, but the energy
  mismatch alone rules it out).

## Authored silence

Confirmed above: the gap between the hero leg's copy fading and the
credentials leg's first line arriving is deliberate quiet, not dead scroll.
The verification pass should treat a stretch of "world is moving, no copy
visible" there as intended.

## Imagery

Real photographs only, all already owned by the practice:
`hero-portrait.jpg`, `about-portrait.jpg`, `about-secondary.jpg`,
`headshot-coat.jpg`, `headshot-grey.jpg`, `notes.jpg`, `consultation.jpg`,
`knee-exam.jpg`. World legs use hero-portrait (recognition),
headshot-grey (credentials — cleanest background for the text-heavy peak),
consultation (philosophy — a real conversation, not a posed portrait),
about-portrait (arrival). The remaining four illustrate the flow section
below (training path, expertise, in-practice detail). No image is generated.
Supporting line-art (the goniometer mechanism, small joint motifs on the
expertise cards) is hand-authored SVG, coded in the page, at zero cost.
