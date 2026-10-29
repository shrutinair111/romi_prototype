import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout from '../../components/WizardLayout.jsx'
import { Button, ErrorText, Eyebrow } from '../../components/ui.jsx'
import { trip } from '../../data.js'
import { useApp } from '../../state.jsx'

const COLORS = ['#4B7C6F', '#8B61B8', '#A84E14', '#5A7796', '#4A7A86']
const inviteText = `Join "${trip.name}" on Romi: https://${trip.link} (code ${trip.code})`

export async function copyText(text, notify, label = 'Link copied') {
  try {
    await navigator.clipboard.writeText(text)
    notify(`${label}.`)
  } catch {
    notify(`Copy this: ${text}`)
  }
}

export function InviteChannels() {
  const msg = encodeURIComponent(inviteText)
  const channels = [
    { name: 'WhatsApp', note: 'Send to a group chat', href: `https://wa.me/?text=${msg}`, color: '#1F7A4A', icon: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" /> },
    { name: 'Email', note: 'Drop into your mail app', href: `mailto:?subject=${encodeURIComponent(`Join ${trip.name}`)}&body=${msg}`, color: '#2C6D7F', icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></> },
    { name: 'iMessage', note: 'For Apple-only crews', href: `sms:&body=${msg}`, color: '#1B6FB8', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
  ]
  return (
    <ul className="stack stack--sm">
      {channels.map((c) => (
        <li key={c.name}>
          <a className="channel" href={c.href} target="_blank" rel="noreferrer">
            <span className="channel__icon" style={{ background: c.color }} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
            </span>
            <span className="channel__text">
              <span className="strong block">{c.name}</span>
              <span className="muted small">{c.note}</span>
            </span>
            <span aria-hidden="true">→</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

// TM-04 · Add travelers
export default function NewTravelers() {
  const { draft, setDraft, notify } = useApp()
  const [form, setForm] = useState({ name: '', contact: '' })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const add = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Enter their name.'
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contact.trim()) || /^[+()\d\s-]{7,}$/.test(form.contact.trim())
    if (!ok) errs.contact = 'Enter a valid email or phone number, like jamie@email.com'
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(errs.name ? 'inv-name' : 'inv-contact')?.focus()
      return
    }
    setDraft({ ...draft, invitees: [...draft.invitees, { id: `p${Date.now()}`, name: form.name.trim(), contact: form.contact.trim() }] })
    notify(`${form.name.trim()} added. Romi will send the invite.`)
    setForm({ name: '', contact: '' })
    document.getElementById('inv-name')?.focus()
  }

  const remove = (person) => {
    const before = draft.invitees
    setDraft({ ...draft, invitees: before.filter((p) => p.id !== person.id) })
    notify(`${person.name} removed from the trip.`, {
      actionLabel: 'Undo',
      onAction: () => setDraft((d) => ({ ...d, invitees: before })),
    })
  }

  return (
    <WizardLayout
      step={2}
      onNext={() => navigate('/new/tools')}
      aside={
        <>
          <h2 className="eyebrow eyebrow--orange">For drop-in invites</h2>
          <div className="code-card">
            <p className="strong">Don't have a link?</p>
            <p className="muted small">Anyone who missed your message can find this trip with the code.</p>
            <button type="button" className="code-card__code" onClick={() => copyText(trip.code, notify, 'Trip code copied')}>
              {trip.code}
              <span className="sr-only"> (copy trip code)</span>
            </button>
          </div>
          <h2 className="eyebrow">Invite via</h2>
          <InviteChannels />
          <h2 className="eyebrow">After inviting</h2>
          <ol className="numbered">
            <li>They open the link, no signup required.</li>
            <li>They submit availability and budget in under 2 minutes.</li>
            <li>You see status update live on the dashboard.</li>
          </ol>
        </>
      }
    >
      <Eyebrow>Step 3 of 4 · Travelers</Eyebrow>
      <h1>Who's coming?</h1>
      <p className="lede">Share the link, drop in emails, or both. Friends don't need a Romi account to join.</p>

      <section className="share-card" aria-labelledby="share-label">
        <p id="share-label" className="strong">Share this link with your group</p>
        <div className="share-card__row">
          <span className="share-card__link">
            romi.app/join/<strong>{trip.code}</strong>
          </span>
          <Button onClick={() => copyText(`https://${trip.link}`, notify)}>Copy</Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigator.share ? navigator.share({ title: trip.name, text: inviteText }).catch(() => {}) : copyText(inviteText, notify, 'Invite message copied')
            }
          >
            Share
          </Button>
        </div>
      </section>

      <form className="add-form" onSubmit={add} noValidate aria-labelledby="add-label">
        <p id="add-label" className="divider-label"><span>Or add directly</span></p>
        <div className="add-form__row">
          <div className="field">
            <label htmlFor="inv-name" className="field__label">Name</label>
            <input id="inv-name" className="input" placeholder="e.g. Jamie Wu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'inv-name-err' : undefined} />
            {errors.name && <ErrorText id="inv-name-err">{errors.name}</ErrorText>}
          </div>
          <div className="field">
            <label htmlFor="inv-contact" className="field__label">Email or phone</label>
            <input id="inv-contact" className="input" placeholder="e.g. jamie@email.com" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'inv-contact-err' : undefined} />
            {errors.contact && <ErrorText id="inv-contact-err">{errors.contact}</ErrorText>}
          </div>
          <button type="submit" className="btn btn--primary add-form__btn">+ Add</button>
        </div>
      </form>

      {draft.invitees.length === 0 ? (
        <div className="empty">
          <p className="strong">No one added yet</p>
          <p className="muted">Share the link or add someone by email to get started. You can always add more people later.</p>
        </div>
      ) : (
        <ul className="person-list" aria-label={`${draft.invitees.length} travelers added`}>
          {draft.invitees.map((p, i) => (
            <li key={p.id} className="person-list__row">
              <span className="avatar" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true">{p.name[0]}</span>
              <span className="person-list__text">
                <span className="strong block">{p.name}</span>
                <span className="muted small">{p.contact}</span>
              </span>
              <span className="badge badge--green">✓ Added</span>
              <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => remove(p)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="note note--info-left">
        <div>
          <strong>Romi sends the invites for you.</strong> Your friends get a clean link with the trip details. No app download
          required to submit their dates.
        </div>
      </div>
    </WizardLayout>
  )
}
