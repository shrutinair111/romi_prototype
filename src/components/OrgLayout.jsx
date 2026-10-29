import { Link, NavLink } from 'react-router-dom'
import { otherTrips } from '../data.js'
import { useApp } from '../state.jsx'
import { Logo } from './ui.jsx'

const NAV_ICONS = {
  overview: <circle cx="12" cy="12" r="8" />,
  travelers: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></>,
  dates: <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  flights: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />,
  budget: <path d="M14.5 9.5c-.4-1-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.5-2.5-1.5M12 5v14" />,
  stays: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
}

function Icon({ name }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {NAV_ICONS[name]}
    </svg>
  )
}

/**
 * Shell for the organizer's trip workspace (TM-06 to TM-10).
 * Desktop: dark sidebar with trips + trip navigation. Mobile: top bar + scrollable tab row.
 */
export default function OrgLayout({ eyebrow, title, badge, actions, hero, children, aside }) {
  const { trip, stats, travelers } = useApp()
  const pending = travelers.filter((t) => !t.you && (t.joined !== 'yes' || t.budget === 'pending' || !t.flight)).length
  const nav = [
    { to: '/trip', label: 'Overview', icon: 'overview', end: true },
    { to: '/trip/travelers', label: 'Travelers', icon: 'travelers', badge: pending },
    { to: '/trip/dates', label: 'Dates', icon: 'dates' },
    { to: '/trip/flights', label: 'Flights', icon: 'flights' },
  ]
  const soon = [
    { label: 'Budget', icon: 'budget' },
    { label: 'Stays', icon: 'stays' },
  ]
  const links = (
    <>
      {nav.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className="org-nav__link">
          <Icon name={n.icon} />
          <span>{n.label}</span>
          {n.badge ? (
            <span className="org-nav__badge">
              {n.badge}
              <span className="sr-only"> need attention</span>
            </span>
          ) : null}
        </NavLink>
      ))}
      {soon.map((n) => (
        <span key={n.label} className="org-nav__link org-nav__link--soon" aria-disabled="true">
          <Icon name={n.icon} />
          <span>{n.label}</span>
          <span className="org-nav__soon">Soon</span>
        </span>
      ))}
    </>
  )

  return (
    <div className="shell shell--org">
      <aside className="sidebar" aria-label="Trips and navigation">
        <Link to="/" className="sidebar__logo" aria-label="Romi home">
          <Logo onDark height={44} />
        </Link>
        <section aria-labelledby="my-trips">
          <p id="my-trips" className="eyebrow eyebrow--dark">My trips</p>
          <ul className="trip-list">
            <li className="trip-list__item trip-list__item--active">
              <Link to="/trip" aria-current="true">
                <span className="trip-list__name">{trip.name}</span>
                <span className="trip-list__when">{trip.datesLong}</span>
                <span className="mini-bar" aria-hidden="true"><span style={{ width: `${stats.planning}%` }} /></span>
                <span className="sr-only">{stats.planning}% planned</span>
              </Link>
            </li>
            {otherTrips.map((t) => (
              <li key={t.name} className="trip-list__item">
                <span className="trip-list__name">{t.name}</span>
                <span className="trip-list__when">{t.when}</span>
                <span className="mini-bar" aria-hidden="true"><span style={{ width: `${t.progress * 100}%` }} /></span>
              </li>
            ))}
          </ul>
          <Link to="/new/basics" className="new-trip">+ New trip</Link>
        </section>
        <nav className="org-nav" aria-label={`${trip.name} sections`}>
          <p className="eyebrow eyebrow--dark">Barcelona</p>
          {links}
        </nav>
        <div className="sidebar__user">
          <span className="avatar" style={{ background: '#4A7A86' }} aria-hidden="true">A</span>
          <span>
            <span className="block strong-light">{trip.organizer}</span>
            <span className="sidebar__email">{trip.organizerEmail}</span>
          </span>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar topbar--org">
          <Link to="/" className="topbar__logo" aria-label="Romi home">
            <Logo height={32} />
          </Link>
          <p className="topbar__count">{trip.name}</p>
        </header>
        <nav className="org-tabs" aria-label={`${trip.name} sections`}>
          {links}
        </nav>

        {hero}
        {(title || actions) && (
          <div className="page-head">
            <div>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <div className="page-head__title">
                <h1 className="h1-sm">{title}</h1>
                {badge}
              </div>
            </div>
            {actions && <div className="page-head__actions">{actions}</div>}
          </div>
        )}
        <div className={`content content--org ${aside ? 'content--split content--org-split' : ''}`}>
          <main id="main" className="content__main">
            {children}
          </main>
          {aside && <aside className="content__aside">{aside}</aside>}
        </div>
      </div>
    </div>
  )
}
