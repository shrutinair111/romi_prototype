import { createContext, useContext, useState } from 'react'

const TravelerContext = createContext(null)

// Holds the traveler's answers across steps so Back/Continue keep their choices.
export function TravelerProvider({ children }) {
  const [profile, setProfile] = useState({ name: 'Marcus Bell', contact: 'marcus.b@email.com' })
  const [availability, setAvailability] = useState({ A: 'yes', C: 'maybe' })
  const [budget, setBudget] = useState({ min: 600, max: 1200, preset: 'custom', skipped: false })
  const [prefs, setPrefs] = useState({
    airport: 'AUS',
    nearby: true,
    arrival: 'morning',
    checks: { noRedEye: true },
  })
  const [approval, setApproval] = useState(null) // null | 'approved' | 'note' | 'alternative'

  return (
    <TravelerContext.Provider
      value={{ profile, setProfile, availability, setAvailability, budget, setBudget, prefs, setPrefs, approval, setApproval }}
    >
      {children}
    </TravelerContext.Provider>
  )
}

export function useTraveler() {
  return useContext(TravelerContext)
}
