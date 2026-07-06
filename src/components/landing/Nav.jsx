import Logomark from './Logomark'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-mark">
          <Logomark size={30} />
          <span className="nav-mark-text">GE-AS Portal</span>
        </a>

        <div className="nav-right">
          <a href="#how" className="nav-link">Process</a>
          <a href="#flow" className="nav-link">Architecture</a>
          <a href="#security" className="nav-link">Security</a>
        </div>
      </div>
    </nav>
  )
}
