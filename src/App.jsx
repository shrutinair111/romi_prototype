import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toast } from './components/ui.jsx'
import { AppProvider, useApp } from './state.jsx'
import Join from './pages/Join.jsx'
import Availability from './pages/Availability.jsx'
import Budget from './pages/Budget.jsx'
import FlightPrefs from './pages/FlightPrefs.jsx'
import Approve from './pages/Approve.jsx'
import Screens from './pages/Screens.jsx'
import Welcome from './pages/org/Welcome.jsx'
import NewBasics from './pages/org/NewBasics.jsx'
import NewDates from './pages/org/NewDates.jsx'
import NewTravelers from './pages/org/NewTravelers.jsx'
import NewTools from './pages/org/NewTools.jsx'
import Overview from './pages/org/Overview.jsx'
import Travelers from './pages/org/Travelers.jsx'
import Dates from './pages/org/Dates.jsx'
import Flights from './pages/org/Flights.jsx'

const TITLES = {
  '/': 'Welcome',
  '/new/basics': 'New trip · Basics',
  '/new/dates': 'New trip · Dates',
  '/new/travelers': 'New trip · Travelers',
  '/new/tools': 'New trip · Planning tools',
  '/join': 'Join trip',
  '/availability': 'Your availability',
  '/budget': 'Your budget',
  '/flight-preferences': 'Flight preferences',
  '/approve': 'Review your flight',
  '/trip': 'Trip overview',
  '/trip/travelers': 'Travelers',
  '/trip/dates': 'Date availability',
  '/trip/flights': 'Flights',
  '/screens': 'Screen index',
}

// On every route change: update the document title (WCAG 2.4.2) and move focus to the
// page heading so screen reader and keyboard users start at the top of the new page.
function RouteFocus() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    document.title = `${TITLES[pathname] || 'Romi'} · Romi`
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    const h1 = document.querySelector('h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }, [pathname])
  return null
}

function GlobalToast() {
  const { toast, dismissToast } = useApp()
  return <Toast toast={toast} onDismiss={dismissToast} />
}

export default function App() {
  return (
    <AppProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <RouteFocus />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/new/basics" element={<NewBasics />} />
        <Route path="/new/dates" element={<NewDates />} />
        <Route path="/new/travelers" element={<NewTravelers />} />
        <Route path="/new/tools" element={<NewTools />} />
        <Route path="/join" element={<Join />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/flight-preferences" element={<FlightPrefs />} />
        <Route path="/approve" element={<Approve />} />
        <Route path="/trip" element={<Overview />} />
        <Route path="/trip/travelers" element={<Travelers />} />
        <Route path="/trip/dates" element={<Dates />} />
        <Route path="/trip/flights" element={<Flights />} />
        <Route path="/screens" element={<Screens />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalToast />
    </AppProvider>
  )
}
