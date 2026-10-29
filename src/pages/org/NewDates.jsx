import { useNavigate } from 'react-router-dom'
import WizardLayout from '../../components/WizardLayout.jsx'
import { ErrorText, Eyebrow, Note } from '../../components/ui.jsx'
import { constraintsList, dateModes, durations } from '../../data.js'
import { useApp } from '../../state.jsx'
import { BoardingPreview } from './NewBasics.jsx'

const parse = (s) => (s ? new Date(`${s}T12:00:00`) : null)
const fmt = (d, opts) => d?.toLocaleDateString('en-US', opts)
const MONTHS = ['March 2026', 'April 2026', 'May 2026', 'Spring 2026', 'Summer 2026']

// TM-03 · Dates & duration
export default function NewDates() {
  const { draft, setDraft } = useApp()
  const navigate = useNavigate()
  const start = parse(draft.start)
  const end = parse(draft.end)
  const days = start && end ? Math.round((end - start) / 86400000) : 0
  const invalid = draft.dateMode === 'specific' && start && end && days <= 0
  const dur = durations.find((d) => d.id === draft.duration)
  const checked = constraintsList.filter((c) => draft.constraints[c.id])
  const passing = Math.max(1, 12 - checked.reduce((n, c) => n + (12 - c.passes), 0))

  const windowText =
    draft.dateMode === 'open'
      ? 'Wide open'
      : draft.dateMode === 'season'
        ? draft.season || MONTHS[0]
        : start && end
          ? `${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric' })}`
          : 'Not set'

  const next = () => {
    if (invalid) {
      document.getElementById('end-date')?.focus()
      return
    }
    navigate('/new/travelers')
  }

  const setConstraint = (id) => setDraft({ ...draft, constraints: { ...draft.constraints, [id]: !draft.constraints[id] } })

  return (
    <WizardLayout
      step={1}
      onNext={next}
      aside={
        <>
          <BoardingPreview
            rows={[
              ['Window', windowText],
              ['Length', dur ? `${dur.label} · ${dur.note}` : 'Not set'],
              ['Constraints', checked.length ? `${checked.length} selected` : 'None'],
              ['Travelers', 'Step 3 →'],
            ]}
          />
          <Note tone="warn-soft" icon="info">
            <strong>Romi shows 3 windows, max.</strong> We'll generate up to 3 candidate dates that fit your constraints,
            never a full month grid. You review and lock the final pick on the dashboard.
          </Note>
        </>
      }
    >
      <Eyebrow>Step 2 of 4 · Dates &amp; duration</Eyebrow>
      <h1>Do you have dates in mind?</h1>
      <p className="lede">Tell us the window. Romi will generate up to 3 candidate dates for the group to vote on.</p>

      <fieldset>
        <legend className="sr-only">How flexible are your dates?</legend>
        <div className="segmented">
          {dateModes.map((m) => (
            <label key={m.id} className="segmented__opt">
              <input type="radio" name="date-mode" checked={draft.dateMode === m.id} onChange={() => setDraft({ ...draft, dateMode: m.id })} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {draft.dateMode === 'specific' && (
        <div>
          <div className="date-pair">
            <div className="date-box">
              <label htmlFor="start-date" className="eyebrow">Earliest start</label>
              <input id="start-date" type="date" className="date-box__input" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
              <span className="muted small">{fmt(start, { weekday: 'long' })}</span>
            </div>
            <div className="date-box">
              <label htmlFor="end-date" className="eyebrow">Latest end</label>
              <input
                id="end-date"
                type="date"
                className="date-box__input"
                value={draft.end}
                min={draft.start}
                onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? 'date-error' : 'date-hint'}
              />
              <span className="muted small">{fmt(end, { weekday: 'long' })}</span>
            </div>
          </div>
          {invalid ? (
            <ErrorText id="date-error">The latest end date has to come after the earliest start.</ErrorText>
          ) : (
            <p id="date-hint" className="field__hint">
              Travelers only see date windows within this range. <strong>{days} days</strong> of search space.
            </p>
          )}
        </div>
      )}
      {draft.dateMode === 'season' && (
        <div className="field">
          <label htmlFor="season" className="field__label">Which month or season?</label>
          <select id="season" className="input" value={draft.season || MONTHS[0]} onChange={(e) => setDraft({ ...draft, season: e.target.value })}>
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      )}
      {draft.dateMode === 'open' && (
        <Note tone="info" icon="info">Romi will look across the next 6 months and suggest the 3 best windows for the group.</Note>
      )}

      <fieldset>
        <legend className="field__label">How long is the trip?</legend>
        <div className="chip-row">
          {durations.map((d) => (
            <label key={d.id} className="chip chip--stacked">
              <input type="radio" name="duration" checked={draft.duration === d.id} onChange={() => setDraft({ ...draft, duration: d.id })} />
              <span className="chip__label">{d.label}</span>
              <span className="chip__note">{d.note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field__label">Any constraints?</legend>
        <div className="stack stack--sm">
          {constraintsList.map((c) => (
            <label key={c.id} className="check-card">
              <input type="checkbox" checked={!!draft.constraints[c.id]} onChange={() => setConstraint(c.id)} />
              <span className="check-card__box" aria-hidden="true" />
              <span>
                <span className="strong block">{c.label}</span>
                {draft.constraints[c.id] && <span className="muted small">{c.passes} of 12 candidate windows pass this filter</span>}
              </span>
            </label>
          ))}
        </div>
        <p className="field__hint" aria-live="polite">
          {passing} of 12 candidate windows match all your constraints.
        </p>
      </fieldset>
    </WizardLayout>
  )
}
