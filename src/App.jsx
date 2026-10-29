import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TravelerProvider } from './state.jsx'
import Join from './pages/Join.jsx'
import Availability from './pages/Availability.jsx'
import Budget from './pages/Budget.jsx'
import FlightPrefs from './pages/FlightPrefs.jsx'
import Approve from './pages/Approve.jsx'

// On every route change, move focus to the page heading so screen reader and
// keyboard users start at the top of the new step (single-page-app focus fix).
function RouteFocus() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
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

export default function App() {
  return (
    <TravelerProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <RouteFocus />
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/flight-preferences" element={<FlightPrefs />} />
        <Route path="/approve" element={<Approve />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TravelerProvider>
  )
}
