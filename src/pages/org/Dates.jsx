import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NudgeDialog from '../../components/NudgeDialog.jsx'
import OrgLayout from '../../components/OrgLayout.jsx'
import { Avatar, Button, Dialog, InfoTip } from '../../components/ui.jsx'
import { windows } from '../../data.js'
import { useApp } from '../../state.jsx'

const COLS = [
  ['yes', 'Free'],
  ['maybe', 'Maybe'],
  ['no', "Can't go"],
  ['none', 'No reply'],
]

// TM-07 · Group availability. Counts only, never who answered what (audit fix C1).
export default function Dates() {
  const { trip, travelers, stats, datesLocked, setDatesLocked, lockedWindow, setPackageSent, notify, log } = useApp()
  const [confirmFor, setConfirmFor] = useState(null)
  const [nudgeFor, setNudgeFor] = useState([])
  const keepRef = useRef(null)
  const navigate = useNavigate()
  const closeConfirm = useCallback(() => setConfirmFor(null), [])
  const closeNudge = useCallback(() => setNudgeFor([]), [])

  const best = stats.best
  const noReply = travelers.filter((t) => !Object.keys(t.availability || {}).length)
  const cheapest = Math.min(...windows.map((w) => w.price))
  const c = best.counts

  const lock = () => {
    const w = confirmFor
    setDatesLocked(w.id)
    setPackageSent(false)
    setConfirmFor(null)
    log('you', `locked ${w.short}`)
    notify(`Dates locked: ${w.short}. All ${stats.total} travelers notified, flight search started.`)
    navigate('/trip/flights')
  }
  const unlock = () => {
    const was = datesLocked
    setDatesLocked(false)
    setPackageSent(false)
    log('you', 'reopened date voting')
    notify('Dates unlocked. Voting is open again.', { actionLabel: 'Undo', onAction: () => setDatesLocked(was) })
  }

  return (
    <OrgLayout
      eyebrow="Module · Dates"
      title="Date availability"
      badge={
        datesLocked ? (
          <span className="status-pill status-pill--green">Locked · {lockedWindow.short}</span>
        ) : (
          <span className="status-pill status-pill--orange">{stats.dates} of {stats.total} responded</span>
        )
      }
      actions={
        datesLocked ? (
          <>
            <Button variant="secondary" onClick={unlock}>Unlock dates</Button>
            <Button to="/trip/flights">Go to flights →</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => notify('Results are up to date. Romi re-scores every time someone answers.')}>Refresh results</Button>
            <Button onClick={() => setConfirmFor(best)}>Lock dates →</Button>
          </>
        )
      }
      aside={
        <>
          <section aria-labelledby="rr-title">
            <h2 id="rr-title" className="eyebrow">Response rate</h2>
            <div className="mini-card">
              <p className="split-head">
                <span><strong className="big-num">{stats.dates}</strong>/{stats.total}</span>
                <strong className="text-green">{Math.round((stats.dates / stats.total) * 100)}%</strong>
              </p>
              <p className="muted small">submitted availability</p>
              <span className="mini-bar mini-bar--light" aria-hidden="true"><span style={{ width: `${(stats.dates / stats.total) * 100}%` }} /></span>
            </div>
          </section>
          {noReply.length > 0 && !datesLocked && (
            <section aria-labelledby="block-title">
              <h2 id="block-title" className="eyebrow eyebrow--orange">Blocking progress</h2>
              <div className="block-card">
                {noReply.map((t) => (
                  <p key={t.id} className="block-card__who">
                    <Avatar person={t} />
                    <span>
                      <strong className="block">{t.name} hasn't responded</strong>
                      <span className="small">{t.resent ? 'Invite re-sent just now' : 'Last reminded 18 hrs ago'}</span>
                    </span>
                  </p>
                ))}
                <Button className="btn--block" onClick={() => setNudgeFor(noReply)}>
                  Nudge {noReply.map((t) => t.name.split(' ')[0]).join(' and ')} now
                </Button>
                <p className="small">You can lock dates without them. They'll see the dates as decided when they open the link.</p>
              </div>
            </section>
          )}
          <section aria-labelledby="ts-title">
            <h2 id="ts-title" className="eyebrow">Trip summary</h2>
            <dl className="summary summary--plain">
              <div><dt>Destination</dt><dd><span aria-hidden="true">{trip.flag} </span>Barcelona</dd></div>
              <div><dt>{datesLocked ? 'Locked' : 'Recommending'}</dt><dd className="text-green">{(lockedWindow || best).short}</dd></div>
              <div><dt>Length</dt><dd>7 nights</dd></div>
              <div><dt>Days out</dt><dd>42 days</dd></div>
            </dl>
          </section>
        </>
      }
    >
      <div className="table-card">
        <table className="heat-table">
          <caption className="sr-only">
            How many travelers are free for each date window. Counts only, individual answers are private.
          </caption>
          <thead>
            <tr>
              <th scope="col">Window</th>
              {COLS.map(([k, label]) => (
                <th key={k} scope="col" className="center">{label}</th>
              ))}
              <th scope="col" className="right">
                Match
              </th>
              <th scope="col"><span className="sr-only">Choose</span></th>
            </tr>
          </thead>
          <tbody>
            {stats.heat.map((w) => {
              const isBest = w.id === best.id
              const isLocked = datesLocked === w.id
              return (
                <tr key={w.id} className={`${isBest ? 'is-best' : ''} ${isLocked ? 'is-locked' : ''}`}>
                  <th scope="row">
                    <span className="heat-window">
                      <span className="heat-window__label">
                        {w.short}
                        {isBest && <span className="badge badge--green">★ Best</span>}
                        {isLocked && <span className="badge badge--teal">Locked</span>}
                      </span>
                      <span className="muted small block">{w.detail}</span>
                      <span className="heat-window__fit">
                        Fit score <strong>{w.fit}</strong>/10
                      </span>
                    </span>
                  </th>
                  {COLS.map(([k, label]) => (
                    <td key={k} className="center" data-label={label}>
                      <span className={`heat-cell heat-cell--${k} ${w.counts[k] === 0 ? 'is-zero' : ''}`}>
                        {w.counts[k]}
                        <span className="sr-only"> {label.toLowerCase()}</span>
                      </span>
                    </td>
                  ))}
                  <td className="right" data-label="Match">
                    <strong className="heat-match">{w.match}%</strong>
                    <span className="muted small block">fit</span>
                  </td>
                  <td className="right">
                    {!datesLocked && (
                      <Button size="sm" variant={isBest ? 'primary' : 'secondary'} onClick={() => setConfirmFor(w)}>
                        Lock<span className="sr-only"> {w.short}</span>
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small heat-note">
        Counts only. Romi never shows who answered what, so travelers can say no honestly.{' '}
        <span className="nowrap">
          What's a fit score? <InfoTip label="Fit score">How well a window suits the group, out of 10. It weighs who is free, who is a maybe, and flight cost.</InfoTip>
        </span>
      </p>

      {!datesLocked && (
        <section className="recommend" aria-labelledby="rec-title">
          <span className="recommend__icon" aria-hidden="true">✈</span>
          <div className="recommend__body">
            <p className="eyebrow eyebrow--green">★ Romi recommends</p>
            <h2 id="rec-title" className="recommend__title">{best.label}</h2>
            <p>
              {c.yes} of {stats.total} travelers are free{c.maybe ? `, ${c.maybe} ${c.maybe > 1 ? 'are maybes' : 'is a maybe'}` : ''}
              {c.none ? ` and ${c.none} ${c.none > 1 ? "haven't" : "hasn't"} replied yet` : ''}.
              {best.price === cheapest && ' It also has the lowest average flight cost of the three windows.'}
            </p>
            <ul className="tag-row" aria-label="Why this window">
              <li className="tag-chip tag-chip--green">★ Best group availability</li>
              {best.price === cheapest && <li className="tag-chip tag-chip--teal">Lowest avg flight cost</li>}
              <li className="tag-chip">Includes full weekend</li>
            </ul>
            <div className="recommend__actions">
              <Button variant="success" onClick={() => setConfirmFor(best)}>Lock {best.short} ✓</Button>
              <Button variant="ghost" onClick={() => notify(`Voting stays open. Romi will nudge ${noReply.map((t) => t.name.split(' ')[0]).join(' and ') || 'the group'} again in 4 hrs.`)}>
                Keep open{noReply.length ? `, wait for ${noReply.map((t) => t.name.split(' ')[0]).join(' and ')}` : ''}
              </Button>
            </div>
            <ul className="checklist checklist--two" aria-label="What happens when you lock">
              <li><span aria-hidden="true">✓</span> All {stats.total} travelers notified instantly</li>
              <li><span aria-hidden="true">✓</span> Flight search starts with the locked dates</li>
              <li><span aria-hidden="true">✓</span> Dashboard shows "Dates: Locked"</li>
              <li><span aria-hidden="true">✓</span> You can unlock within 24 hours if plans change</li>
            </ul>
          </div>
        </section>
      )}

      <Dialog open={!!confirmFor} onClose={closeConfirm} labelledBy="lock-title" describedBy="lock-desc" initialFocusRef={keepRef}>
        {confirmFor && (
          <>
            <h2 id="lock-title" className="h2">Lock {confirmFor.short} for everyone?</h2>
            <p id="lock-desc" className="lede">
              All {stats.total} travelers get a notification and the flight search starts.
              {noReply.length > 0 && ` ${noReply.map((t) => t.name.split(' ')[0]).join(' and ')} ${noReply.length > 1 ? "haven't" : "hasn't"} replied yet, so they'll see these dates as decided.`}
              {confirmFor.counts.no > 0 && ` ${confirmFor.counts.no} traveler${confirmFor.counts.no > 1 ? 's' : ''} can't make this window.`}
            </p>
            <p className="callout callout--info">You can unlock the dates within 24 hours. After that, unlocking means rebooking flights.</p>
            <div className="dialog__actions">
              <button type="button" ref={keepRef} className="btn btn--secondary" onClick={closeConfirm}>Keep voting open</button>
              <button type="button" className="btn btn--success" onClick={lock}>Lock dates and notify all {stats.total}</button>
            </div>
          </>
        )}
      </Dialog>
      <NudgeDialog people={nudgeFor} onClose={closeNudge} />
    </OrgLayout>
  )
}
