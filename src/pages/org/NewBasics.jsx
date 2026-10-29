import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardLayout from '../../components/WizardLayout.jsx'
import { ErrorText, Eyebrow } from '../../components/ui.jsx'
import { occasions } from '../../data.js'
import { useApp } from '../../state.jsx'

export function BoardingPreview({ rows }) {
  const { draft } = useApp()
  const occ = occasions.find((o) => o.id === draft.occasion)
  return (
    <>
      <p className="eyebrow">Live preview</p>
      <div className="preview-pass" aria-label="Preview of the card travelers will see" role="group">
        <span className="pill pill--outline">Boarding pass · Draft</span>
        <p className="preview-pass__name">{draft.name.trim() || 'Untitled trip'}</p>
        <p className="preview-pass__dest">
          {draft.destination ? (
            <>
              <span aria-hidden="true">🇪🇸 </span>
              {draft.destination}
            </>
          ) : (
            'Destination to be decided'
          )}
          {occ && <span> · {occ.label}</span>}
        </p>
        <dl className="preview-pass__rows">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="muted small">Travelers see this card the moment you share an invite link, even before you finish setup.</p>
    </>
  )
}

// TM-02 · Trip basics
export default function NewBasics() {
  const { draft, setDraft } = useApp()
  const [error, setError] = useState('')
  const [destInput, setDestInput] = useState('')
  const navigate = useNavigate()

  const next = () => {
    if (!draft.name.trim()) {
      setError('Give your trip a name so travelers recognize it.')
      document.getElementById('trip-name')?.focus()
      return
    }
    navigate('/new/dates')
  }

  return (
    <WizardLayout
      step={0}
      onNext={next}
      aside={<BoardingPreview rows={[['Dates', 'Step 2 →'], ['Travelers', 'Step 3 →'], ['Planning tools', 'Step 4 →']]} />}
    >
      <Eyebrow>Step 1 of 4 · Basics</Eyebrow>
      <h1>Let's start with the basics.</h1>
      <p className="lede">Three quick answers and we'll create your trip. You can change anything later.</p>

      <div className="field">
        <label htmlFor="trip-name" className="field__label">Trip name</label>
        <input
          id="trip-name"
          className="input input--lg"
          value={draft.name}
          onChange={(e) => {
            setDraft({ ...draft, name: e.target.value })
            setError('')
          }}
          aria-invalid={!!error}
          aria-describedby={error ? 'trip-name-error' : 'trip-name-hint'}
        />
        {error ? (
          <ErrorText id="trip-name-error">{error}</ErrorText>
        ) : (
          <p id="trip-name-hint" className="field__hint">e.g. "Maya's bachelorette," "Annual ski trip," "Work offsite Q3"</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="destination" className="field__label">Destination</label>
        <div className="token-input">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {draft.destination ? (
            <span className="token">
              <span aria-hidden="true">🇪🇸</span> {draft.destination}
              <button
                type="button"
                className="token__remove"
                aria-label={`Remove ${draft.destination}`}
                onClick={() => {
                  setDraft({ ...draft, destination: '' })
                  setTimeout(() => document.getElementById('destination')?.focus(), 0)
                }}
              >
                ×
              </button>
            </span>
          ) : null}
          <input
            id="destination"
            className="token-input__field"
            placeholder={draft.destination ? '' : 'Search a city or country'}
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && destInput.trim()) {
                e.preventDefault()
                setDraft({ ...draft, destination: destInput.trim() })
                setDestInput('')
              }
            }}
            aria-describedby="destination-hint"
          />
        </div>
        <p id="destination-hint" className="field__hint">Press Enter to add. Not sure yet? You can leave this blank.</p>
      </div>

      <fieldset>
        <legend className="field__label">What's the occasion?</legend>
        <div className="chip-row">
          {occasions.map((o) => (
            <label key={o.id} className="chip">
              <input type="radio" name="occasion" checked={draft.occasion === o.id} onChange={() => setDraft({ ...draft, occasion: o.id })} />
              <span className="chip__label">
                <span aria-hidden="true">{o.emoji} </span>
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </WizardLayout>
  )
}
