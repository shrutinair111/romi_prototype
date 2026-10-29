import { useCallback, useState } from 'react'
import NudgeDialog from '../../components/NudgeDialog.jsx'
import OrgLayout from '../../components/OrgLayout.jsx'
import { Avatar, Button, Dialog, ErrorText, Switch } from '../../components/ui.jsx'
import { useApp } from '../../state.jsx'
import { copyText } from './NewTravelers.jsx'
import { personStates } from './Overview.jsx'

const BADGE = {
  done: ['✓ Done', 'green'],
  skipped: ['Skipped', 'gray'],
  pending: ['Pending', 'orange'],
  no: ['—', 'none'],
}

function StatusBadge({ state }) {
  const [text, tone] = BADGE[state]
  if (tone === 'none') return <span className="muted" aria-label="Not started">—</span>
  return <span className={`status-pill status-pill--${tone}`}>{text}</span>
}

function JoinedBadge({ joined }) {
  if (joined === 'yes') return <span className="status-pill status-pill--green">✓ Joined</span>
  if (joined === 'invite') return <span className="status-pill status-pill--teal">Invite sent</span>
  return <span className="status-pill status-pill--red">Not opened</span>
}

function AddTravelerDialog({ open, onClose }) {
  const { setAdded, notify, log } = useApp()
  const [form, setForm] = useState({ name: '', contact: '' })
  const [errors, setErrors] = useState({})
  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Enter their name.'
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contact.trim()) || /^[+()\d\s-]{7,}$/.test(form.contact.trim())
    if (!ok) errs.contact = 'Enter a valid email or phone number, like sam@email.com'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setAdded((a) => [...a, { id: `added-${Date.now()}`, name: form.name.trim(), contact: form.contact.trim() }])
    log('you', `invited ${form.name.trim().split(' ')[0]}`)
    notify(`Invite sent to ${form.name.trim()}.`)
    setForm({ name: '', contact: '' })
    onClose()
  }
  return (
    <Dialog open={open} onClose={onClose} labelledBy="add-title">
      <h2 id="add-title" className="h2">Add a traveler</h2>
      <p className="lede">Romi sends them the trip link. They don't need an account.</p>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="add-name" className="field__label">Name</label>
          <input id="add-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'add-name-err' : undefined} />
          {errors.name && <ErrorText id="add-name-err">{errors.name}</ErrorText>}
        </div>
        <div className="field">
          <label htmlFor="add-contact" className="field__label">Email or phone</label>
          <input id="add-contact" className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'add-contact-err' : undefined} />
          {errors.contact && <ErrorText id="add-contact-err">{errors.contact}</ErrorText>}
        </div>
        <div className="dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">Send invite</button>
        </div>
      </form>
    </Dialog>
  )
}

// TM-06 · Traveler management
export default function Travelers() {
  const { trip, travelers, stats, autoRemind, setAutoRemind, setResent, notify, log } = useApp()
  const [nudgeFor, setNudgeFor] = useState([])
  const [adding, setAdding] = useState(false)
  const closeNudge = useCallback(() => setNudgeFor([]), [])
  const closeAdd = useCallback(() => setAdding(false), [])

  const rows = travelers.map((t) => ({ t, s: personStates(t) }))
  const nudgeable = rows.filter(({ t, s }) => !t.you && t.joined === 'yes' && Object.values(s).some((v) => v === 'pending')).map(({ t }) => t)
  const resend = (t) => {
    setResent((r) => ({ ...r, [t.id]: true }))
    log('you', `re-sent ${t.name.split(' ')[0]}'s invite`)
    notify(`Invite re-sent to ${t.name.split(' ')[0]} by text message.`)
  }

  const readiness = [
    ['Joined', stats.joined],
    ['Dates', stats.dates],
    ['Budget', stats.budgetDone],
    ['Flight prefs', stats.flight],
  ]

  return (
    <OrgLayout
      eyebrow={`Trip · ${trip.name}`}
      title="Travelers"
      badge={<span className="count-pill">{travelers.length} people</span>}
      actions={
        <>
          <Button variant="secondary" onClick={() => copyText(`https://${trip.link}`, notify, 'Trip link copied')}>Copy trip link</Button>
          <Button onClick={() => setAdding(true)}>+ Add traveler</Button>
        </>
      }
      aside={
        <>
          <section aria-labelledby="ready-title">
            <h2 id="ready-title" className="eyebrow">Trip readiness</h2>
            <ul className="readiness">
              {readiness.map(([label, n]) => (
                <li key={label}>
                  <span className="split-head">
                    <span>{label}</span>
                    <strong>{n}/{stats.total}</strong>
                  </span>
                  <span className="mini-bar mini-bar--light" role="progressbar" aria-label={`${label}: ${n} of ${stats.total}`} aria-valuemin={0} aria-valuemax={stats.total} aria-valuenow={n}>
                    <span style={{ width: `${(n / stats.total) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <div className="switch-row switch-row--card">
            <Switch checked={autoRemind} onChange={setAutoRemind} labelledBy="auto-label" describedBy="auto-note" />
            <div>
              <p id="auto-label" className="strong">Auto-remind {autoRemind ? 'on' : 'off'}</p>
              <p id="auto-note" className="muted small">
                {autoRemind ? "Romi sends a friendly nudge to non-responders every 48 hours, so you don't have to." : 'Romi will not follow up automatically.'}
              </p>
            </div>
          </div>
          <section aria-labelledby="drop-title">
            <h2 id="drop-title" className="eyebrow eyebrow--orange">For drop-in invites</h2>
            <div className="code-card">
              <p className="strong">Don't have a link?</p>
              <p className="muted small">Anyone with the trip code can join. Pin it in your group chat:</p>
              <button type="button" className="code-card__code" onClick={() => copyText(trip.code, notify, 'Trip code copied')}>
                {trip.code}<span className="sr-only"> (copy trip code)</span>
              </button>
            </div>
          </section>
        </>
      }
    >
      <section className="share-card share-card--compact" aria-label="Shareable trip link">
        <span className="share-card__link">
          <span className="eyebrow">Shareable trip link</span>
          <span className="block">romi.app/join/<strong>{trip.code}</strong></span>
        </span>
        <Button size="sm" onClick={() => copyText(`https://${trip.link}`, notify)}>Copy</Button>
      </section>

      <div className="table-card">
        <table className="people-table">
          <caption className="sr-only">Travelers and what each one still needs to do</caption>
          <thead>
            <tr>
              <th scope="col">Traveler</th>
              <th scope="col">Joined</th>
              <th scope="col">Dates</th>
              <th scope="col">Budget</th>
              <th scope="col">Flight prefs</th>
              <th scope="col" className="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, s }) => {
              const first = t.name.split(' ')[0]
              const needs = !t.you && t.joined === 'yes' && Object.values(s).some((v) => v === 'pending')
              return (
                <tr key={t.id} className={t.you ? 'is-you' : ''}>
                  <th scope="row">
                    <span className="person-cell">
                      <Avatar person={t} />
                      <span>
                        <span className="strong block">
                          {t.name} {t.you && <span className="you-tag">You</span>}
                        </span>
                        <span className="muted small block">{t.contact}</span>
                        {!t.you && <span className="muted small block person-cell__note">{t.resent ? 'Invite re-sent just now' : t.nudged ? 'Nudged just now' : t.note}</span>}
                      </span>
                    </span>
                  </th>
                  <td data-label="Joined"><JoinedBadge joined={t.joined} /></td>
                  <td data-label="Dates"><StatusBadge state={s.dates} /></td>
                  <td data-label="Budget"><StatusBadge state={s.budget} /></td>
                  <td data-label="Flight prefs"><StatusBadge state={s.flight} /></td>
                  <td className="people-table__action">
                    {t.joined !== 'yes' ? (
                      <Button size="sm" variant="secondary" onClick={() => resend(t)} disabled={t.resent}>
                        {t.resent ? 'Sent ✓' : 'Re-send invite'}
                        <span className="sr-only"> to {first}</span>
                      </Button>
                    ) : needs ? (
                      <Button size="sm" onClick={() => setNudgeFor([t])}>
                        Nudge<span className="sr-only"> {first}</span>
                      </Button>
                    ) : (
                      <span className="muted" aria-label="No action needed">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {nudgeable.length > 0 && (
        <div className="nudge-banner">
          <span className="nudge-banner__icon" aria-hidden="true">🔔</span>
          <div>
            <p className="strong">{nudgeable.length} traveler{nudgeable.length > 1 ? 's haven’t' : ' hasn’t'} finished their answers.</p>
            <p className="small">
              Romi can ping {nudgeable.map((t) => t.name.split(' ')[0]).join(' and ')} for you.{autoRemind && ' Last auto-nudge: 18 hours ago.'}
            </p>
          </div>
          <Button onClick={() => setNudgeFor(nudgeable)}>Nudge all pending</Button>
        </div>
      )}

      <NudgeDialog people={nudgeFor} onClose={closeNudge} />
      <AddTravelerDialog open={adding} onClose={closeAdd} />
    </OrgLayout>
  )
}
