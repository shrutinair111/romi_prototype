# Romi · Clickable prototype (v3)

A clickable, coded prototype of Romi's organizer and traveler flows, built from the v2 Figma file after a WCAG 2.1 AA and Nielsen heuristic audit.

| Flow | Screens |
| --- | --- |
| A · Organizer onboarding | Welcome → Trip basics → Dates → Add travelers → Planning tools |
| B · Traveler onboarding | Join → Availability → Budget → Flight preferences |
| C · Organizer coordination | Travelers → Date heatmap (lock dialog) → Flight packages → Traveler flight approval |
| D · Command center | Trip overview dashboard |

Open `#/screens` for an index of every screen. Both sides share one live store: answer availability as Marcus and the organizer's date heatmap updates. Refresh to reset. Demo trip code: **BCN2026**.

## Run it locally (Cursor or any editor)

```bash
git clone https://github.com/shrutinair111/romi_prototype.git
cd romi_prototype
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173). In Cursor: **File → Open Folder**, pick `romi_prototype`, then run the commands above in Cursor's terminal.

## Live link

Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.
Turn it on once: repo **Settings → Pages → Source: GitHub Actions**. The site appears at
`https://shrutinair111.github.io/romi_prototype/`.

## Project map

| File | What it is |
| --- | --- |
| `src/data.js` | Single source of truth for the scenario (people, date windows, flight packages). Change data here, not in screens. |
| `src/state.jsx` | One store for both flows; organizer counts are derived from travelers' answers. |
| `src/components/Layout.jsx` | Traveler shell: sidebar + stepper, mobile top bar + sticky action bar. |
| `src/components/WizardLayout.jsx` | Create-trip wizard shell with locked/completed steps. |
| `src/components/OrgLayout.jsx` | Organizer workspace shell: trips sidebar, mobile tab row. |
| `src/components/ui.jsx` | Logo, Button, accessible Dialog (focus trap, Esc), Toast with Undo, InfoTip, Switch. |
| `src/components/NudgeDialog.jsx` | Editable nudge preview before anything is sent. |
| `src/pages/*.jsx`, `src/pages/org/*.jsx` | One file per screen. |
| `src/index.css` | Design tokens and styles. Every text color passes AA (ratios noted in the tokens). |

## Accessibility decisions (from the audit)

- **Privacy that matches the promise (C1):** the traveler UI only promises what organizer screens actually show (counts and arrival times, never names, costs or origins).
- **One consistent scenario (C2):** Mar 14–21, 7 nights; Package A lands 8:35–9:50 AM; Marcus flies IB 6252 via MAD.
- **Error prevention (C3, WCAG 3.3.4):** "Approve this flight" opens a confirmation with total, payment and refund policy, plus a 10-minute undo.
- **Contrast (C4, H1, H3):** text tokens at 4.5:1 or better, control borders at 3:1.
- **Mobile (C5, WCAG 1.4.10):** responsive down to 320px, 44px targets, bottom-sheet dialog, sticky action bar.
- **Real form semantics (H4, H5):** labelled inputs, fieldset/legend radio groups, inline errors with icon + text, visible focus rings.
- **Preset and slider stay in sync (H7):** dragging the budget slider switches to a custom range.
- **SPA focus management:** each step moves focus to its heading; the dialog returns focus to the button that opened it.

The Romi logo files in `src/assets/` are exported from the Figma file (light and dark versions).
