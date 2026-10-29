import { Link } from 'react-router-dom'
import { trip } from '../data.js'
import { Logo, Note } from './ui.jsx'

const STEPS = [
  { label: 'Availability', to: '/availability' },
  { label: 'Budget', to: '/budget' },
  { label: 'Flight prefs', to: '/flight-preferences' },
]

function Stepper({ current }) {
  return (
    <nav aria-label="Progress" className="stepper">
      <ol>
        {STEPS.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li key={s.label} className={`stepper__item stepper__item--${state}`}>
              {state === 'done' ? (
                <Link to={s.to} className="stepper__link">
                  <span className="stepper__dot" aria-hidden="true">✓</span>
                  {s.label}
                  <span className="sr-only"> (completed, edit)</span>
                </Link>
              ) : (
                <span className="stepper__link" aria-current={state === 'current' ? 'step' : undefined}>
                  <span className="stepper__dot" aria-hidden="true">{i + 1}</span>
                  {s.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Shared shell for the traveler steps.
 * Desktop: dark sidebar (trip card, group progress, privacy note) + main column.
 * Mobile (<960px): top bar with Back + step count, segmented progress, sticky action bar.
 */
export default function Layout({ step, progress, backTo, title, actions, children, aside }) {
  const isStep = typeof step === 'number'
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Trip summary">
        <Link to="/" className="sidebar__logo" aria-label="Romi home">
          <Logo onDark />
        </Link>
        <section className="joining" aria-labelledby="joining-label">
          <p id="joining-label" className="eyebrow eyebrow--dark">You're joining</p>
          <p className="joining__name">{trip.name}</p>
          <p className="joining__meta">{trip.dates} · {trip.nights} nights</p>
          <p className="joining__org">
            <span className="avatar avatar--sm" style={{ background: '#4A7A86' }} aria-hidden="true">A</span>
            Organized by <strong>{trip.organizer}</strong>
          </p>
        </section>
        {progress && (
          <section className="group-progress" aria-labelledby="gp-label">
            <p id="gp-label" className="eyebrow eyebrow--dark">Group progress</p>
            <p className="group-progress__count">
              <strong>{progress.done}</strong> / {progress.total}
              <span className="group-progress__pct">{Math.round((progress.done / progress.total) * 100)}%</span>
            </p>
            <p className="group-progress__label">{progress.label}</p>
            <div
              className="bar"
              role="progressbar"
              aria-label={`${progress.done} of ${progress.total} ${progress.label}`}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
            >
              <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </section>
        )}
        <div className="sidebar__note">
          <Note tone="dark">
            <strong>Your answers are private.</strong> Only group overlap is shown. No one sees who said no.
          </Note>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          {backTo ? (
            <Link to={backTo} className="topbar__back">
              <span aria-hidden="true">←</span> Back
            </Link>
          ) : (
            <Link to="/" className="topbar__logo" aria-label="Romi home">
              <Logo />
            </Link>
          )}
          {isStep && <Stepper current={step} />}
          <p className="topbar__count">
            {isStep ? (
              <>
                Step <strong>{step + 1} of 3</strong>
                {step === 2 && <span className="hide-sm"> · almost done</span>}
              </>
            ) : (
              title
            )}
          </p>
        </header>
        {isStep && (
          <div className="segments" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.label} className={i <= step ? 'is-on' : ''} />
            ))}
          </div>
        )}
        <p className="mobile-trip">
          {trip.name} · {trip.dates}
        </p>

        <div className={`content ${aside ? 'content--split' : ''}`}>
          <main id="main" className="content__main">
            {children}
          </main>
          {aside && <aside className="content__aside">{aside}</aside>}
        </div>

        {actions && <div className="action-bar">{actions}</div>}
      </div>
    </div>
  )
}
