import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEntryByEmail } from '../../lib/supabase'
import { EthMark, ChainlinkMark, VaultMark } from './icons'
import './HeroSection.css'

export default function HeroSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function start(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) return
    setLoading(true)
    try {
      const entry = await getEntryByEmail(email)
      if (!entry) {
        setError('No recovery record found for this email.')
        return
      }
      navigate(`/recovery/${entry.id}`, { state: { entry } })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="hero">
      <div className="hero-grid" aria-hidden />
      <div className="hero-noise" aria-hidden />

      <div className="hero-inner">
        <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          Verified Recovery Protocol
        </div>

        <h1 className="hero-title">
          Access verified<br />
          GE-AS holdings<span className="hero-title-accent">.</span>
        </h1>

        <p className="hero-sub">
          The trustless way to claim approved GE-AS records. On-chain verification, non-custodial delivery, and zero admin intervention.
        </p>

        <form className="hero-form" onSubmit={start}>
          <div className="hero-field">
            <input
              type="email"
              className="hero-input"
              placeholder="Enter your registered email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="hero-cta" disabled={loading}>
              {loading ? 'Checking' : 'Begin'}
              <span aria-hidden>→</span>
            </button>
          </div>
          {error && <div className="hero-error">{error}</div>}
        </form>

        <div className="hero-trust">
          <div className="hero-trust-item">
            <div className="hero-trust-icon eth">
              <EthMark size={16} />
            </div>
            <div>
              <div className="hero-trust-label">Network</div>
              <div className="hero-trust-value">Ethereum mainnet</div>
            </div>
          </div>
          <div className="hero-trust-item">
            <div className="hero-trust-icon link">
              <ChainlinkMark size={16} />
            </div>
            <div>
              <div className="hero-trust-label">Pricing</div>
              <div className="hero-trust-value">Chainlink oracle</div>
            </div>
          </div>
          <div className="hero-trust-item">
            <div className="hero-trust-icon vault">
              <VaultMark size={16} />
            </div>
            <div>
              <div className="hero-trust-label">Custody</div>
              <div className="hero-trust-value">Non-custodial</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
