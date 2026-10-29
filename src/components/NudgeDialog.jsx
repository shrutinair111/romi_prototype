import { useState } from 'react'
import { useApp } from '../state.jsx'
import { Dialog } from './ui.jsx'

const listNames = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`)

function NudgeBody({ people, onClose }) {
  const { trip, setNudged, notify, log } = useApp()
  const names = people.map((p) => p.name.split(' ')[0])
  // Mounted fresh each time the dialog opens, so the draft message resets.
  const [message, setMessage] = useState(
    `Hey! Alex is planning ${trip.name} (${trip.dates}). Can you add your availability and budget? It takes about 30 seconds: https://${trip.link}`,
  )

  const send = () => {
    setNudged((n) => ({ ...n, ...Object.fromEntries(people.map((p) => [p.id, true])) }))
    log('romi', `nudged ${listNames(names)}`)
    notify(`Nudge sent to ${listNames(names)}. Auto-nudges pause for 48 hours.`)
    onClose()
  }

  return (
    <>
      <h2 id="nudge-title" className="h2">Send a nudge to {listNames(names)}?</h2>
      <p id="nudge-desc" className="lede">Here's what they'll get. Edit it if you like. Nudges never include anyone's answers.</p>
      <div className="field">
        <label htmlFor="nudge-msg" className="field__label">Message</label>
        <textarea id="nudge-msg" className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <p className="muted small">Sent by email and text · Auto-nudges pause for 48 hours after this</p>
      <div className="dialog__actions">
        <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={send} disabled={!message.trim()}>Send nudge</button>
      </div>
    </>
  )
}

// Nudge preview (audit fix H6): the organizer sees and can edit the exact message
// before Romi sends it.
export default function NudgeDialog({ people, onClose }) {
  return (
    <Dialog open={people.length > 0} onClose={onClose} labelledBy="nudge-title" describedBy="nudge-desc">
      <NudgeBody people={people} onClose={onClose} />
    </Dialog>
  )
}
