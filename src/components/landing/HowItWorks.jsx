import './HowItWorks.css'

const STEPS = [
  {
    n: '01',
    title: 'Enter your email',
    body: 'We look up your verified recovery record against the on-chain registry.'
  },
  {
    n: '02',
    title: 'Connect your wallet',
    body: 'Only the wallet tied to the original approved record can proceed. Others are rejected.'
  },
  {
    n: '03',
    title: 'Approve the claim',
    body: 'Confirm the claim. The protocol fee is deducted in ETH and your USDT is sent to your wallet.'
  }
]

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how-inner">
        <div className="how-head">
          <div className="how-eyebrow">Process</div>
          <h2 className="how-title">Three steps. One transaction.</h2>
        </div>

        <div className="how-grid">
          {STEPS.map(s => (
            <div key={s.n} className="how-card">
              <div className="how-num">{s.n}<span className="how-num-slash">/03</span></div>
              <div className="how-card-title">{s.title}</div>
              <div className="how-card-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
