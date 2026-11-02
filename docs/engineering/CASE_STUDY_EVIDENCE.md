# Evidence ledger — Engineering case studies

Updated: **2026-11-02**. This public ledger records *what source supports each displayed engineering claim* and **what it does not establish**. It does not copy source secrets, credentials, private configuration, financial statements or model-generated market recommendations. The portfolio's `content/works.json` remains the single source of displayed EN/zh-Hant prose.

## Scope and rendering

- Technical sections are CMS-driven: `architecture_layers`, `engineering_decisions`, `verification_evidence`, plus bilingual architecture context.
- They are shown only on existing product case studies, not on academic Research pages. Missing content gracefully omits the sections.
- Architecture stage tags reflect evidence for a selected component, **not** a completeness statement about product deployment. Evidence status is one of `verified` (specific controlled tests), `limited` (partial data), or `pending` (unverified).
- Rendering escapes HTML; evidence URLs are checked by the pre-existing HTTPS-only link function. Data under `content/works.json` is publicly visible even when CMS marks an item hidden.

## PixelFit (personal project; private development source)

Sources checked in the owner's **private** development repository, branch `codex/pixelfit-data-foundation` as of 2026-11-02. Filenames are provenance references for the owner, **not published source links**. No private repository URL is exposed in the case-study UI.

| Portfolio claim | Development record | Exact meaning / limitation |
| --- | --- | --- |
| React/Capacitor browser and Android Preview UI | `docs/pixelfit/ANDROID_UX_BATCH10.md`, `ANDROID_DEVICE_QA.md` | Browser QA and separately installed Android Preview; displayed images do **not** come from Android device capture |
| Immediate local edits, reliable checkpoint, revision-aware save queue | `docs/pixelfit/LATENCY_AND_CLOUD_BATCH12.md`, `IMPLEMENTATION_STATUS.md` | Local controlled tests cover coalescing and failure conditions; the 100ms interactive goal was **not** a measured device p95 |
| IndexedDB outbox, immutable submissions and server-owned daily growth receipts | `docs/pixelfit/IMPLEMENTATION_STATUS.md`, `CLOUD_BACKEND_BATCH13.md` | Controlled backend/Emulator and cloud-beta configuration; does not imply production-scale usage |
| Isolated beta auth/data boundary, signed release preparation | `docs/pixelfit/CLOUD_BACKEND_BATCH13.md`, `PLAY_RECOVERY_BATCH17.md`, `PLAY_RELEASE_READINESS.json` | Deployment and release-gate preparation recorded; no verified *public Play Store launch* or full Android lifecycle QA |
| Four authentic development screenshots | `docs/pixelfit/ANDROID_UX_BATCH10.md`, `PET_ACCOUNT_BATCH11.md` | 393px packaged web browser QA with synthetic test data, not real-user fitness or retention metrics |

**No measured production conversion, growth, revenue, speed or uptime claim is included.** Public release and Play Console status must be reconfirmed before being described as current.

## Trading Radar (team prototype; public repo)

Public sources:

- [Project overview](https://github.com/Gule7309/trading_radar/blob/main/README.md)
- [Data layer and source datasets](https://github.com/Gule7309/trading_radar/blob/main/docs/data/README.md)
- [Frontend workbench and API behavior](https://github.com/Gule7309/trading_radar/blob/main/docs/FRONTEND_SETUP.md)
- [Specific frontend and mock API checks](https://github.com/Gule7309/trading_radar/blob/main/docs/FRONTEND_VALIDATION.md)
- [Bounded live connection and known gaps](https://github.com/Gule7309/trading_radar/blob/main/docs/LIVE_DEMO_SETUP.md)

| Portfolio claim | Supporting source | Exact meaning / limitation |
| --- | --- | --- |
| Official Taiwan market data + SQLite CLI; candidate provenance and dates | Data README, Live Demo Setup | Dated and versioned snapshots exist; no assertion of continuously current data |
| Agent/Evidence branch and publication gate | README, Live Demo Setup | A separate workstream and a bounded integration run; not yet a production-quality autonomous trader |
| React workbench, candidate comparison, evidence/risk, feedback and versioned thesis | Frontend Setup + Validation | Certain flows verified with a mock API; **mock screenshots are not empirical stock research evidence** |
| One bounded October 14 live research run | Live Demo Setup | A two-candidate run reached a publication/evidence split and surfaced one 404 source link; not an accuracy, cost, backtest, real-world ROI or reliability study |
| Automatic refresh/recheck and investor outcomes | Frontend Validation + Live Demo Setup | **Not validated**; the workbench must not imply fresh market results, automated full coverage, or investment performance |

All evidence source URLs in the live portfolio should be public HTTPS. The source repo is team-authored, so the case study presents a **team system architecture** rather than attributing all modules or individual code contributions to the portfolio owner.

## Verification checklist for editors

1. Before changing any evidence status to `verified`, record the exact test/setup/date and distinguish a mock from live data.
2. Do not publish personal user metrics, account IDs, stock decisions, credentials, private repo links or local database file contents.
3. Each English statement needs a corresponding Traditional Chinese explanation with the **same evidence boundary**.
4. The portfolio's CI verifies rendering, status enum handling, safe links and responsive screenshots; it **does not** re-run either product's private backend or validate financial recommendations.
5. Any stronger claims require new source evidence and an explicit update to this ledger.
