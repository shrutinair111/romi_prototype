import { Link } from 'react-router-dom'
import { useApp } from '../state.jsx'
import { Logo } from './ui.jsx'

export const WIZARD = [
  { label: 'Basics', sub: 'Name & destination', to: '/new/basics' },
  { label: 'Dates', sub: 'Window & duration', to: '/new/dates' },
  { label: 'Travelers', sub: 'Invite the crew', to: '/new/travelers' },
  { label: 'Planning tools', sub: 'Choose what to plan', to: '/new/tools' },
]

/**
 * Shell for the organizer's create-trip wizard (TM-02 to TM-05).
 * Completed steps stay clickable; future steps say why they're locked (audit fixes M3, H1).
 * Continue appears top-right and in a bottom bar with Back, so the primary action never moves.
 */
export default function WizardLayout({ step, onNext, nextLabel = 'Continue →', aside, children }) {
  const { notify } = useApp()
  const back = step === 0 ? '/' : WIZARD[step - 1].to
  const next = (
    <button type="button" className="btn btn--primary" onClick={onNext}>
      {nextLabel}
    </button>
  )
  return (
    <div className="shell shell--wizard">
      <aside className="sidebar" aria-label="New trip steps">
        <Link to="/" className="sidebar__logo" aria-label="Romi home">
          <Logo onDark height={44} />
        </Link>
        <nav aria-labelledby="new-trip-label">
          <p id="new-trip-label" className="eyebrow eyebrow--dark">New trip</p>
          <ol className="wizard-steps">
            {WIZARD.map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'locked'
              const inner = (
                <>
                  <span className="wizard-steps__dot" aria-hidden="true">
                    {state === 'done' ? '✓' : state === 'locked' ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    ) : i + 1}
                  </span>
                  <span>
                    <span className="wizard-steps__label">{s.label}</span>
                    <span className="wizard-steps__sub">
                      {state === 'locked' ? `Locked · finish ${WIZARD[i - 1].label} first` : s.sub}
                    </span>
                  </span>
                </>
              )
              return (
                <li key={s.label} className={`wizard-steps__item wizard-steps__item--${state}`}>
                  {state === 'done' ? (
                    <Link to={s.to} className="wizard-steps__row">
                      {inner}
                      <span className="sr-only"> (completed, edit)</span>
                    </Link>
                  ) : (
                    <span className="wizard-steps__row" aria-current={state === 'current' ? 'step' : undefined}>
                      {inner}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="sidebar__note skip-box">
          <p className="strong-light">Skip &amp; come back</p>
          <p>You can skip any step and finish later. Your draft is saved as you go.</p>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <Link to={back} className="topbar__back">
            <span aria-hidden="true">←</span> Back
          </Link>
          <nav aria-label="Progress" className="stepper">
            <ol>
              {WIZARD.map((s, i) => {
                const state = i < step ? 'done' : i === step ? 'current' : 'todo'
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
          <div className="topbar__actions">
            <button type="button" className="btn btn--ghost" onClick={() => notify('Draft saved.')}>
              Save draft
            </button>
            <span className="hide-sm">{next}</span>
          </div>
          <p className="topbar__count show-sm">
            Step <strong>{step + 1} of 4</strong>
          </p>
        </header>
        <div className="segments segments--4" aria-hidden="true">
          {WIZARD.map((s, i) => (
            <span key={s.label} className={i <= step ? 'is-on' : ''} />
          ))}
        </div>

        <div className={`content ${aside ? 'content--split content--wide' : ''}`}>
          <main id="main" className="content__main">
            {children}
          </main>
          {aside && <aside className="content__aside">{aside}</aside>}
        </div>

        <div className="action-bar">
          <p className="action-bar__status">
            Step {step + 1} of 4 · Your draft saves automatically
          </p>
          <div className="action-bar__buttons">
            <Link to={back} className="btn btn--secondary">Back</Link>
            {next}
          </div>
        </div>
      </div>
    </div>
  )
}
