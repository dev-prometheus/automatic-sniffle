import Logomark from './Logomark'
import './Footer.css'

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || 'https://otusdtgateway.com'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <div className="foot-brand">
          <div className="foot-mark">
            <Logomark size={32} />
            <span className="foot-mark-text">OTUSDT Recovery</span>
            <span className="foot-chain">
              <span className="foot-chain-dot" />
              Ethereum
            </span>
          </div>
          <div className="foot-tag">
            The trustless recovery layer of the OTUSDT ecosystem.
          </div>
        </div>

        <div className="foot-cols">
          <div className="foot-col">
            <div className="foot-col-head">Protocol</div>
            <a href="#how" className="foot-link">How recovery works</a>
            <a href="#security" className="foot-link">Security model</a>
            <a href="#activity" className="foot-link">Recent recoveries</a>
          </div>

          <div className="foot-col">
            <div className="foot-col-head">Ecosystem</div>
            <a href={GATEWAY} target="_blank" rel="noreferrer" className="foot-link">
              OTUSDT Gateway
            </a>
            <a href="https://etherscan.io" target="_blank" rel="noreferrer" className="foot-link">
              Etherscan
            </a>
          </div>

          <div className="foot-col">
            <div className="foot-col-head">Legal</div>
            <a href="#" className="foot-link">Terms of use</a>
            <a href="#" className="foot-link">Privacy</a>
            <a href="#" className="foot-link">Risk disclosure</a>
          </div>
        </div>
      </div>

      <div className="foot-rule" />

      <div className="foot-bottom">
        <div className="foot-copy">© {new Date().getFullYear()} OTUSDT Recovery. All rights reserved.</div>
        <div className="foot-disclaimer">
          Recovery is available only for records pre-approved through off-chain verification. Cryptocurrency involves risk. Nothing on this page is financial advice.
        </div>
      </div>
    </footer>
  )
}
