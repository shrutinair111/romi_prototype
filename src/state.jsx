import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { initialActivity, packages, people, trip as tripData, windows } from './data.js'

const AppContext = createContext(null)

/**
 * One store for both sides of the prototype.
 * The traveler flow (Marcus) and the organizer flow (Alex) read the same data,
 * so answering availability as Marcus changes the counts Alex sees on the heatmap.
 */
export function AppProvider({ children }) {
  // ----- Traveler (Marcus) -----
  const [profile, setProfile] = useState({ name: 'Marcus Bell', contact: 'marcus.b@email.com' })
  const [availability, setAvailability] = useState({ A: 'yes', C: 'maybe' })
  const [budget, setBudget] = useState({ min: 600, max: 1200, preset: 'custom', saved: false, skipped: false })
  const [prefs, setPrefs] = useState({ airport: 'AUS', nearby: true, arrival: 'morning', checks: { noRedEye: true }, saved: false })
  const [approval, setApproval] = useState(null) // null | 'approved'

  // ----- Organizer (Alex) -----
  const [draft, setDraft] = useState({
    name: tripData.name,
    destination: tripData.destination,
    occasion: 'fun',
    dateMode: 'specific',
    start: '2026-03-10',
    end: '2026-04-15',
    duration: 'week',
    constraints: { weekend: true },
    invitees: [
      { id: 'marcus', name: 'Marcus Bell', contact: 'marcus.b@email.com' },
      { id: 'priya', name: 'Priya Shah', contact: '+1 (415) 555-0148' },
      { id: 'dev', name: 'Dev Patel', contact: 'dev.patel@email.com' },
      { id: 'jamie', name: 'Jamie Wu', contact: 'jamie@email.com' },
    ],
    tools: { dates: true, flights: true, budget: true },
  })
  const [datesLocked, setDatesLocked] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState('A')
  const [packageSent, setPackageSent] = useState(false)
  const [autoRemind, setAutoRemind] = useState(true)
  const [resent, setResent] = useState({})
  const [nudged, setNudged] = useState({})
  const [activity, setActivity] = useState(initialActivity)
  const [added, setAdded] = useState([])

  // ----- Global toast -----
  const [toast, setToast] = useState(null)
  const notify = useCallback((message, action) => setToast({ message, ...action, key: Date.now() }), [])
  const dismissToast = useCallback(() => setToast(null), [])
  const log = useCallback((who, text) => setActivity((a) => [{ id: String(Date.now()), who, text, when: 'Just now' }, ...a]), [])

  // Travelers with Marcus's live status merged in.
  const travelers = useMemo(
    () => [
      ...people.map((p) => {
        if (p.id !== 'marcus') return { ...p, nudged: !!nudged[p.id], resent: !!resent[p.id] }
        const budgetState = budget.saved ? 'done' : budget.skipped ? 'skipped' : 'pending'
        const note = budgetState === 'pending' ? 'Joined 2d ago · opened budget page but never submitted' : 'Joined 2d ago'
        return { ...p, availability, budget: budgetState, flight: prefs.saved, note, nudged: !!nudged.marcus }
      }),
      ...added.map((a, i) => ({
        ...a,
        initial: a.name[0].toUpperCase(),
        color: ['#4A6584', '#7A45AE', '#2F6B4C'][i % 3],
        joined: 'invite',
        availability: {},
        budget: 'pending',
        flight: false,
        note: 'Invite sent just now',
        nudged: !!nudged[a.id],
        resent: !!resent[a.id],
      })),
    ],
    [availability, budget.saved, budget.skipped, prefs.saved, nudged, resent, added],
  )

  const stats = useMemo(() => {
    const total = travelers.length
    const joined = travelers.filter((t) => t.joined === 'yes').length
    const dates = travelers.filter((t) => Object.keys(t.availability || {}).length > 0).length
    const budgetDone = travelers.filter((t) => t.budget === 'done').length
    const budgetSkipped = travelers.filter((t) => t.budget === 'skipped').length
    const flight = travelers.filter((t) => t.flight).length
    const approved = packageSent || approval ? 2 + (approval === 'approved' ? 1 : 0) : 0
    const heat = windows.map((w) => {
      const c = { yes: 0, maybe: 0, no: 0, none: 0 }
      travelers.forEach((t) => c[t.availability?.[w.id] || 'none']++)
      const cheapest = Math.min(...windows.map((x) => x.price))
      const fit = Math.min(10, Math.round(((c.yes * 2 + c.maybe) / (total * 2)) * 10 + (w.price === cheapest ? 2 : w.price < 600 ? 1 : 0)))
      return { ...w, counts: c, match: Math.round(((c.yes + c.maybe) / total) * 100), fit }
    })
    const best = [...heat].sort((a, b) => b.fit - a.fit || b.counts.yes - a.counts.yes)[0]
    const planning = Math.round(((joined + dates + budgetDone + budgetSkipped + flight) / (total * 4)) * 100)
    return { total, joined, dates, budgetDone, budgetSkipped, flight, approved, heat, best, planning }
  }, [travelers, packageSent, approval])

  const lockedWindow = datesLocked ? stats.heat.find((w) => w.id === datesLocked) : null
  const trip = useMemo(() => ({ ...tripData, name: draft.name.trim() || tripData.name }), [draft.name])

  const value = {
    trip, travelers, stats, packages,
    profile, setProfile, availability, setAvailability, budget, setBudget, prefs, setPrefs, approval, setApproval,
    draft, setDraft, datesLocked, setDatesLocked, lockedWindow, selectedPackage, setSelectedPackage,
    packageSent, setPackageSent, autoRemind, setAutoRemind, resent, setResent, nudged, setNudged,
    activity, log, toast, notify, dismissToast, added, setAdded,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

// Kept for the traveler screens.
export const useTraveler = useApp
