# When2ask Phase-0 evidence ledger — executed, NOT empirical

**Date:** November 2, 2026.  
**Scope:** Only the When2ask research note on the personal portfolio. The result is an executed fixed-response **synthetic mechanism audit**. It is **not** a ClarifyBench experiment and cannot establish H1–H4 or publication status.

## Source and integrity

- Public independent-reconstruction source, still in [Draft PR #1](https://github.com/Gule7309/When2ask/pull/1).
- [Executed Actions run #41459465082](https://github.com/Gule7309/When2ask/actions/runs/41459465082), with independently passing `pytest` and `synthetic_replay` CI jobs.
- [Original JSON artifact #13147204648](https://github.com/Gule7309/When2ask/actions/runs/41459465082/artifacts/13147204648), retained by GitHub Actions for 30 days.
- Source at exact tested revision: `ab0cd26da17ff63d300080811500fe87fe0f95a6`.
- The exact, byte-for-byte original JSON is preserved as `content/experiments/when2ask_synthetic_audit.json` in this site (2572 bytes); **SHA-256**: `cf50484680e63bd7c845653451c2019e9ae45b8c87cc31bbcd9a492b11428dd8`; Git blob SHA-1: `f86ee9f9f59c2a083a3c21af4720a99033e37389`.
- The site generator recomputes SHA-256 and verifies `empirical=false`, schema, source repository/commit, 0 benchmark items, 0 model calls, 0 tool executions, and the four typed condition records before rendering. Malformed or mismatched data fails closed (no experimental section or TOC link).
- The source-repo CI is the actual execution environment; this site does **not** execute When2ask nor re-evaluate model performance during a static build.

## Exact, narrow outcome

| Item | Recorded value | Interpretation |
| --- | --- | --- |
| Synthetic decision points | 1 | Single fixed example for reproducibility / code readiness |
| Benchmark items | 0 | Cannot estimate task success or statistical uncertainty |
| Model calls / real tools | 0 / 0 | Original model responses replayed from checked-in JSON |
| Replay action | ASK | One reconstructed decision plan; no real cancellation |
| Raw viability | 0.5 | A constrained reconstruction score |
| Normalized share | 1.0 | Share relative to the *generated candidate set*, not calibrated execution probability |
| Natural / Oracle-complete | Candidate present / present | Oracle-complete no-ops when GT already represented |
| Forced-miss / Oracle recovery | Candidate absent / present | Structural intervention functions change GT coverage as designed |

The Forced-miss decoy and Oracle-recovery changes are not fully matched on unresolved argument patterns / set size, and **do not rerun downstream SAGE inference**. No accuracy, HCWE, calibration, causal effect, confidence interval, full EVPI, or original-paper reproduction result is claimed.

## How editors update this evidence

- Keep raw metrics in the JSON file, not CMS text. A replacement requires a **new real CI run**, audit of its exact bytes, verified source commit and result scope, updated SHA-256 in the corresponding `content/works.json` entry, and reviewed claims.
- CMS can edit the English/Chinese **interpretation** and the run/artifact references, but cannot fabricate benchmark performance through those fields. The static parser rejects results with `empirical=true` under the synthetic-only schema.
- The `docs/ui/phase8-qa.md` report tracks actual responsive QA and remaining limitations. Keep the research status `work_in_progress`.
- A future *real* experimental-results panel must have a **separate schema and validation gate** with dataset SHA, reproducible prompts/model versions, paired intervention execution, and uncertainty estimates. Do not relabel this panel as a benchmark to bypass that requirement.
