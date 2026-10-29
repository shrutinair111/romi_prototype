import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trip } from '../data.js'
import { Logo } from '../components/ui.jsx'
import { useTraveler } from '../state.jsx'

const AVATARS = { Alex: '#4A7A86', Priya: '#8B61B8', Jamie: '#5A7796', Dev: '#A84E14' }

function validate({ name, contact }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Enter your name so the group knows who joined.'
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  const phone = /^[+()\d\s-]{7,}$/
  if (!contact.trim()) errors.contact = 'Enter an email or phone number so Romi can send you updates.'
  else if (!email.test(contact.trim()) && !phone.test(contact.trim()))
    errors.contact = 'Enter a valid email or phone number, like marcus@email.com'
  return errors
}

function ErrorText({ id, children }) {
  return (
    <p id={id} className="field__error">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6M12 17h.01" />
      </svg>
      {children}
    </p>
  )
}

export default function Join() {
  const { profile, setProfile } = useTraveler()
  const [form, setForm] = useState(profile)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(found.name ? 'name' : 'contact')?.focus()
      return
    }
    setProfile(form)
    navigate('/availability')
  }

  return (
    <div className="join-page">
      <div className="join-bg" aria-hidden="true" />
      <main id="main" className="join-card">
        <Logo />
        <section className="trip-card" aria-labelledby="trip-title">
          <p className="trip-card__invite">
            <span className="pill pill--outline">Invited by</span>
            <span className="avatar avatar--sm" style={{ background: AVATARS.Alex }} aria-hidden="true">A</span>
            {trip.organizer}
          </p>
          <h2 id="trip-title" className="trip-card__title">{trip.name}</h2>
          <ul className="pills" aria-label="Trip details">
            <li className="pill"><span aria-hidden="true">{trip.flag} </span>{trip.destination}</li>
            <li className="pill"><span aria-hidden="true">📅 </span>{trip.dates} · {trip.nights} nights</li>
          </ul>
          <p className="trip-card__others">
            <span className="avatar-stack" aria-hidden="true">
              {trip.others.map((n) => (
                <span key={n} className="avatar avatar--sm" style={{ background: AVATARS[n] }}>{n[0]}</span>
              ))}
            </span>
            <span><strong>{trip.others.length} others</strong> joining: {trip.others.join(', ')}</span>
          </p>
        </section>

        <h1 className="h2">Join this trip</h1>
        <p className="lede">Tell us who you are. We'll ask for availability and preferences next.</p>

        <form onSubmit={submit} noValidate className="stack">
          <div className="field">
            <label htmlFor="name" className="field__label">Your name</label>
            <input
              id="name"
              className="input"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <ErrorText id="name-error">{errors.name}</ErrorText>}
          </div>
          <div className="field">
            <label htmlFor="contact" className="field__label">Email or phone</label>
            <input
              id="contact"
              className="input"
              autoComplete="email"
              inputMode="email"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              aria-invalid={!!errors.contact}
              aria-describedby={errors.contact ? 'contact-error' : 'contact-hint'}
            />
            {errors.contact ? (
              <ErrorText id="contact-error">{errors.contact}</ErrorText>
            ) : (
              <p id="contact-hint" className="field__hint">No account or app download needed.</p>
            )}
          </div>
          <button type="submit" className="btn btn--primary btn--block">Join trip →</button>
        </form>
        <p className="center muted">You'll be asked for availability and travel preferences next.</p>
        <hr className="divider" />
        <p className="center">
          Already have a Romi account? <a href="#/" className="link">Sign in</a>
        </p>
      </main>
    </div>
  )
}
