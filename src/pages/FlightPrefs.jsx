import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Button, Eyebrow, Note } from '../components/ui.jsx'
import { arrivalTimes, flightPrefs, groupArrivals } from '../data.js'
import { useTraveler } from '../state.jsx'

function SearchSummary({ prefs }) {
  const arrival = arrivalTimes.find((a) => a.id === prefs.arrival)
  const items = [
    `Departures from AUS${prefs.nearby ? ' or SAT' : ''}`,
    prefs.arrival === 'any' ? 'Any arrival time in BCN' : `${arrival.label} arrival in BCN`,
    prefs.checks.noRedEye && 'No red-eye flights',
    prefs.checks.direct && 'Direct flights only',
    "Within group's 2-hour landing window",
    'Under your private budget ceiling',
  ].filter(Boolean)
  return (
    <>
      <h2 className="eyebrow">What Romi will search for</h2>
      <div className="summary-card">
        <span className="pill pill--outline">Your search</span>
        <ul className="checklist">
          {items.map((t) => (
            <li key={t}>
              <span aria-hidden="true">✓</span> {t}
            </li>
          ))}
        </ul>
      </div>
      <h2 className="eyebrow">Group arrival sync</h2>
      <div className="sync-card">
        <p>5 travelers · land within 2 hrs</p>
        <div className="sync-card__avatars" aria-hidden="true">
          {groupArrivals.map((g) => (
            <span key={g.initial} className="avatar avatar--sm" style={{ background: g.color }}>{g.initial}</span>
          ))}
          <span className="avatar avatar--sm avatar--you">You</span>
        </div>
        <p>Romi pairs your arrival with the group's window, so no one waits alone at BCN.</p>
      </div>
      <Note>
        <strong>What Alex sees:</strong> arrival times only. Never your flight cost, never your departure city.
      </Note>
    </>
  )
}

export default function FlightPrefs() {
  const { prefs, setPrefs } = useTraveler()
  const navigate = useNavigate()
  const toggleCheck = (id) => setPrefs({ ...prefs, checks: { ...prefs.checks, [id]: !prefs.checks[id] } })

  return (
    <Layout
      step={2}
      backTo="/budget"
      progress={{ done: 2, total: 5, label: 'have set flight preferences' }}
      aside={<SearchSummary prefs={prefs} />}
      actions={
        <div className="action-bar__buttons">
          <Button to="/budget" variant="secondary">Back</Button>
          <Button onClick={() => navigate('/approve')}>Finish &amp; submit →</Button>
        </div>
      }
    >
      <Eyebrow>Flight preferences</Eyebrow>
      <h1>Where are you flying from?</h1>
      <p className="lede">We'll line up arrivals so the group lands within a 2-hour window.</p>

      <h2 className="field__label">Home airport</h2>
      <div className="airport-card">
        <span className="airport-card__icon" aria-hidden="true">✈</span>
        <div>
          <p className="strong">Austin–Bergstrom (AUS)</p>
          <p className="muted small">Austin, Texas</p>
        </div>
        <span className="badge badge--green">✓ Confirmed</span>
      </div>

      <div className="switch-row">
        <button
          type="button"
          role="switch"
          aria-checked={prefs.nearby}
          aria-labelledby="nearby-label"
          aria-describedby="nearby-note"
          className="switch"
          onClick={() => setPrefs({ ...prefs, nearby: !prefs.nearby })}
        >
          <span />
        </button>
        <div>
          <p id="nearby-label" className="strong">Include nearby airports</p>
          <p id="nearby-note" className="muted small">
            {prefs.nearby ? 'San Antonio (SAT) included, adds 1 alternate.' : 'Only AUS will be searched.'}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="field__label">When do you prefer to arrive?</legend>
        <div className="chip-row">
          {arrivalTimes.map((a) => (
            <label key={a.id} className="chip chip--stacked">
              <input
                type="radio"
                name="arrival"
                checked={prefs.arrival === a.id}
                onChange={() => setPrefs({ ...prefs, arrival: a.id })}
              />
              <span className="chip__label">{a.label}</span>
              <span className="chip__note">{a.note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field__label">Any preferences?</legend>
        <div className="stack stack--sm">
          {flightPrefs.map((p) => (
            <label key={p.id} className={`check-card ${p.id === 'ownFlight' ? 'check-card--dashed' : ''}`}>
              <input type="checkbox" checked={!!prefs.checks[p.id]} onChange={() => toggleCheck(p.id)} />
              <span className="check-card__box" aria-hidden="true" />
              <span>
                <span className="strong block">{p.label}</span>
                <span className="muted small">{p.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </Layout>
  )
}
