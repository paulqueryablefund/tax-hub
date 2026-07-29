<!-- Value lever (K-3): VL-1 build credibility (the acceptance tallies and the defects caught by
     verification ARE the evidence for the 5/5 grounding-probe KPI) and VL-3 grounded honesty
     (pendings named, a wrong spec of mine recorded, the direction of error stated). Invisible
     when rendered; ships to docs/BUILD-METHOD.md in the public repository. -->

# How this was built

Claude Code drove the build in four gated stages. This file exists because the README makes a claim
about method, and a claim about method is worth nothing without the artifact behind it. What follows is
one stage's acceptance list reproduced as it was written **before** that build ran, together with what
it actually scored.

## The method in one paragraph

A target architecture was written and approved before any code changed, grounded in a full read of the
existing codebase and in an adversarial end-to-end review of the prototype that produced a ranked defect
list. Four build kits followed in dependency order — Truth, Intelligence, Comprehension, Credibility.
Each kit carried a falsifiable acceptance list with a named denominator, written before the build. Every
claim the build agent made was re-derived by querying the database or reading the generated source;
a claim was never accepted as evidence. Partial failures returned as delta kits, never as a re-sent kit.

## One specimen: the Truth layer's acceptance list

Fourteen criteria, pre-stated. Scored after the build by direct database query, not by reading the
build agent's report.

| # | Criterion | Result |
|---|---|---|
| A1 | Database provisioned; row-level security on every table | PASS — 22 tables, 0 without RLS |
| A2 | Real corpus seeded verbatim with working publisher URLs | PASS — 27 sources, 70 passages; random sample verified German, not paraphrase |
| A3 | Every citation resolves; orphans structurally impossible | PASS — 0 orphans across four citation tables |
| A3b | Flagship case cites the correct provisions; fabricated source gone | PASS — after a delta, see below |
| A4 | Recording an intake item survives a hard refresh | PASS |
| A5 | "Recorded but not evidenced" preserved with its value | PASS — exactly one such field, value intact |
| A6 | A broken citation renders visibly rather than silently vanishing | PASS by construction (composite foreign key) |
| A7 | Approve **and** reject gated server-side | PENDING — named, not counted green |
| A8 | Escalation changes visible ownership | PENDING |
| A9 | Reset is idempotent | PASS (existence); idempotency probe deferred |
| A10 | No route imports the old seed modules | PENDING — repo read deferred |
| A11 | The same approver is named on both screens | PASS |
| A12 | Freeze proof: zero diffs outside scope | PENDING |
| A13 | No new console errors | PENDING |
| A14 | Zero English text under any non-fictional source | PASS — heuristic proven live: the same sweep returns 7 rows under fictional sources |

**9 PASS · 5 PENDING · 0 FAIL.** The pendings are listed because a pending counted as a pass is how a
green tally becomes a lie. Each was closed later by a probe that could actually reach it.

## What the verification caught that the build report did not

These are the reason the method exists. Each was found by querying the database or reading the source,
after the build agent reported success.

1. **A placeholder impersonating real law, cited by the flagship case.** A source survived the corpus
   seeding marked as non-fictional, carrying the *same publisher URL* as the real statute source but with
   English paraphrase as its passage text — and the flagship case's citation pointed at it. Fixed by
   re-pointing the citation to the verbatim German passage, then deleting the impostor.
2. **A fabricated ministry letter.** A citation named a BMF-Schreiben dated 17 November 2023 with a
   constructed URL that returned 404. It did not exist. Traced, removed, replaced with the verified
   letter of 5 November 2021.
3. **A refusal threshold that could not fire.** The retrieval-stage refusal compared a rank-derived
   score against a floor that every returned passage already cleared by construction — so an uncovered
   question returned trigram noise instead of refusing. The root cause was conceptual: fusion scores are
   ordinal, and something always ranks first. Replaced with an absolute-relevance admission gate on each
   arm's raw score.
4. **A stored status that contradicted the evidence.** A view derived "approved" from a stored column
   rather than from an actual approval decision — the same stale-state pattern the first stage existed to
   remove. Rewritten to derive from a draft decision.
5. **A spec of mine that was wrong, and the build agent said so.** The kit demanded that request status
   be fully derived. The agent refused, correctly: four of six status values encode human workflow facts
   no query can reconstruct, and deriving them wholesale would have collapsed one state into another and
   broken the inbox filter. Its design — store the lifecycle marker, derive readiness — is better than
   what was specified. The refusal is recorded rather than quietly adopted.

## A note on the honest direction of error

The build agent's work was consistently better than its self-reporting. It substituted its own test
questions for two of three that were mandated, reported a security mechanism that was not the mechanism
doing the work, and described a seed-consistency fix as broader than it was. None of that was
detectable from its reports; all of it was detectable by querying. That is the whole argument for
verifying rather than reading.
