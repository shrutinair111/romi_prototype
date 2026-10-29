import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logoOnDark from '../assets/romi-logo-on-dark.png'
import logoOnLight from '../assets/romi-logo-on-light.png'

// Brand wordmark exported from the Figma file (both variants have transparent backgrounds).
export function Logo({ onDark = false, height = 44 }) {
  return (
    <img
      className="logo"
      src={onDark ? logoOnDark : logoOnLight}
      alt="Romi"
      height={height}
      width={Math.round(height * (560 / 176))}
    />
  )
}

export function Avatar({ person, size = 'md', label }) {
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ background: person.color }}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {person.initial}
    </span>
  )
}

export function Button({ to, variant = 'primary', size, children, className = '', ...props }) {
  const cls = `btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  )
}

export function Eyebrow({ children, as: Tag = 'p', id }) {
  return (
    <Tag className="eyebrow" id={id}>
      {children}
    </Tag>
  )
}

export function Note({ tone = 'success', icon = 'lock', children }) {
  return (
    <div className={`note note--${tone}`}>
      {icon === 'lock' && (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )}
      {icon === 'info' && (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 11v6M12 7.5h.01" />
        </svg>
      )}
      {icon === 'warn' && <span aria-hidden="true">⚠</span>}
      <div>{children}</div>
    </div>
  )
}

export function ErrorText({ id, children }) {
  return (
    <p id={id} className="field__error">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6M12 17h.01" />
      </svg>
      {children}
    </p>
  )
}

// Toggletip: explains jargon like "Fit score" (Nielsen #2, #10). Click or Enter opens,
// Esc or moving focus away closes. The text is announced through a live region.
export function InfoTip({ label, children }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])
  return (
    <span className="infotip" ref={ref}>
      <button
        type="button"
        className="infotip__btn"
        aria-label={`What is ${label}?`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        i
      </button>
      <span id={id} role="status" className="infotip__bubble" hidden={!open}>
        {open && (
          <>
            <strong>{label}</strong> {children}
          </>
        )}
      </span>
    </span>
  )
}

// Accessible modal: focus moves in, Tab is trapped, Esc closes, focus returns
// to the trigger. Centered dialog on desktop, bottom sheet on mobile.
export function Dialog({ open, onClose, labelledBy, describedBy, children, initialFocusRef }) {
  const panelRef = useRef(null)
  const returnTo = useRef(null)
  // Keep the latest onClose without re-running the effect (re-running would steal focus while typing).
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement
    const panel = panelRef.current
    const focusables = () =>
      panel.querySelectorAll('button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ;(initialFocusRef?.current || focusables()[0])?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
      }
      if (e.key === 'Tab') {
        const items = Array.from(focusables())
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      // If the trigger is gone (e.g. the page changed), skip restoring focus.
      if (returnTo.current?.isConnected) returnTo.current.focus()
    }
  }, [open, initialFocusRef])

  if (!open) return null
  return (
    <div className="dialog-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        ref={panelRef}
      >
        <div className="dialog__grabber" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

// Polite live-region toast with an optional action (e.g. Undo). Rendered once in App.
export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 10000)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.key}>
          <span>{toast.message}</span>
          {toast.actionLabel && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.onAction?.()
                onDismiss()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
          <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={onDismiss}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export function Switch({ checked, onChange, labelledBy, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}
