import { useState } from 'react'
import { Link } from 'react-router-dom'
import OrgLayout from '../../components/OrgLayout.jsx'
import { Avatar, Button, InfoTip } from '../../components/ui.jsx'
import { useApp } from '../../state.jsx'

const ADJUST = ['Loosen 2-hr arrival window', 'Allow nearby airports', 'Drop "non-stop only"', 'Require a tighter arrival match']
const SORTS = {
  match: { label: 'Arrival match', fn: (a, b) => b.match - a.match },
  price: { label: 'Lowest total price', fn: (a, b) => a.total - b.total },
}

function PackageCard({ p, selected, onSelect, expanded, onToggle, travelers }) {
  const who = (id) => travelers.find((t) => t.id === id)
  const headId = `pkg-${p.id}-title`
  return (
    <section className={`package ${selected ? 'package--selected' : ''}`} aria-labelledby={headId}>
      <div className="package__head">
        <span className="tag tag--lg" aria-hidden="true">{p.id}</span>
        <div className="package__title-wrap">
          <h2 id={headId} className="package__title">
            <span className="sr-only">Package {p.id}: </span>
            {p.title}
            {p.pick && <span className="badge badge--teal">★ Romi pick</span>}
            {p.warning && <span className="badge badge--warn">⚠ {p.warning}</span>}
          </h2>
          <p className="small">{p.summary}</p>
        </div>
        <p className="package__match">
          <span className="eyebrow">Arrival match</span>
          <strong>{p.match}%</strong>
        </p>
        {!p.pick && (
          <button type="button" className="btn btn--secondary btn--sm" aria-expanded={expanded} aria-controls={`pkg-${p.id}-body`} onClick={onToggle}>
            {expanded ? 'Collapse' : 'Expand'}
            <span className="sr-only"> package {p.id}</span>
          </button>
        )}
      </div>

      {expanded && (
        <div id={`pkg-${p.id}-body`}>
          {p.flights[0].departs ? (
            <div className="table-scroll">
              <table className="flight-table">
                <caption className="sr-only">Flights in package {p.id}. Other travelers' costs and home cities are private.</caption>
                <thead>
                  <tr>
                    <th scope="col">Traveler</th>
                    <th scope="col">Departs</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Arrives BCN</th>
                    <th scope="col">Airline</th>
                    <th scope="col" className="right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {p.flights.map((f) => {
                    const t = who(f.who)
                    return [
                      <tr key={f.who}>
                        <th scope="row"><span className="person-cell"><Avatar person={t} size="sm" /> {t.name.split(' ')[0]}{t.you && <span className="you-tag">You</span>}</span></th>
                        <td className="nowrap">{f.departs}</td>
                        <td className="nowrap">{f.duration}<span className="muted small block">{f.stops}</span></td>
                        <td className="nowrap"><strong>{f.arrives}</strong><sup className="muted" aria-hidden="true">+1</sup><span className="sr-only"> next day</span></td>
                        <td>{f.airline}</td>
                        <td className="right">{t.you ? <strong>${f.cost}</strong> : <span className="private-tag">Private</span>}</td>
                      </tr>,
                      f.note && (
                        <tr key={`${f.who}-note`} className="flight-table__note">
                          <td colSpan={6}><span>{f.note}</span></td>
                        </tr>
                      ),
                    ]
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="arrivals">
              {p.flights.map((f) => {
                const t = who(f.who)
                return (
                  <li key={f.who}>
                    <Avatar person={t} size="sm" /> {t.name.split(' ')[0]} <span className="muted">lands</span> <strong>{f.arrives}</strong>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="package__foot">
            <p><span className="eyebrow">Group total</span><strong>${p.total.toLocaleString('en-US')}</strong></p>
            <p><span className="eyebrow">Avg / person</span><strong>${p.avg}</strong></p>
            <p><span className="eyebrow">Arrival spread</span><strong>{p.spread}</strong></p>
            <button type="button" className={`btn ${selected ? 'btn--success' : 'btn--primary'} package__select`} aria-pressed={selected} onClick={onSelect}>
              {selected ? `✓ Package ${p.id} selected` : `Select Package ${p.id}`}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// TM-08 · Flight coordination
export default function Flights() {
  const { travelers, stats, packages, datesLocked, lockedWindow, selectedPackage, setSelectedPackage, packageSent, setPackageSent, notify, log } = useApp()
  const [sort, setSort] = useState('match')
  const [expanded, setExpanded] = useState({ A: true })
  const [adjust, setAdjust] = useState({})
  const [within, setWithin] = useState('2')
  const changes = Object.values(adjust).filter(Boolean).length

  if (!datesLocked) {
    return (
      <OrgLayout eyebrow="Module · Flights" title="Flights" badge={<span className="status-pill status-pill--gray">Waiting on dates</span>}>
        <div className="empty empty--big">
          <p className="h3">Lock your dates first</p>
          <p>Romi searches flights from all 5 home airports once the group has dates. {stats.dates} of {stats.total} travelers have answered so far.</p>
          <Button to="/trip/dates">Go to dates →</Button>
        </div>
      </OrgLayout>
    )
  }

  const sorted = [...packages].sort(SORTS[sort].fn)
  const send = () => {
    setPackageSent(true)
    log('you', `sent Package ${selectedPackage} to the group`)
    notify(`Package ${selectedPackage} sent to all ${stats.total} travelers for approval.`, {
      actionLabel: 'Undo',
      onAction: () => setPackageSent(false),
    })
  }

  return (
    <OrgLayout
      eyebrow="Module · Flights"
      title="Flights"
      badge={<span className="status-pill status-pill--green">Dates locked · {lockedWindow.short}</span>}
      actions={
        <>
          <label className="sort">
            <span className="sr-only">Sort packages by</span>
            <select className="input input--sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v.label}</option>)}
            </select>
          </label>
          {packageSent ? (
            <Button to="/approve" variant="secondary">Preview traveler view →</Button>
          ) : (
            <Button onClick={send}>Send Package {selectedPackage} to group →</Button>
          )}
        </>
      }
      aside={
        <>
          <section aria-labelledby="sync-title">
            <h2 id="sync-title" className="eyebrow">Group arrival sync</h2>
            <div className="mini-card">
              <label htmlFor="within" className="muted small">Everyone lands within</label>
              <select id="within" className="input" value={within} onChange={(e) => setWithin(e.target.value)}>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
              </select>
              <p className="muted small">
                {within === '3' ? 'Unlocks 6 more packages, with longer waits at the airport.' : within === '1' ? 'Only Package A fits a 1-hour window.' : 'Loosen to 3 hrs to unlock 6 more packages.'}
              </p>
            </div>
          </section>
          <section aria-labelledby="gb-title">
            <h2 id="gb-title" className="eyebrow">Group budget</h2>
            <div className="mini-card mini-card--cream">
              <p><strong className="big-num">$480 – $720</strong> <span className="muted small">avg/person</span></p>
              <p className="small"><span aria-hidden="true">🔒 </span><strong>Anonymous aggregate.</strong> Individual budgets are never shown, not even to you.</p>
              <p className="warn-chip"><span aria-hidden="true">⚠ </span>1 traveler near their budget ceiling</p>
            </div>
          </section>
          <section aria-labelledby="ap-title">
            <h2 id="ap-title" className="eyebrow">Approval status</h2>
            <div className="mini-card" aria-live="polite">
              <p><strong className="big-num">{packageSent ? stats.approved : 0}</strong>/{stats.total} approved</p>
              {packageSent ? (
                <>
                  <span className="mini-bar mini-bar--light" aria-hidden="true"><span style={{ width: `${(stats.approved / stats.total) * 100}%` }} /></span>
                  <p className="muted small">Romi books once everyone signs off. <Link to="/approve" className="link">See what Marcus sees</Link></p>
                </>
              ) : (
                <p className="muted small">Updates after you send a package to the group.</p>
              )}
            </div>
          </section>
        </>
      }
    >
      <div className="note note--info-left">
        <span aria-hidden="true">✈</span>
        <div>
          <strong>We found 3 group packages. In each one, everyone lands within a 2-hour window.</strong> Pick one, send it for
          approval, and Romi books individual flights once everyone signs off.
          <span className="nowrap"> <InfoTip label="Arrival match">How close together everyone lands. 100% means the whole group lands within the same hour.</InfoTip></span>
        </div>
      </div>

      {packageSent && (
        <div className="note note--success" role="status">
          <span aria-hidden="true">✓</span>
          <div><strong>Package {selectedPackage} sent.</strong> {stats.approved} of {stats.total} travelers have approved so far.</div>
        </div>
      )}

      {sorted.map((p) => (
        <PackageCard
          key={p.id}
          p={p}
          travelers={travelers}
          selected={selectedPackage === p.id}
          onSelect={() => {
            setSelectedPackage(p.id)
            if (packageSent) setPackageSent(false)
          }}
          expanded={!!expanded[p.id]}
          onToggle={() => setExpanded({ ...expanded, [p.id]: !expanded[p.id] })}
        />
      ))}

      <section className="adjust" aria-labelledby="adjust-title">
        <h2 id="adjust-title" className="adjust__title">No package perfect? Adjust and re-search:</h2>
        <div className="chip-row">
          {ADJUST.map((a) => (
            <button key={a} type="button" className="toggle-chip" aria-pressed={!!adjust[a]} onClick={() => setAdjust({ ...adjust, [a]: !adjust[a] })}>
              {adjust[a] && <span aria-hidden="true">✓ </span>}
              {a}
            </button>
          ))}
        </div>
        {changes > 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              notify(`Re-searching with ${changes} change${changes > 1 ? 's' : ''}. New packages in about a minute.`)
              setAdjust({})
            }}
          >
            Re-search with {changes} change{changes > 1 ? 's' : ''}
          </Button>
        )}
      </section>
    </OrgLayout>
  )
}
