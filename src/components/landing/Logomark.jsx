export default function Logomark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 3L34 11v18l-14 8-14-8V11l14-8z"
        fill="var(--bg-card)"
        stroke="var(--purple-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13 20l5-5v3h9v4h-9v3l-5-5z"
        fill="var(--orange)"
      />
      <circle cx="20" cy="20" r="12.5" stroke="var(--orange-hair)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
    </svg>
  )
}
