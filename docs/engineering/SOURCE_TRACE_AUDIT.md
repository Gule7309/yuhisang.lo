# Source Trace Audit — Phase 7

Date: **2026-11-02**. This ledger distinguishes **public source-code implementation evidence** from empirical evaluation, reproduction, production reliability and authorship claims.

## Immutable source snapshots

The code excerpts in `content/works.json` were taken directly from the public source repository files, on their recorded source revisions. The excerpt lines match the exact `#Lx-Ly` range and are displayed verbatim; no source code has been rewritten to look more convincing.

### Trading Radar — team-owned prototype

- [Screening fingerprint, lines 101–107](https://github.com/Gule7309/trading_radar/blob/985351296d4d0c1225121be03e31aa115f003769/packages/taiwan_data/src/taiwan_data/screening/api.py#L101-L107): includes as-of date, market periods, configuration, profile and data version in a SHA-256 hash. Demonstrates version-aware run inputs, **not** continuous data freshness or production uptime.
- [Evidence aggregation, lines 75–85](https://github.com/Gule7309/trading_radar/blob/a8cd0261455c178159765d691d9b35d3e57e51f2/src/evidence/verification-pipeline.ts#L75-L85): conflicting SUPPORTED / REFUTED verdicts produce CONFLICTING. Code exists in a separate public Agent/Evidence branch; **not** evidence of a validated truth-detection rate.
- [Publication gate, lines 149–159](https://github.com/Gule7309/trading_radar/blob/a8cd0261455c178159765d691d9b35d3e57e51f2/src/harness/publication-gate.ts#L149-L159): unresolved HIGH conflict prevents publication. This is a source-backed deterministic guard, **not** a regulatory audit, stock recommendation or proof the entire team system is live.

The system was developed in a team context. Portfolio language describes the repository and mechanisms without claiming the page owner wrote every part. Do not upgrade these excerpts into individual authorship assertions without verified contributor provenance.

### When2ask — independent research-in-progress reconstruction

- [Oracle-complete, lines 23–30](https://github.com/Gule7309/When2ask/blob/320fd61fcae47a566948feaeee48a44efda15567/src/when2ask/interventions.py#L23-L30): include a ground-truth-compatible candidate if absent. A planned controlled intervention.
- [Forced-miss, lines 38–50](https://github.com/Gule7309/When2ask/blob/320fd61fcae47a566948feaeee48a44efda15567/src/when2ask/interventions.py#L38-L50): remove compatible options, optionally replace with an incompatible option. A planned controlled intervention.
- [Pre-question threshold, lines 33–41](https://github.com/Gule7309/When2ask/blob/320fd61fcae47a566948feaeee48a44efda15567/src/when2ask/decision.py#L33-L41): select EXECUTE vs NEEDS_QUESTION_SCORING. The latter is **not** a final ASK decision. This reconstructed stage does **not** implement full response-weighted EVPI or prove SAGE-Agent reproduction.

This is the user's independently developing reconstruction of ideas from Suri et al. (ACL 2026), **not the original authors' repository or the user's peer-reviewed publication**. The research detail must keep `publication_status=work_in_progress` until genuine publication evidence is provided.

## Privacy and verification boundaries

- **PixelFit remains private:** no file names, credentials, code excerpts or private source links have been added to the portfolio through this phase.
- A code line is not an experiment result. No benchmark accuracy, user-study result, revenue, investment performance or significant improvement is inferred.
- Local generator tests enforce HTTPS GitHub immutable commit URLs, exact line-count consistency, HTML escaping, excerpt length and conservative omission of invalid entries. They do **not** refetch external GitHub files when a later CMS edit is saved.
- Editors must manually compare each new excerpt with the linked source commit and update both language descriptions. The source code and version may evolve while a pinned permalink remains stable.
- The CMS saves content to a **public** repository, even for items hidden on the site. Never paste private source code or data there.
