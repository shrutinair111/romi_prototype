import { Link } from 'react-router-dom'
import { Logo } from '../components/ui.jsx'

const FLOWS = [
  {
    title: 'Flow A · Organizer onboarding',
    who: 'Alex creates the trip',
    screens: [
      ['/', 'TM-01', 'Welcome / entry', 'Create a trip, or join with a code (try BCN2026)'],
      ['/new/basics', 'TM-02', 'Trip basics', 'Name, destination, occasion, live preview'],
      ['/new/dates', 'TM-03', 'Dates & duration', 'Date window, trip length, constraints'],
      ['/new/travelers', 'TM-04', 'Add travelers', 'Share link, add people, remove with undo'],
      ['/new/tools', 'TM-05', 'Planning tools', 'Pick tools, review summary, create trip'],
    ],
  },
  {
    title: 'Flow B · Traveler onboarding',
    who: 'Marcus joins from a group-chat link',
    screens: [
      ['/join', 'TR-01', 'Join entry', 'Name and contact with inline validation'],
      ['/availability', 'TR-02', 'Submit availability', 'Yes / maybe / no per window, private'],
      ['/budget', 'TR-03', 'Submit budget', 'Private range, presets, live estimate'],
      ['/flight-preferences', 'TR-04', 'Flight preferences', 'Airport, arrival time, preferences'],
    ],
  },
  {
    title: 'Flow C · Organizer coordination',
    who: 'Alex gets the group to a decision',
    screens: [
      ['/trip/travelers', 'TM-06', 'Traveler management', 'Status table, nudge preview, add traveler'],
      ['/trip/dates', 'TM-07', 'Group availability', 'Anonymous counts, recommendation, lock dialog'],
      ['/trip/flights', 'TM-08', 'Flight coordination', 'Packages, private costs, send to group'],
      ['/approve', 'TM-09', 'Flight approval (traveler)', 'Boarding pass, arrival check, confirm and undo'],
    ],
  },
  {
    title: 'Flow D · Command center',
    who: 'Alex sees everything at a glance',
    screens: [['/trip', 'TM-10', 'Trip overview dashboard', 'Still-needed actions, tool status, activity']],
  },
]

export default function Screens() {
  return (
    <div className="screens">
      <header className="screens__head">
        <Link to="/" aria-label="Romi home"><Logo height={44} /></Link>
        <div>
          <h1>Prototype screen index</h1>
          <p className="lede">
            Both sides share one live data store: answer availability as Marcus, then open the organizer's date heatmap and the
            counts update. Refresh the page to reset everything.
          </p>
        </div>
      </header>
      <div className="screens__grid">
        {FLOWS.map((f) => (
          <section key={f.title} className="screens__flow" aria-labelledby={f.title}>
            <h2 id={f.title} className="h3">{f.title}</h2>
            <p className="muted small">{f.who}</p>
            <ul>
              {f.screens.map(([to, id, name, desc]) => (
                <li key={to}>
                  <Link to={to} className="screens__link">
                    <span className="tag">{id.split('-')[1]}</span>
                    <span>
                      <span className="strong block">{id} · {name}</span>
                      <span className="muted small">{desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
