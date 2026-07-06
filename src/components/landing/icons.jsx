export function EthMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 2v11.5l9.7 4.4L16 2z" fill="currentColor" opacity="0.55"/>
      <path d="M16 2L6.3 17.9 16 13.5V2z" fill="currentColor"/>
      <path d="M16 21.4v8.6l9.7-13.7-9.7 5.1z" fill="currentColor" opacity="0.55"/>
      <path d="M16 30v-8.6L6.3 16.3 16 30z" fill="currentColor"/>
      <path d="M16 19.5l9.7-5.7-9.7-4.4v10.1z" fill="currentColor" opacity="0.35"/>
      <path d="M6.3 13.8L16 19.5V9.4L6.3 13.8z" fill="currentColor" opacity="0.75"/>
    </svg>
  )
}

export function ChainlinkMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 3l11.3 6.5v13L16 29 4.7 22.5v-13L16 3z" fill="currentColor" opacity="0.15"/>
      <path d="M16 3l11.3 6.5v13L16 29 4.7 22.5v-13L16 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M16 10l6.5 3.75v7.5L16 25l-6.5-3.75v-7.5L16 10z" fill="currentColor"/>
    </svg>
  )
}

export function VaultMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M16 3l11 4.5v8c0 6.5-4.5 10.5-11 12.5-6.5-2-11-6-11-12.5v-8L16 3z"/>
      <path d="M12 15.5l3 3 5.5-6"/>
    </svg>
  )
}

export function MailIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5"/>
      <path d="M3 7l9 6 9-6"/>
    </svg>
  )
}

export function WalletIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
      <path d="M16 12h4"/>
      <circle cx="17" cy="12" r="1.2" fill="currentColor"/>
    </svg>
  )
}

export function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12l5 5L20 6"/>
    </svg>
  )
}

export function ArrowUpRight({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7"/>
      <path d="M9 7h8v8"/>
    </svg>
  )
}
