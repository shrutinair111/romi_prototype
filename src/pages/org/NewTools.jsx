import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout from '../../components/WizardLayout.jsx'
import { Dialog, Eyebrow } from '../../components/ui.jsx'
import { durations, occasions, tools } from '../../data.js'
import { useApp } from '../../state.jsx'

const TOOL_ICONS = {
  dates: <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  flights: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />,
  budget: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5c-.4-1-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.5-2.5-1.5M12 6.5v1.5M12 16v1.5" /></>,
  stays: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  itinerary: <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />,
  expenses: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>,
}

// TM-05 · Planning tools
export default function NewTools() {
  const { draft, setDraft, notify, log, setDatesLocked, setPackageSent } = useApp()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const close = useCallback(() => setSummaryOpen(false), [])
  const navigate = useNavigate()
  const count = tools.filter((t) => draft.tools[t.id]).length
  const n = draft.invitees.length

  const create = () => {
    setDatesLocked(false)
    setPackageSent(false)
    log('you', `created the trip and invited ${n} travelers`)
    notify(`Trip created. Invites sent to ${n} traveler${n === 1 ? '' : 's'}.`)
    navigate('/trip')
  }

  return (
    <WizardLayout step={3} onNext={create} nextLabel="Create trip →">
      <div className="split-head split-head--top">
        <div>
          <Eyebrow>Step 4 of 4 · Planning tools</Eyebrow>
          <h1>What do you need help with?</h1>
          <p className="lede">Only selected tools appear on your dashboard. You can turn the rest on anytime, no need to decide everything now.</p>
        </div>
        <p className="count-card" aria-live="polite">
          <span className="eyebrow">Selected</span>
          <span><strong>{count}</strong> / {tools.length} tools</span>
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Planning tools</legend>
        <div className="tool-grid">
          {tools.map((t) => (
            <label key={t.id} className="tool">
              <input
                type="checkbox"
                checked={!!draft.tools[t.id]}
                onChange={() => setDraft({ ...draft, tools: { ...draft.tools, [t.id]: !draft.tools[t.id] } })}
                aria-describedby={`tool-${t.id}`}
              />
              <span className="tool__check" aria-hidden="true" />
              <span className="tool__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{TOOL_ICONS[t.id]}</svg>
              </span>
              <span className="tool__title">{t.label}</span>
              <span id={`tool-${t.id}`} className="tool__body">
                {t.body}
                {t.id === 'itinerary' && ' Unlocks after dates are locked.'}
              </span>
              <span className="tool__tag">{t.tag}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="takeoff" aria-labelledby="takeoff-title">
        <div>
          <h2 id="takeoff-title" className="h3">Ready for takeoff?</h2>
          <p>
            Romi will create the trip, send invites to <strong>{n} travelers</strong>, and start watching for date overlap.{' '}
            <button type="button" className="link-btn" onClick={() => setSummaryOpen(true)}>Review summary →</button>
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={create}>Create trip →</button>
      </section>

      <Dialog open={summaryOpen} onClose={close} labelledBy="sum-title">
        <p className="eyebrow">Trip summary</p>
        <h2 id="sum-title" className="h2">{draft.name || 'Untitled trip'}</h2>
        <dl className="summary">
          <div><dt>Destination</dt><dd>{draft.destination || 'Not decided'}</dd></div>
          <div><dt>Occasion</dt><dd>{occasions.find((o) => o.id === draft.occasion)?.label}</dd></div>
          <div><dt>Date window</dt><dd>{draft.dateMode === 'specific' ? `${draft.start} → ${draft.end}` : draft.dateMode === 'season' ? draft.season || 'March 2026' : 'Wide open'}</dd></div>
          <div><dt>Length</dt><dd>{durations.find((d) => d.id === draft.duration)?.label}</dd></div>
          <div><dt>Travelers</dt><dd>{n ? draft.invitees.map((p) => p.name.split(' ')[0]).join(', ') : 'None yet'}</dd></div>
          <div><dt>Tools</dt><dd>{tools.filter((t) => draft.tools[t.id]).map((t) => t.label).join(', ') || 'None'}</dd></div>
        </dl>
        <div className="dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={close}>Keep editing</button>
          <button type="button" className="btn btn--primary" onClick={create}>Create trip →</button>
        </div>
      </Dialog>
    </WizardLayout>
  )
}
