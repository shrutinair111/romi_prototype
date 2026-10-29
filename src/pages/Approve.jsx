import { useCallback, useRef, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { Button, Dialog, Eyebrow, Toast } from '../components/ui.jsx'
import { groupArrivals, myFlight as f, trip } from '../data.js'
import { useTraveler } from '../state.jsx'

const START = 6
const END = 12
const pos = (h) => `${((h - START) / (END - START)) * 100}%`
const ticks = ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', 'noon']

function ArrivalCheck() {
  return (
    <section className="arrival-check" aria-labelledby="ac-title">
      <div className="split-head">
        <p className="eyebrow eyebrow--green">Group arrival check</p>
        <p className="muted small">BCN · Sun, Mar 15</p>
      </div>
      <h2 id="ac-title" className="h3">
        You land <span className="text-green">with the group</span>.
      </h2>
      {/* Visual timeline is decorative; the sentence below carries the same information. */}
      <div className="timeline" aria-hidden="true">
        <div className="timeline__window" style={{ left: pos(f.groupWindow.start), right: `calc(100% - ${pos(f.groupWindow.end)})` }}>
          <span>Group window · {f.groupWindow.label}</span>
        </div>
        <div className="timeline__line" />
        {groupArrivals.map((g) => (
          <span key={g.initial} className="avatar avatar--sm timeline__dot" style={{ left: pos(g.hour), background: g.color }}>
            {g.initial}
          </span>
        ))}
        <span className="avatar timeline__you" style={{ left: pos(f.arrivalHour) }}>M</span>
        <span className="timeline__you-label" style={{ left: pos(f.arrivalHour) }}>You · {f.to.time}</span>
        <div className="timeline__ticks">
          {ticks.map((t, i) => (
            <span key={t} style={{ left: `${(i / 6) * 100}%` }}>{t}</span>
          ))}
        </div>
      </div>
      <p className="callout">
        <strong>Looks good.</strong> The group lands between {f.groupWindow.label} and you land at {f.to.time}, so no one
        waits alone at the airport. Romi will share a meet-up spot once all {trip.travelerCount} travelers approve.
      </p>
    </section>
  )
}

function BoardingPass() {
  return (
    <section className="pass" aria-label={`Your flight: ${f.airline} ${f.number}`}>
      <div className="pass__head">
        <div>
          <p className="pass__eyebrow">Boarding pass · {f.traveler}</p>
          <p className="pass__trip">{trip.name}</p>
        </div>
        <p className="pass__number">{f.number}</p>
      </div>
      <div className="pass__route">
        <div>
          <p className="pass__label">From</p>
          <p className="pass__code">{f.from.code}</p>
          <p className="muted small">{f.from.city}</p>
          <p className="strong">{f.from.time}</p>
          <p className="muted small">{f.from.date}</p>
        </div>
        <div className="pass__mid">
          <p className="pass__dur">{f.duration} · {f.stops}</p>
          <span className="pass__path" aria-hidden="true" />
          <p className="muted small">{f.airline}</p>
        </div>
        <div className="right">
          <p className="pass__label">To</p>
          <p className="pass__code">{f.to.code}</p>
          <p className="muted small">{f.to.city}</p>
          <p className="strong">{f.to.time} <span className="muted small">local</span></p>
          <p className="muted small">{f.to.date}</p>
        </div>
      </div>
      <dl className="pass__details">
        <div><dt>Class</dt><dd>{f.cabin}</dd></div>
        <div><dt>Baggage</dt><dd>{f.baggage}</dd></div>
        <div><dt>Seat</dt><dd>{f.seat}</dd></div>
        <div><dt>Your cost</dt><dd className="text-green big">${f.cost}</dd></div>
      </dl>
    </section>
  )
}

export default function Approve() {
  const { approval, setApproval } = useTraveler()
  const [mode, setMode] = useState(null) // 'note' | 'alternative' | null
  const [note, setNote] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const backRef = useRef(null)
  const approvedCount = f.approved + (approval === 'approved' ? 1 : 0)

  const closeDialog = useCallback(() => setConfirmOpen(false), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const confirm = () => {
    setApproval('approved')
    setConfirmOpen(false)
    setMode(null)
    setToast('Flight approved. You can undo for 10 minutes.')
  }
  const undo = () => {
    setApproval(null)
    setToast('Approval undone. Nothing was booked.')
  }

  return (
    <Layout
      title={
        <>
          <span className="hide-sm">{approval === 'approved' ? 'You approved · ' : 'Awaiting your response · '}</span>
          <strong className="text-orange">{approvedCount} of {trip.travelerCount} approved</strong>
        </>
      }
      progress={{ done: approvedCount, total: 5, label: 'have approved their flight' }}
    >
      <Eyebrow>Flight review</Eyebrow>
      <h1>Your flight to Barcelona</h1>

      <div className="banner">
        <span className="avatar" style={{ background: '#4A7A86' }} aria-hidden="true">A</span>
        <div>
          <p>
            <strong>Alex picked Package A</strong> for the group. Review your flight and respond. Romi books only once
            everyone signs off.
          </p>
          <p className="muted small">10 min ago · {f.approved} of 5 have already approved</p>
        </div>
      </div>

      <BoardingPass />
      <ArrivalCheck />

      <section aria-labelledby="resp-title">
        <h2 id="resp-title" className="eyebrow">Your response</h2>
        {approval === 'approved' ? (
          <div className="approved-card" role="status">
            <span className="approved-card__icon" aria-hidden="true">✓</span>
            <div>
              <p className="strong">You approved this flight</p>
              <p className="muted small">
                Romi books it once all 5 travelers approve. {note && `Your note to Alex: "${note}"`}
              </p>
            </div>
            <Button variant="secondary" onClick={undo}>Undo</Button>
          </div>
        ) : (
          <div className="stack stack--sm">
            <button type="button" className="response response--approve" onClick={() => setConfirmOpen(true)}>
              <span className="response__icon" aria-hidden="true">✓</span>
              <span>
                <span className="response__title">Approve this flight</span>
                <span className="response__note">Opens a final check of the cost and policy before anything is booked.</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="response response--note"
              aria-expanded={mode === 'note'}
              aria-controls="note-panel"
              onClick={() => setMode(mode === 'note' ? null : 'note')}
            >
              <span className="response__icon" aria-hidden="true">~</span>
              <span>
                <span className="response__title">Approve with a note</span>
                <span className="response__note">e.g. "Can someone meet me at the apartment?" Alex sees this when locking.</span>
              </span>
              <span aria-hidden="true">{mode === 'note' ? '−' : '+'}</span>
            </button>
            {mode === 'note' && (
              <div id="note-panel" className="inline-panel">
                <label htmlFor="note" className="field__label">Note for Alex</label>
                <textarea id="note" className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                <Button onClick={() => setConfirmOpen(true)} disabled={!note.trim()}>
                  Approve with note →
                </Button>
              </div>
            )}

            <button
              type="button"
              className="response response--alt"
              aria-expanded={mode === 'alternative'}
              aria-controls="alt-panel"
              onClick={() => setMode(mode === 'alternative' ? null : 'alternative')}
            >
              <span className="response__icon" aria-hidden="true">✗</span>
              <span>
                <span className="response__title">This doesn't work, suggest an alternative</span>
                <span className="response__note">Search flights inside the group's arrival window. Sent back to Alex for review.</span>
              </span>
              <span aria-hidden="true">↻</span>
            </button>
            {mode === 'alternative' && (
              <div id="alt-panel" className="inline-panel">
                <p>
                  Romi will search for flights from AUS that land between <strong>{f.groupWindow.label}</strong> and stay under
                  your private budget. Alex gets your suggestion without seeing your budget.
                </p>
                <Button variant="secondary" onClick={() => setToast('Searching alternatives. We will notify you when options are ready.')}>
                  Search alternatives
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <Dialog
        open={confirmOpen}
        onClose={closeDialog}
        labelledBy="confirm-title"
        describedBy="confirm-desc"
        initialFocusRef={backRef}
      >
        <p className="eyebrow">Before Romi books</p>
        <h2 id="confirm-title" className="h2">Confirm your flight and payment</h2>
        <p id="confirm-desc" className="lede">
          Approving means Romi can charge your card once all {trip.travelerCount} travelers approve. Check the details below.
        </p>
        <dl className="summary">
          <div><dt>Flight</dt><dd>{f.airline} {f.number} · {f.from.code} → {f.to.code} via MAD</dd></div>
          <div><dt>Departs</dt><dd>{f.from.date} · {f.from.time} (Austin)</dd></div>
          <div><dt>Arrives</dt><dd>{f.to.date} · {f.to.time} (Barcelona)</dd></div>
          <div><dt>Fare</dt><dd>{f.cabin} · {f.baggage}</dd></div>
          <div><dt>Payment</dt><dd>Card on file {f.card}</dd></div>
          <div className="summary__total"><dt>Your total</dt><dd>${f.cost}.00 incl. taxes</dd></div>
        </dl>
        {mode === 'note' && note.trim() && <p className="callout">Your note to Alex: "{note.trim()}"</p>}
        <p className="callout callout--info">
          Free cancellation for 24 hours after booking. After that, changes cost $75 plus any fare difference. You can undo
          this approval for 10 minutes.
        </p>
        <div className="dialog__actions">
          <button type="button" ref={backRef} className="btn btn--secondary" onClick={closeDialog}>Back to review</button>
          <button type="button" className="btn btn--primary" onClick={confirm}>Confirm and approve · ${f.cost}</button>
        </div>
      </Dialog>

      <Toast message={toast} actionLabel={approval === 'approved' && toast?.startsWith('Flight approved') ? 'Undo' : null} onAction={undo} onDismiss={dismissToast} />
    </Layout>
  )
}
