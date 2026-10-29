// Single source of truth for the prototype scenario (audit fix C2).
// Every screen reads from here so dates, nights, people and flights never disagree.

// Fixed "today" so the countdown and timestamps stay stable in demos.
export const TODAY = new Date('2026-01-31T12:00:00')

export const trip = {
  name: 'Barcelona with the crew',
  destination: 'Barcelona, Spain',
  flag: '🇪🇸',
  dates: 'Mar 14–21',
  datesLong: 'Mar 14 – 21, 2026',
  start: '2026-03-14',
  nights: 7,
  organizer: 'Alex Chen',
  organizerEmail: 'alex@email.com',
  code: 'BCN2026',
  link: 'romi.app/join/BCN2026',
  travelerCount: 5,
  others: ['Alex', 'Priya', 'Jamie', 'Dev'],
}

export const otherTrips = [
  { name: "Maya's bachelorette", when: 'Jul 2026', progress: 0.18 },
  { name: 'Ski trip', when: 'Mar 2027', progress: 0.04 },
]

// ---------- Traveler flow ----------
export const windows = [
  { id: 'A', label: 'Mar 14 – Mar 21, 2026', short: 'Mar 14 – 21', detail: 'Sat → Sat · 7 nights', flight: '~$480', flightNote: 'incl. weekend departure', price: 480, popular: true },
  { id: 'B', label: 'Mar 21 – Mar 28, 2026', short: 'Mar 21 – 28', detail: 'Sat → Sat · 7 nights', flight: '~$520', flightNote: 'Sat-Sat sweet spot', price: 520 },
  { id: 'C', label: 'Apr 4 – Apr 11, 2026', short: 'Apr 4 – 11', detail: 'Sat → Sat · 7 nights · Easter week', flight: '~$610', flightNote: 'Easter week, pricier', price: 610 },
]

export const presets = [
  { id: 'budget', label: 'Budget', min: 400, max: 700 },
  { id: 'moderate', label: 'Moderate', min: 700, max: 1100 },
  { id: 'comfortable', label: 'Comfortable', min: 1100, max: 1800 },
  { id: 'flexible', label: 'Flexible', min: 200, max: 2500, note: 'No limit' },
]

export const budgetLimits = { min: 200, max: 2500, step: 50 }

// Share of a traveler's total budget each category typically takes in Barcelona in March.
// The breakdown on the budget screen is computed from the traveler's own range.
export const breakdown = [
  { id: 'flights', label: 'Flights', share: 0.45, icon: '✈' },
  { id: 'stay', label: 'Accommodation', sub: 'per person, shared', share: 0.28, icon: '⌂' },
  { id: 'activities', label: 'Activities', share: 0.12, icon: '◎' },
  { id: 'food', label: 'Food & transit', share: 0.15, icon: '◇' },
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
}

// Other travelers' arrival hours (local BCN time) for the timeline.
// Only arrival times are shown, never origins or costs (audit fix C1).
export const groupArrivals = [
  { initial: 'D', name: 'Dev', hour: 8 + 35 / 60, color: '#A84E14' },
  { initial: 'P', name: 'Priya', hour: 8 + 40 / 60, color: '#8B61B8' },
  { initial: 'A', name: 'Alex', hour: 9.75, color: '#4A7A86' },
  { initial: 'J', name: 'Jamie', hour: 9 + 50 / 60, color: '#5A7796' },
]

// ---------- Organizer flow ----------
export const features = [
  { id: 'dates', title: 'Date alignment, automated', body: 'No more Doodle polls or 47-message group chats. Romi finds the windows that work.' },
  { id: 'flights', title: 'Multi-origin flights', body: 'Group flying from different cities? Romi syncs arrivals so you land together.' },
  { id: 'budget', title: 'Anonymous budgets', body: 'Everyone sets a private number. No awkward money talk, no peer pressure.' },
  { id: 'nudges', title: 'Automated nudges', body: "Romi follows up with non-responders so you don't have to play group-chat sheriff." },
]

export const occasions = [
  { id: 'fun', label: 'Just for fun', emoji: '🎉' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'bachelorette', label: 'Bachelorette', emoji: '💍' },
  { id: 'family', label: 'Family trip', emoji: '🏡' },
  { id: 'work', label: 'Work offsite', emoji: '💼' },
  { id: 'other', label: 'Other', emoji: '✨' },
]

export const dateModes = [
  { id: 'specific', label: 'Specific dates' },
  { id: 'season', label: 'A month or season' },
  { id: 'open', label: 'Wide open' },
]

export const durations = [
  { id: 'weekend', label: 'Weekend', note: '2 nights' },
  { id: 'long', label: '3–4 days', note: 'long weekend' },
  { id: 'week', label: '1 week', note: '7 nights' },
  { id: 'two', label: '2 weeks', note: '14 nights' },
  { id: 'custom', label: 'Custom', note: 'pick nights' },
]

export const constraintsList = [
  { id: 'weekend', label: 'Must include a full weekend', passes: 8 },
  { id: 'noRedEye', label: 'No red-eye flights', passes: 10 },
  { id: 'holidays', label: 'Avoid US school holiday weeks', passes: 9 },
]

export const tools = [
  { id: 'dates', label: 'Dates', body: 'Find windows that work for everyone.', tag: 'Recommended' },
  { id: 'flights', label: 'Flights', body: 'Coordinate multi-origin flights and arrivals.', tag: 'Recommended' },
  { id: 'budget', label: 'Budget', body: 'Align spending without revealing numbers.', tag: 'Recommended' },
  { id: 'stays', label: 'Stays', body: 'Group accommodation search and voting.', tag: 'Add anytime' },
  { id: 'itinerary', label: 'Itinerary', body: 'Day-by-day planning and activity voting.', tag: 'Add anytime' },
  { id: 'expenses', label: 'Expenses', body: 'Track and split costs during the trip.', tag: 'Add anytime' },
]

// Everyone in the group. Marcus's dates, budget and flight status come from the
// traveler flow at runtime, so submitting there updates the organizer screens.
export const people = [
  { id: 'alex', name: 'Alex Chen', initial: 'A', color: '#4A7A86', contact: 'alex@email.com', you: true, joined: 'yes', availability: { A: 'yes', B: 'yes', C: 'yes' }, budget: 'done', flight: true, note: 'Organizer' },
  { id: 'marcus', name: 'Marcus Bell', initial: 'M', color: '#4B7C6F', contact: 'marcus.b@email.com', joined: 'yes', note: 'Joined 2d ago' },
  { id: 'priya', name: 'Priya Shah', initial: 'P', color: '#8B61B8', contact: '+1 (415) 555-0148', joined: 'yes', availability: { A: 'maybe', B: 'yes', C: 'no' }, budget: 'skipped', flight: true, note: 'Skipped budget for now' },
  { id: 'dev', name: 'Dev Patel', initial: 'D', color: '#A84E14', contact: 'dev.patel@email.com', joined: 'yes', availability: { A: 'yes', B: 'no', C: 'maybe' }, budget: 'pending', flight: false, note: 'Joined 3d ago · last reminded 18h ago' },
  { id: 'jamie', name: 'Jamie Wu', initial: 'J', color: '#5A7796', contact: 'jamie@email.com', joined: 'not-opened', availability: {}, budget: 'pending', flight: false, note: "Hasn't opened the link yet. Try another channel." },
]

// Package A matches the traveler's flight on the approval screen.
// Organizer view: everyone's arrival time is visible, other people's cost is not (audit fix C1).
export const packages = [
  {
    id: 'A', title: 'Best alignment', match: 96, total: 2882, avg: 576, spread: '1h 15m', pick: true,
    summary: 'All 5 land at BCN between 8:35 AM – 9:50 AM on Mar 15. Tightest cluster of any package.',
    flights: [
      { who: 'alex', departs: '7:20 PM', duration: '8h 25m', stops: 'non-stop', arrives: '9:45 AM', airline: 'Iberia', cost: 612 },
      { who: 'marcus', departs: '1:10 PM', duration: '13h 05m', stops: '1 stop · MAD', arrives: '9:15 AM', airline: 'Iberia', cost: 487 },
      { who: 'priya', departs: '8:50 AM', duration: '14h 50m', stops: '1 stop · LHR', arrives: '8:40 AM', airline: 'British Airways', cost: 671, note: 'Longest travel day in the group (14h 50m with a London stop)' },
      { who: 'dev', departs: '4:30 PM', duration: '9h 05m', stops: 'non-stop', arrives: '8:35 AM', airline: 'Iberia', cost: 594 },
      { who: 'jamie', departs: '8:15 PM', duration: '7h 35m', stops: 'non-stop', arrives: '9:50 AM', airline: 'Level', cost: 518 },
    ],
  },
  {
    id: 'B', title: 'Cheapest total', match: 78, total: 2440, avg: 488, spread: '4h 10m',
    summary: 'Group total $2,440 · 1 traveler arrives 4h before the others.',
    flights: [
      { who: 'alex', arrives: '6:05 AM' }, { who: 'marcus', arrives: '9:15 AM' }, { who: 'priya', arrives: '10:15 AM' },
      { who: 'dev', arrives: '9:40 AM' }, { who: 'jamie', arrives: '9:50 AM' },
    ],
  },
  {
    id: 'C', title: 'Most direct', match: 84, total: 3120, avg: 624, spread: '2h 20m', warning: '1 budget over',
    summary: 'All non-stop, but 1 traveler would go over their budget.',
    flights: [
      { who: 'alex', arrives: '9:45 AM' }, { who: 'marcus', arrives: '11:10 AM' }, { who: 'priya', arrives: '10:30 AM' },
      { who: 'dev', arrives: '8:50 AM' }, { who: 'jamie', arrives: '9:50 AM' },
    ],
  },
]

export const initialActivity = [
  { id: 'a1', who: 'priya', text: 'submitted availability', when: '8 min ago' },
  { id: 'a2', who: 'romi', text: 'auto-nudged Dev', when: '18 hrs ago' },
  { id: 'a3', who: 'marcus', text: 'joined the trip', when: '2 days ago' },
]
