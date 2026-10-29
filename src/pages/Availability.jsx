import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Button, Eyebrow, Note } from '../components/ui.jsx'
import { windows } from '../data.js'
import { useTraveler } from '../state.jsx'

const OPTIONS = [
  { value: 'yes', label: "Yes, I'm free", note: 'all dates work', icon: '✓' },
  { value: 'maybe', label: 'Maybe', note: 'might shift things', icon: '~' },
  { value: 'no', label: "Can't do it", note: 'conflict', icon: '✗' },
]

export default function Availability() {
  const { availability, setAvailability, stats, log, notify } = useTraveler()
  const navigate = useNavigate()
  const answered = windows.filter((w) => availability[w.id]).length
  const missing = windows.filter((w) => !availability[w.id]).map((w) => `Window ${w.id}`)

  const submit = () => {
    log('marcus', 'updated availability')
    notify('Availability saved. Alex only sees group counts.')
    navigate('/budget')
  }

  return (
    <Layout
      step={0}
      backTo="/join"
      progress={{ done: stats.dates, total: stats.total, label: 'have submitted availability' }}
      actions={
        <>
          <p className="action-bar__status" aria-live="polite">
            You've answered <strong>{answered} of {windows.length} windows</strong>.
            {missing.length > 0 && ` ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} still blank, you can submit now and answer later.`}
          </p>
          <div className="action-bar__buttons">
            <Button to="/join" variant="secondary">Back</Button>
            <Button onClick={submit}>Submit &amp; continue →</Button>
          </div>
        </>
      }
    >
      <Eyebrow>Your availability</Eyebrow>
      <h1>When can you travel?</h1>
      <p className="lede">
        Alex has narrowed it to <strong>3 windows</strong>. Pick one response per window. It takes about 30 seconds.
      </p>

      <div className="stack stack--lg">
        {windows.map((w) => {
          const value = availability[w.id]
          return (
            <fieldset key={w.id} className={`window window--${value || 'empty'}`}>
              <legend className="sr-only">
                Window {w.id}: {w.label}. Are you free?
              </legend>
              <div className="window__head">
                <div>
                  <p className="window__title">
                    <span className="tag" aria-hidden="true">{w.id}</span>
                    <span aria-hidden="true">{w.label}</span>
                    {w.popular && <span className="badge badge--teal">★ Most popular</span>}
                    {!value && <span className="badge badge--outline">Not answered yet</span>}
                  </p>
                  <p className="muted">{w.detail}</p>
                </div>
                <div className="price-chip">
                  <span className="price-chip__label">Est. flight from AUS</span>
                  <span className="price-chip__value">{w.flight}</span>
                  <span className="price-chip__note">{w.flightNote}</span>
                </div>
              </div>
              <div className="choice-row">
                {OPTIONS.map((o) => (
                  <label key={o.value} className={`choice choice--${o.value}`}>
                    <input
                      type="radio"
                      name={`window-${w.id}`}
                      value={o.value}
                      checked={value === o.value}
                      onChange={() => setAvailability({ ...availability, [w.id]: o.value })}
                    />
                    <span className="choice__icon" aria-hidden="true">{o.icon}</span>
                    <span>
                      <span className="choice__label">{o.label}</span>
                      <span className="choice__note">{o.note}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>

      <Note>
        <strong>Your individual response is never shown to other travelers.</strong> Alex only sees how many people are
        free for each window, never who said no.
      </Note>
    </Layout>
  )
}
