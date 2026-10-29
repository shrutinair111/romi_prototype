import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorText, Logo } from '../../components/ui.jsx'
import { features, trip } from '../../data.js'

const ICONS = {
  dates: <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  flights: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />,
  budget: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm2.5 13.5c0 1.4-1.1 2.3-2.5 2.5v1h-1v-1c-1.4-.2-2.5-1.1-2.5-2.5M9.5 8.5c0-1.4 1.1-2.3 2.5-2.5V5h1v1c1.4.2 2.5 1.1 2.5 2.5" />,
  nudges: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
}

// TM-01 · Welcome / entry. One way to start a trip, one way to join one (audit fix M6).
export default function Welcome() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const join = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) {
      setError("Enter the trip code from your organizer's message.")
    } else if (c !== trip.code) {
      setError(`We couldn't find trip ${c}. Check the code with your organizer. (Demo code: ${trip.code})`)
    } else {
      navigate('/join')
      return
    }
    document.getElementById('trip-code')?.focus()
  }

  return (
    <div className="welcome">
      <main id="main" className="welcome__hero">
        <Logo onDark height={63} />
        <div className="welcome__copy">
          <p className="eyebrow eyebrow--dark">Group travel coordination</p>
          <h1 className="welcome__title">
            Group travel, <span>finally coordinated.</span>
          </h1>
          <p className="welcome__lede">
            Romi aligns dates, multi-origin flights, and budgets for everyone in your group, without the 47-message thread.
            One shared surface. No more chasing.
          </p>
          <Link to="/new/basics" className="btn btn--light btn--block">
            Create a trip →
          </Link>
          <form className="welcome__join" onSubmit={join} noValidate>
            <label htmlFor="trip-code" className="welcome__label">
              Joining a friend's trip? Enter the trip code
            </label>
            <div className="welcome__join-row">
              <input
                id="trip-code"
                className="input input--dark"
                placeholder="e.g. BCN2026"
                autoCapitalize="characters"
                autoComplete="off"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError('')
                }}
                aria-invalid={!!error}
                aria-describedby={error ? 'code-error' : 'code-hint'}
              />
              <button type="submit" className="btn btn--light">Join →</button>
            </div>
            {error ? (
              <div className="welcome__error">
                <ErrorText id="code-error">{error}</ErrorText>
              </div>
            ) : (
              <p id="code-hint" className="welcome__hint">
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                No account needed to join a trip
              </p>
            )}
          </form>
        </div>
        <p className="welcome__tagline" aria-hidden="true">Let's roam together!</p>
      </main>

      <section className="welcome__side" aria-labelledby="what-romi-does">
        <p className="welcome__signin">
          Already planning a trip? <Link to="/trip" className="link">Sign in</Link>
        </p>
        <p className="eyebrow">What Romi does</p>
        <h2 id="what-romi-does" className="welcome__h2">Four hard problems, one shared surface.</h2>
        <ul className="feature-grid">
          {features.map((f) => (
            <li key={f.id} className="feature">
              <span className="feature__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[f.id]}
                </svg>
              </span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__body">{f.body}</p>
            </li>
          ))}
        </ul>
        <p className="muted small welcome__index">
          Prototype tip: <Link to="/screens" className="link">see every screen</Link>
        </p>
      </section>
    </div>
  )
}
