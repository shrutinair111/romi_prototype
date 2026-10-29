import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import NudgeDialog from '../../components/NudgeDialog.jsx'
import OrgLayout from '../../components/OrgLayout.jsx'
import { Avatar, Button, InfoTip } from '../../components/ui.jsx'
import { TODAY } from '../../data.js'
import { useApp } from '../../state.jsx'

const SYMBOL = { done: '✓', pending: '…', no: '✕', skipped: '–' }
const WORD = { done: 'done', pending: 'pending', no: 'not opened', skipped: 'skipped' }

function Dot({ state, what, who }) {
  return (
    <span className={`status-dot status-dot--${state}`}>
      <span aria-hidden="true">{SYMBOL[state]}</span>
      <span className="sr-only">{who}, {what}: {WORD[state]}</span>
    </span>
  )
}

export function personStates(t) {
  if (t.joined !== 'yes') return { dates: 'no', budget: 'no', flight: 'no' }
  return {
    dates: Object.keys(t.availability || {}).length ? 'done' : 'pending',
    budget: t.budget === 'done' ? 'done' : t.budget === 'skipped' ? 'skipped' : 'pending',
    flight: t.flight ? 'done' : 'pending',
  }
}

export function ActivityFeed() {
  const { activity, travelers } = useApp()
  return (
    <ul className="activity">
      {activity.slice(0, 5).map((a) => {
        const p = travelers.find((t) => t.id === a.who)
        const name = a.who === 'you' ? 'You' : a.who === 'romi' ? 'Romi' : p?.name.split(' ')[0]
        return (
          <li key={a.id}>
            {a.who === 'romi' ? (
              <span className="avatar avatar--sm avatar--romi" aria-hidden="true">R</span>
            ) : (
              <Avatar person={a.who === 'you' ? { initial: 'Y', color: '#4A7A86' } : p} size="sm" />
            )}
            <span>
              <span className="block"><strong>{name}</strong> {a.text}</span>
              <span className="muted small">{a.when}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// TM-10 · Trip overview dashboard (Command Center)
export default function Overview() {
  const { trip, travelers, stats, datesLocked, lockedWindow, packageSent, packages, draft, resent, setResent, notify, log } = useApp()
  const [nudgeFor, setNudgeFor] = useState([])
  const closeNudge = useCallback(() => setNudgeFor([]), [])

  const days = Math.round((new Date(`${trip.start}T12:00:00`) - TODAY) / 86400000)
  const states = travelers.map((t) => ({ t, s: personStates(t) }))
  const fullyDone = states.filter(({ s }) => Object.values(s).every((v) => v === 'done' || v === 'skipped')).length
  const notOpened = travelers.filter((t) => t.joined !== 'yes')
  const pendingCount = travelers.length - fullyDone - notOpened.length
  const budgetPending = travelers.filter((t) => t.joined === 'yes' && t.budget === 'pending')
  const pick = packages[0]

  const resend = (t) => {
    setResent((r) => ({ ...r, [t.id]: true }))
    log('you', `re-sent ${t.name.split(' ')[0]}'s invite by text`)
    notify(`Invite re-sent to ${t.name.split(' ')[0]} by text message.`)
  }

  const needed = []
  if (!datesLocked) {
    needed.push({ id: 'dates', urgent: true, title: 'Lock your trip dates', body: `${stats.dates} of ${stats.total} responded. Romi recommends ${stats.best.short}.`, action: <Button to="/trip/dates" size="sm">Review →</Button> })
  } else if (!packageSent) {
    needed.push({ id: 'flights', urgent: true, title: 'Pick a flight package', body: 'Romi found 3. Your pick gets sent to the group for approval.', action: <Button to="/trip/flights" size="sm">Review →</Button> })
  } else if (stats.approved < stats.total) {
    needed.push({ id: 'approvals', title: 'Waiting on flight approvals', body: `${stats.approved} of ${stats.total} approved. Romi books once everyone signs off.`, action: <Button to="/trip/flights" variant="secondary" size="sm">View status</Button> })
  }
  if (budgetPending.length) {
    const names = budgetPending.map((t) => t.name.split(' ')[0])
    needed.push({
      id: 'budget', title: `${names.join(' & ')} ${names.length > 1 ? "haven't" : "hasn't"} set a budget`,
      body: 'Romi will auto-nudge in 4 hrs. Send now to speed it up.',
      action: <Button size="sm" onClick={() => setNudgeFor(budgetPending)}>{budgetPending.length > 1 ? 'Nudge both' : 'Nudge'}</Button>,
    })
  }
  notOpened.forEach((t) =>
    needed.push({
      id: `open-${t.id}`, title: `${t.name.split(' ')[0]} hasn't opened the invite`,
      body: resent[t.id] ? 'Re-sent by text just now.' : 'Re-send by text, or remove them from the trip if they’re out.',
      action: <Button size="sm" variant="secondary" onClick={() => resend(t)} disabled={resent[t.id]}>{resent[t.id] ? 'Sent ✓' : 'Re-send invite'}</Button>,
    }),
  )
  const budgetIncomplete = travelers.some((t) => t.joined === 'yes' && t.budget === 'pending')
  const tasksRemaining = [!datesLocked, !packageSent, budgetIncomplete, true].filter(Boolean).length

  const modules = [
    datesLocked
      ? { id: 'dates', name: 'Dates', icon: '🗓', status: 'Locked', tone: 'green', line: `${lockedWindow.short}, 2026 · 7 nights`, foot: 'You locked this · just now', to: '/trip/dates' }
      : { id: 'dates', name: 'Dates', icon: '🗓', status: 'Voting', tone: 'teal', line: `${stats.dates} of ${stats.total} responded`, foot: `Romi pick: ${stats.best.short}`, to: '/trip/dates', cta: 'Review →' },
    !datesLocked
      ? { id: 'flights', name: 'Flights', icon: '✈', status: 'Waiting', tone: 'gray', line: 'Unlocks after dates are locked', foot: 'Depends on: Dates' }
      : !packageSent
        ? { id: 'flights', name: 'Flights', icon: '✈', status: 'Review needed', tone: 'orange', line: '3 packages · awaiting your pick', foot: 'Romi pick: Package A', to: '/trip/flights', cta: 'Review →' }
        : { id: 'flights', name: 'Flights', icon: '✈', status: 'Sent', tone: 'green', line: `${stats.approved} of ${stats.total} approved`, foot: 'Package A sent to the group', to: '/trip/flights' },
    { id: 'budget', name: 'Budget', icon: '$', status: budgetIncomplete ? 'In progress' : 'Done', tone: budgetIncomplete ? 'orange' : 'green', line: `${stats.budgetDone} of ${stats.total} submitted · private to each`, foot: budgetPending.length ? `${budgetPending.map((t) => t.name.split(' ')[0]).join(' + ')} still pending` : 'Everyone has answered' },
    { id: 'stays', name: 'Stays', icon: '⌂', status: 'Not started', tone: 'gray', line: 'Unlocks after flights are picked', foot: draft.tools.stays ? 'Depends on: Flights' : 'Add anytime' },
    { id: 'itinerary', name: 'Itinerary', icon: '◆', status: 'Not started', tone: 'gray', line: 'Day-by-day planning · voting', foot: 'Opt in anytime' },
    { id: 'expenses', name: 'Expenses', icon: '◇', status: 'Not started', tone: 'gray', line: 'Track and split on the trip', foot: 'Used while traveling' },
  ]

  const hero = (
    <section className="trip-hero" aria-labelledby="trip-hero-title">
      <div>
        <p className="eyebrow eyebrow--dark">Trip · In progress · {days} days out</p>
        <h1 id="trip-hero-title" className="trip-hero__title">{trip.name}</h1>
        <p className="trip-hero__meta">
          <span>{trip.datesLong} · {trip.nights} nights</span>
          <span><span aria-hidden="true">{trip.flag} </span>{trip.destination}</span>
          <span>{stats.total} travelers</span>
        </p>
        <div className="trip-hero__people">
          <span className="avatar-stack" aria-hidden="true">
            {travelers.map((t) => <Avatar key={t.id} person={t} size="md" />)}
          </span>
          <ul className="legend legend--dark" aria-label="Traveler progress">
            <li><span className="legend__dot legend__dot--green" aria-hidden="true" />{fullyDone} fully done</li>
            <li><span className="legend__dot legend__dot--orange" aria-hidden="true" />{pendingCount} pending</li>
            <li><span className="legend__dot legend__dot--red" aria-hidden="true" />{notOpened.length} not opened</li>
          </ul>
        </div>
      </div>
      <div className="trip-hero__actions">
        <Button variant="outline-light" onClick={() => notify('Update shared with the group chat: dates voting is open, 4 of 5 responded.')}>Share update</Button>
        <Button variant="light" to="/trip/travelers">+ Add traveler</Button>
      </div>
    </section>
  )

  return (
    <OrgLayout
      hero={hero}
      aside={
        <>
          <section aria-labelledby="status-title">
            <h2 id="status-title" className="eyebrow">Traveler status</h2>
            <div className="status-table-wrap">
              <table className="status-table">
                <caption className="sr-only">What each traveler has completed</caption>
                <thead>
                  <tr>
                    <th scope="col">Person</th>
                    <th scope="col"><span aria-hidden="true">🗓</span><span className="sr-only">Dates</span></th>
                    <th scope="col"><span aria-hidden="true">$</span><span className="sr-only">Budget</span></th>
                    <th scope="col"><span aria-hidden="true">✈</span><span className="sr-only">Flight</span></th>
                  </tr>
                </thead>
                <tbody>
                  {states.map(({ t, s }) => (
                    <tr key={t.id}>
                      <th scope="row">
                        <Avatar person={t} size="sm" /> {t.name.split(' ')[0]}
                      </th>
                      <td><Dot state={s.dates} what="Dates" who={t.name.split(' ')[0]} /></td>
                      <td><Dot state={s.budget} what="Budget" who={t.name.split(' ')[0]} /></td>
                      <td><Dot state={s.flight} what="Flight" who={t.name.split(' ')[0]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="status-legend" aria-hidden="true">
                <span>🗓 Dates</span><span>$ Budget</span><span>✈ Flight</span><span>✓ done · … pending · – skipped · ✕ not opened</span>
              </p>
            </div>
          </section>

          <section aria-labelledby="pick-title">
            <h2 id="pick-title" className="eyebrow">★ Romi flight pick</h2>
            {datesLocked ? (
              <div className="pick-card">
                <p className="h3">Package A</p>
                <p className="muted small">Iberia, BA + Level · all land Mar 15 AM</p>
                <div className="pick-card__stats">
                  <p><span className="eyebrow">Avg / person</span><strong>${pick.avg}</strong></p>
                  <p className="right">
                    <span className="eyebrow">
                      Arrival match <InfoTip label="Arrival match">How close together everyone lands. 100% means the whole group lands within the same hour.</InfoTip>
                    </span>
                    <strong>{pick.match}%</strong>
                  </p>
                </div>
                <p className="warn-chip"><span aria-hidden="true">⚠ </span>1 traveler near their budget ceiling</p>
                <Button to="/trip/flights" className="btn--block">See all 3 options →</Button>
              </div>
            ) : (
              <div className="pick-card pick-card--empty">
                <p>Flight packages appear once you lock dates. Romi will search all 5 home airports at once.</p>
                <Button to="/trip/dates" variant="secondary" className="btn--block">Go to dates</Button>
              </div>
            )}
          </section>

          <section aria-labelledby="activity-title">
            <h2 id="activity-title" className="eyebrow">Recent activity</h2>
            <ActivityFeed />
          </section>
        </>
      }
    >
      <h2 className="sr-only">Trip at a glance</h2>
      <ul className="stat-grid">
        <li className="stat stat--green"><strong>{stats.planning}%</strong><span>Planning complete</span></li>
        <li className="stat"><strong>{tasksRemaining}</strong><span>Tasks remaining</span></li>
        <li className="stat"><strong>{days}</strong><span>Days until trip</span></li>
        <li className="stat stat--orange"><strong>{needed.length}</strong><span>Actions needed <em>right now</em></span></li>
      </ul>

      <section aria-labelledby="needed-title">
        <div className="split-head">
          <h2 id="needed-title" className="eyebrow eyebrow--orange"><span aria-hidden="true">⚠ </span>Still needed</h2>
          <p className="muted small">Romi auto-nudges in <strong>4 hrs</strong></p>
        </div>
        {needed.length === 0 ? (
          <p className="empty">You're all caught up. Romi will tell you when something needs a decision.</p>
        ) : (
          <ul className="needed">
            {needed.map((n) => (
              <li key={n.id} className={`needed__item ${n.urgent ? 'needed__item--urgent' : ''}`}>
                <span className="needed__icon" aria-hidden="true">{n.urgent ? '!' : '○'}</span>
                <span className="needed__text">
                  <strong className="block">{n.title}</strong>
                  <span className="small">{n.body}</span>
                </span>
                {n.action}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="tools-title">
        <div className="split-head">
          <h2 id="tools-title" className="eyebrow">Planning tools</h2>
          <Link to="/new/tools" className="link small">+ Add tool</Link>
        </div>
        <ul className="module-grid">
          {modules.map((m) => {
            const body = (
              <>
                <span className="module__top">
                  <span className={`module__icon module__icon--${m.tone}`} aria-hidden="true">{m.icon}</span>
                  <span className={`status-pill status-pill--${m.tone}`}>{m.status}</span>
                </span>
                <span className="module__name">{m.name}</span>
                <span className="module__line">{m.line}</span>
                <span className="module__foot">
                  <span>{m.foot}</span>
                  {m.cta && <span className="module__cta" aria-hidden="true">{m.cta}</span>}
                </span>
              </>
            )
            return (
              <li key={m.id} className={`module ${m.tone === 'gray' ? 'module--muted' : ''}`}>
                {m.to ? <Link to={m.to} className="module__link">{body}</Link> : <div className="module__link">{body}</div>}
              </li>
            )
          })}
        </ul>
      </section>

      <NudgeDialog people={nudgeFor} onClose={closeNudge} />
    </OrgLayout>
  )
}
