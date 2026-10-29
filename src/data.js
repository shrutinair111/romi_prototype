// Single source of truth for the prototype scenario (audit fix C2).
// Every screen reads from here so dates, nights and flights never disagree.

export const trip = {
  name: 'Barcelona with the crew',
  destination: 'Barcelona, Spain',
  flag: '🇪🇸',
  dates: 'Mar 14–21',
  nights: 7,
  organizer: 'Alex Chen',
  code: 'BCN2026',
  travelerCount: 5,
  others: ['Alex', 'Priya', 'Jamie', 'Dev'],
}

export const windows = [
  { id: 'A', label: 'Mar 14 – Mar 21, 2026', detail: 'Sat → Sat · 7 nights', flight: '~$480', flightNote: 'incl. weekend departure', popular: true },
  { id: 'B', label: 'Mar 21 – Mar 28, 2026', detail: 'Sat → Sat · 7 nights', flight: '~$520', flightNote: 'Sat-Sat sweet spot' },
  { id: 'C', label: 'Apr 4 – Apr 11, 2026', detail: 'Sat → Sat · 7 nights', flight: '~$610', flightNote: 'Easter week, pricier' },
]

export const presets = [
  { id: 'budget', label: 'Budget', min: 400, max: 700 },
  { id: 'moderate', label: 'Moderate', min: 700, max: 1100 },
  { id: 'comfortable', label: 'Comfortable', min: 1100, max: 1800 },
  { id: 'flexible', label: 'Flexible', min: 200, max: 2500, note: 'No limit' },
]

export const budgetLimits = { min: 200, max: 2500, step: 50 }

export const breakdown = [
  { label: 'Flights', range: '$400–600', share: 0.42 },
  { label: 'Accommodation', sub: 'per person, shared', range: '$150–400', share: 0.28 },
  { label: 'Activities', range: '$50–150', share: 0.12 },
  { label: 'Food & transit', range: '$80–200', share: 0.18 },
]

export const arrivalTimes = [
  { id: 'morning', label: 'Morning', note: 'before noon' },
  { id: 'afternoon', label: 'Afternoon', note: '12 – 6 PM' },
  { id: 'evening', label: 'Evening', note: 'after 6 PM' },
  { id: 'any', label: 'No preference', note: "whatever's best" },
]

export const flightPrefs = [
  { id: 'direct', label: 'Direct flights only', note: 'May be unavailable from your origin' },
  { id: 'noRedEye', label: 'No red-eye departures', note: 'Excludes flights leaving 11pm–5am' },
  { id: 'sameAirline', label: 'Same airline as group, if possible', note: 'Romi will try to match, not guaranteed' },
  { id: 'ownFlight', label: "I'll book my own flight", note: 'Just notify me when the group locks in dates and arrival times' },
]

// Marcus's flight in Package A
export const myFlight = {
  traveler: 'Marcus Bell',
  airline: 'Iberia',
  number: 'IB 6252',
  from: { code: 'AUS', city: 'Austin, TX', time: '1:10 PM', date: 'Sat, Mar 14' },
  to: { code: 'BCN', city: 'Barcelona, ES', time: '9:15 AM', date: 'Sun, Mar 15' },
  duration: '13h 05m',
  stops: '1 stop · MAD',
  cabin: 'Economy',
  baggage: '1 carry-on',
  seat: 'Not assigned',
  cost: 487,
  card: 'ending 4417',
  groupWindow: { start: 8 + 35 / 60, end: 9 + 50 / 60, label: '8:35–9:50 AM' },
  arrivalHour: 9.25,
  approved: 2,
}

// Other travelers' arrival hours (local BCN time) for the timeline.
// Only arrival times are shown, never origins or costs (audit fix C1).
export const groupArrivals = [
  { initial: 'D', name: 'Dev', hour: 8 + 35 / 60, color: '#A84E14' },
  { initial: 'P', name: 'Priya', hour: 8 + 40 / 60, color: '#8B61B8' },
  { initial: 'A', name: 'Alex', hour: 9.75, color: '#4A7A86' },
  { initial: 'J', name: 'Jamie', hour: 9 + 50 / 60, color: '#5A7796' },
]
