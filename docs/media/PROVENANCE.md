# Visual Media Provenance — Portfolio Phase 4

Updated **2026-11-02**. Public images are committed only when they can be attributed to genuine application UI or are clearly labeled original conceptual illustrations.

## Real UI screenshots: Trading Radar

Three verified, real screenshots were generated from the *actual public React/Vite frontend*, not from AI image generation or a mockup.

- **Frontend source:** [Gule7309/trading_radar](https://github.com/Gule7309/trading_radar/tree/985351296d4d0c1225121be03e31aa115f003769/apps/web)
- **Frontend commit:** `985351296d4d0c1225121be03e31aa115f003769`.
- **Mock backend:** public branch `feat/b-agent-mvp`, commit `a8cd0261455c178159765d691d9b35d3e57e51f2`.
- **Capture environment:** GitHub Actions Ubuntu runner, Node 22, Noto CJK font, Chrome headless, `http://localhost:5173` with mock API at `127.0.0.1:8787`. The frontend explicitly displays **Mock 示範環境** or **UI 測試資料**.
- **Source capture run:** [GitHub Actions #41374780208](https://github.com/Gule7309/yuhisang.lo/actions/runs/41374780208).
- **Safety:** No real brokerage session, proprietary tokens, account data, investment returns or actual research performance are implied or included.

| Committed asset | Authentic content | Intended use |
| --- | --- | --- |
| `assets/projects/trading-radar-dashboard-demo.png` | Desktop selection/research dashboard with public **mock** data; 1440×960 | Case-study cover, thumbnail, gallery |
| `assets/projects/trading-radar-dashboard-mobile-demo.png` | Same responsive dashboard on 430×920 mobile | Case-study gallery |
| `assets/projects/trading-radar-detail-ui-test.png` | Actual `/design-qa?data=demo` UI stress-test screen (fixtures explicitly labeled) | Secondary case-study gallery only |

**Do not describe these as a deployed trading product or a validated financial research outcome.** They demonstrate the working frontend and responsive layout under test data.

## Original research schematics (not screenshots)

| Asset | Basis | Honest interpretation |
| --- | --- | --- |
| `assets/figures/when2ask-intervention-plan.svg` | [When2ask experimental design](https://github.com/Gule7309/When2ask/blob/main/docs/experiment_plan.md) | Original, editable *planned intervention* schematic. Natural / Oracle-complete / Forced-miss are experimental conditions, not observations or results. |
| `assets/figures/authority-aware-framing.svg` | Portfolio's thesis concept and the existing Authority-Aware research description | Original conceptual research problem framing, **not** a validated model, decision policy, or implemented system. |

Both SVG assets were drawn from code, authored for this portfolio, and do not reproduce third-party paper figures or depict measured results.

## Intentionally not published

- **PixelFit:** the user reports an internal Android testing build, but this repository does not have a verified, permission-cleared screenshot. No mockup is substituted.
- **Tavi:** source and design docs exist in a private repository but no public UI capture was independently verified. No guessed screenshots are published.
- **GPTL:** screenshot access and public asset rights are not verified; illustration skipped.
- **VR Dementia:** no validated, approved UI screenshot in the portfolio's accessible public materials.
- **When2ask:** no numerical plots or purported research-result graphs are included before actual benchmark evaluation.

## Editorial constraints

1. Every display has bilingual captions differentiating actual UI with mock data, planned research schematics, and empirical results.
2. Real screenshots can be added through CMS only with authorization to share and the correct media context.
3. Filenames in CMS must point to existing images under `assets/` (or valid public HTTPS images); CI checks local files.
4. Never add private-user or test-account credentials, private logs, internal business data, or misleading stock predictions.
5. Do not auto-refresh screenshots from mutable third-party branches without a new provenance review.
