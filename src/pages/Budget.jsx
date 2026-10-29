import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Button, Eyebrow, Note } from '../components/ui.jsx'
import { breakdown, budgetLimits, presets } from '../data.js'
import { useApp } from '../state.jsx'

const fmt = (n) => `$${n.toLocaleString('en-US')}`
const round10 = (n) => Math.round(n / 10) * 10

export default function Budget() {
  const { budget, setBudget, stats, log, notify } = useApp()
  const navigate = useNavigate()
  const { min, max, step } = budgetLimits
  const pct = (v) => ((v - min) / (max - min)) * 100
  const noLimit = budget.preset === 'flexible'

  // Dragging a slider always switches to a custom range (audit fix H7):
  // the preset and the slider can never disagree.
  const setMin = (v) => setBudget({ ...budget, min: Math.min(v, budget.max - step), preset: 'custom' })
  const setMax = (v) => setBudget({ ...budget, max: Math.max(v, budget.min + step), preset: 'custom' })
  const pickPreset = (p) => setBudget({ ...budget, min: p.min, max: p.max, preset: p.id })
  const presetLabel = presets.find((p) => p.id === budget.preset)?.label

  // The estimate is the traveler's own range split by typical Barcelona-in-March shares,
  // so it moves with the slider. Bars show each category against the largest possible budget.
  const rows = breakdown.map((b) => {
    const low = round10(budget.min * b.share)
    const high = round10(budget.max * b.share)
    const mid = (low + high) / 2
    return { ...b, low, high, fill: Math.max(4, (mid / (max * b.share)) * 100) }
  })
  const label = (r) => (noLimit ? `${fmt(r.low)}+` : `${fmt(r.low)}–${fmt(r.high).slice(1)}`)

  const save = () => {
    setBudget({ ...budget, saved: true, skipped: false })
    log('marcus', 'set a private budget')
    notify('Budget saved. No one in the group can see your number.')
    navigate('/flight-preferences')
  }
  const skip = () => {
    setBudget({ ...budget, skipped: true, saved: false })
    navigate('/flight-preferences')
  }

  return (
    <Layout
      step={1}
      backTo="/availability"
      progress={{ done: stats.budgetDone, total: stats.total, label: 'have submitted a budget' }}
      actions={
        <>
          <Button variant="ghost" onClick={skip}>
            Skip for now
          </Button>
          <div className="action-bar__buttons">
            <Button to="/availability" variant="secondary">Back</Button>
            <Button onClick={save}>Save budget →</Button>
          </div>
        </>
      }
    >
      <Eyebrow>Your budget</Eyebrow>
      <h1>What's your budget for this trip?</h1>

      <Note>
        <strong>This is completely private.</strong> No one in the group ever sees your number. Romi uses it only to filter
        out options that don't work for you.
      </Note>

      <section className="range-card" aria-labelledby="range-label">
        <div className="range-card__head">
          <div>
            <p id="range-label" className="eyebrow">
              Your range{budget.preset === 'custom' ? ' · Custom' : presetLabel ? ` · ${presetLabel}` : ''}
            </p>
            <p className="range-card__value" aria-live="polite">
              {noLimit ? (
                'No limit'
              ) : (
                <>
                  {fmt(budget.min)} <span aria-hidden="true">–</span>
                  <span className="sr-only"> to </span> {fmt(budget.max)}
                </>
              )}
            </p>
          </div>
          {!noLimit && (
            <p className="range-card__mid">
              Mid-point <strong>{fmt(round10((budget.min + budget.max) / 2))}</strong>
            </p>
          )}
        </div>
        <div className="dual-range">
          <div className="dual-range__track" aria-hidden="true">
            <span style={{ left: `${pct(budget.min)}%`, right: `${100 - pct(budget.max)}%` }} />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={budget.min}
            onChange={(e) => setMin(Number(e.target.value))}
            aria-label="Minimum budget"
            aria-valuetext={fmt(budget.min)}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={budget.max}
            onChange={(e) => setMax(Number(e.target.value))}
            aria-label="Maximum budget"
            aria-valuetext={fmt(budget.max)}
          />
        </div>
        <div className="range-card__scale" aria-hidden="true">
          <span>$200</span><span>$700</span><span>$1.2k</span><span>$1.8k</span><span>$2.5k</span>
        </div>
      </section>

      <fieldset className="preset-group">
        <legend className="eyebrow">Or pick a preset</legend>
        <div className="chip-row">
          {presets.map((p) => (
            <label key={p.id} className="chip chip--stacked">
              <input type="radio" name="preset" checked={budget.preset === p.id} onChange={() => pickPreset(p)} />
              <span className="chip__label">{p.label}</span>
              <span className="chip__note">{p.note || `${fmt(p.min)}–${fmt(p.max).slice(1)}`}</span>
            </label>
          ))}
        </div>
        {budget.preset === 'custom' && (
          <p className="field__hint">Custom range selected. Pick a preset to replace it.</p>
        )}
      </fieldset>

      <section aria-labelledby="bd-label">
        <div className="split-head">
          <h2 id="bd-label" className="eyebrow">Estimated breakdown</h2>
          <p className="muted small">Barcelona, March 2026</p>
        </div>
        <ul className="breakdown">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="breakdown__name">
                <span className="breakdown__icon" aria-hidden="true">{r.icon}</span>
                <span>
                  <strong>{r.label}</strong>
                  {r.sub && <span className="muted small block">{r.sub}</span>}
                </span>
              </span>
              <span className="breakdown__bar" aria-hidden="true">
                <span style={{ width: `${r.fill}%` }} />
              </span>
              <strong>{label(r)}</strong>
            </li>
          ))}
        </ul>
        <p className="muted small">
          Based on your range and typical costs for Barcelona in March. Updates as you move the slider.
        </p>
      </section>
    </Layout>
  )
}
