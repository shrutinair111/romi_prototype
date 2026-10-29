import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export function Logo({ onDark = false }) {
  return (
    <span className={`logo ${onDark ? 'logo--dark' : ''}`} aria-label="Romi">
      <span aria-hidden="true">Romi</span>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      </svg>
    </span>
  )
}

export function Button({ to, variant = 'primary', children, className = '', ...props }) {
  const cls = `btn btn--${variant} ${className}`
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

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>
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
      <div>{children}</div>
    </div>
  )
}

// Accessible modal: focus moves in, Tab is trapped, Esc closes, focus returns
// to the trigger. Renders as a centered dialog on desktop, a bottom sheet on mobile.
export function Dialog({ open, onClose, labelledBy, describedBy, children, initialFocusRef }) {
  const panelRef = useRef(null)
  const returnTo = useRef(null)

  useEffect(() => {
    if (!open) return
    returnTo.current = document.activeElement
    const panel = panelRef.current
    const focusables = () =>
      panel.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ;(initialFocusRef?.current || focusables()[0])?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
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
      returnTo.current?.focus?.()
    }
  }, [open, onClose, initialFocusRef])

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

// Polite live region toast with an optional action (e.g. Undo).
export function Toast({ message, actionLabel, onAction, onDismiss }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, 10000)
    return () => clearTimeout(t)
  }, [message, onDismiss])
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message && (
        <div className="toast">
          <span>{message}</span>
          {actionLabel && (
            <button type="button" className="toast__action" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
