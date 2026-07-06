import './Security.css'

const FLAGSHIP = {
  label: 'Core guarantee',
  title: 'Every recovery is bound to a specific wallet, verified on-chain.',
  body: 'Recovery records are pre-approved off-chain and locked to a single destination address. The contract will reject any other caller, even if they hold the record. No admin can transfer, override, or redirect a claim mid-flight.'
}

const PRIMITIVES = [
  {
    label: 'Custody',
    title: 'Non-custodial delivery',
    body: 'Tokens move directly from treasury to your wallet in a single transaction.'
  },
  {
    label: 'Pricing',
    title: 'Chainlink oracle',
    body: 'Fees settle at live ETH / USD rates at the moment of claim.'
  },
  {
    label: 'Auditability',
    title: 'Public event log',
    body: 'Every approval, fee, and disbursement resolves on Ethereum with permanent proof.'
  }
]

export default function Security() {
  return (
    <section className="sec" id="security">
      <div className="sec-inner">
        <div className="sec-head">
          <div className="sec-eyebrow">Security</div>
          <h2 className="sec-title">Built on trustless primitives.</h2>
          <p className="sec-sub">
            The recovery flow is security-critical. Every design choice removes an attack surface or a point of trust in a human operator.
          </p>
        </div>

        <div className="sec-flagship">
          <div className="sec-flag-label">{FLAGSHIP.label}</div>
          <div className="sec-flag-title">{FLAGSHIP.title}</div>
          <div className="sec-flag-body">{FLAGSHIP.body}</div>
        </div>

        <div className="sec-grid">
          {PRIMITIVES.map(p => (
            <div key={p.label} className="sec-card">
              <div className="sec-card-label">{p.label}</div>
              <div className="sec-card-title">{p.title}</div>
              <div className="sec-card-body">{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
