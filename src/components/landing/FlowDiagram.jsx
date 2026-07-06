import './FlowDiagram.css'

export default function FlowDiagram() {
  return (
    <section className="flow" id="flow">
      <div className="flow-bg" aria-hidden />
      <div className="flow-inner">
        <div className="flow-head">
          <div className="flow-eyebrow">Architecture</div>
          <h2 className="flow-title">
            One transaction.<br />
            <span className="flow-title-mute">Multiple guarantees.</span>
          </h2>
        </div>

        <div className="flow-diagram flow-desktop">
          <svg viewBox="0 0 960 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Recovery flow architecture">
            <defs>
              <marker id="arrH" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M2 2L8 5L2 8" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </marker>
              <marker id="arrO" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M2 2L8 5L2 8" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </marker>
              <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M2 2L8 5L2 8" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </marker>
            </defs>

            {/* Chainlink oracle top */}
            <g>
              <rect x="410" y="20" width="140" height="56" rx="10" fill="var(--bg-card)" stroke="var(--purple-hair)" strokeWidth="1"/>
              <text x="480" y="42" textAnchor="middle" fill="var(--purple-ink)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">CHAINLINK</text>
              <text x="480" y="60" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="13" fontWeight="500">ETH / USD oracle</text>
            </g>
            <line x1="480" y1="76" x2="480" y2="150" stroke="var(--ink-5)" strokeDasharray="3 4" strokeWidth="1"/>

            {/* User wallet left */}
            <g>
              <rect x="30" y="170" width="180" height="86" rx="12" fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="120" y="196" textAnchor="middle" fill="var(--ink-4)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">USER</text>
              <text x="120" y="218" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="14" fontWeight="500">Your wallet</text>
              <text x="120" y="238" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize="10">0x...</text>
            </g>

            {/* Recovery contract center */}
            <g>
              <rect x="360" y="150" width="240" height="130" rx="14" fill="var(--bg-card-2)" stroke="var(--orange-hair)" strokeWidth="1.5"/>
              <text x="480" y="178" textAnchor="middle" fill="var(--orange-ink)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">PROTOCOL</text>
              <text x="480" y="204" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="16" fontWeight="600">GE-AS Contract</text>
              <text x="480" y="228" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-body)" fontSize="12">Validates wallet · Prices fee</text>
              <text x="480" y="246" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-body)" fontSize="12">Pulls tokens · Emits proof</text>
              <rect x="440" y="256" width="80" height="18" rx="9" fill="var(--orange-wash)" stroke="var(--orange-hair)"/>
              <text x="480" y="269" textAnchor="middle" fill="var(--orange-ink)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2">ETHEREUM</text>
            </g>

            {/* Treasury right */}
            <g>
              <rect x="750" y="170" width="180" height="86" rx="12" fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth="1"/>
              <text x="840" y="196" textAnchor="middle" fill="var(--ink-4)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">SOURCE</text>
              <text x="840" y="218" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="14" fontWeight="500">USDT Treasury</text>
              <text x="840" y="238" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize="10">Approved spender</text>
            </g>

            {/* ETH fee: User → Contract (top-mid) */}
            <line x1="215" y1="200" x2="355" y2="200" stroke="var(--orange)" strokeWidth="1.5" markerEnd="url(#arrO)"/>
            <text x="285" y="190" textAnchor="middle" fill="var(--orange-ink)" fontFamily="var(--font-mono)" fontSize="10">1. ETH fee</text>

            {/* transferFrom: Contract → Treasury (top-mid) */}
            <line x1="605" y1="200" x2="745" y2="200" stroke="var(--ink-4)" strokeWidth="1.2" strokeDasharray="4 4" markerEnd="url(#arrH)"/>
            <text x="675" y="190" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)" fontSize="10">2. transferFrom</text>

            {/* USDT delivered: routed below all boxes back to user */}
            <path d="M 840 260 L 840 340 L 120 340 L 120 260" fill="none" stroke="var(--success)" strokeWidth="1.5" markerEnd="url(#arrG)"/>
            <text x="480" y="332" textAnchor="middle" fill="var(--success)" fontFamily="var(--font-mono)" fontSize="10">3. USDT delivered to wallet</text>

            {/* Footer strip */}
            <line x1="30" y1="390" x2="930" y2="390" stroke="var(--border)" strokeWidth="1"/>
            <text x="30" y="418" fill="var(--ink-4)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">SINGLE ATOMIC TRANSACTION</text>
            <text x="30" y="438" fill="var(--ink-3)" fontFamily="var(--font-body)" fontSize="12">Fee, validation, and delivery either all succeed or all revert.</text>
            <text x="930" y="438" textAnchor="end" fill="var(--ink-5)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">MAINNET</text>
          </svg>
        </div>

        {/* Mobile: stacked steps */}
        <div className="flow-mobile">
          <div className="flow-m-oracle">
            <span className="flow-m-tag">Chainlink</span>
            ETH / USD oracle
          </div>
          <div className="flow-m-line" />

          <div className="flow-m-step">
            <div className="flow-m-node">
              <span className="flow-m-tag">User</span>
              Your wallet
            </div>
            <div className="flow-m-arrow orange">↓ ETH fee</div>
            <div className="flow-m-node primary">
              <span className="flow-m-tag orange">Protocol</span>
              Recovery Contract
              <div className="flow-m-sub">Validates · Prices · Pulls · Emits</div>
            </div>
            <div className="flow-m-arrow">↓ transferFrom</div>
            <div className="flow-m-node">
              <span className="flow-m-tag">Source</span>
              USDT Treasury
            </div>
            <div className="flow-m-arrow green">↓ USDT delivered</div>
            <div className="flow-m-node">
              <span className="flow-m-tag">User</span>
              Your wallet (received)
            </div>
          </div>

          <div className="flow-m-footer">
            <div className="flow-m-tag">Single atomic transaction</div>
            <div className="flow-m-fine">Fee, validation, and delivery either all succeed or all revert.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
